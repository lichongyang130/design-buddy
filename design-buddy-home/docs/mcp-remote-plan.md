# 远程 MCP 服务接入方案

> 目标：连接器页里的「连接」不再是本地引擎自演，而是**真的按 MCP 协议打到远端服务**，拿回服务端身份、工具清单和真实调用结果；连不上就明确失败，不伪造在线状态。
>
> 现状：连接/握手/凭据/审计都是真的，但传输层固定是 `local`。要跨到远端，必须解决三件事：**浏览器 CORS**、**凭据不能进前端**、**MCP 协议有会话与版本差异**。所以方案的核心是加一个同源的 Node 网关。

---

## 1. 为什么不能浏览器直连

| 维度 | 浏览器直连远端 MCP | 同源网关（推荐） |
| --- | --- | --- |
| CORS | 绝大多数 MCP 服务不给你 `Access-Control-Allow-Origin`，预检就挂 | 网关服务端发请求，无 CORS |
| 凭据 | token 必须放 localStorage / JS 内存，XSS 一次全丢 | token 只存在服务端，前端只拿指纹 |
| `Accept: text/event-stream` | 部分代理/浏览器组合下流式响应被缓冲 | 服务端可正常读 SSE |
| 老版 SSE 传输（GET 长连接） | 页面卸载即断，且受 CORS 限制 | 网关可长连、可重连 |
| stdio（本地进程） | 浏览器完全不可达 | 网关可 `spawn` |
| 审计 | 只有前端日志，可被篡改 | 网关侧留请求 ID / 状态码 / 字节数 |

**结论：加网关。** 部署形态从「纯静态」变成「Node 静态服务 + 同源 `/api/mcp`」，`server.mjs` 已经在了，不需要新框架、不需要新依赖。

---

## 2. 目标架构

```
┌─────────────────────────── 浏览器（同源） ───────────────────────────┐
│ 连接器页 / 设置页                                                     │
│   ├─ 接入表单：名称 / MCP 地址 / 认证 / 内网信任 / 超时                 │
│   ├─ 卡片：远端已连 · 协议 2026-07-28 · 12 个工具 · 握手 84 ms         │
│   └─ 工具面板：tools/list 渲染参数表单 → tools/call → 结果 / 产物       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ fetch('/api/mcp/...')  同源，无 CORS
┌───────────────────────────────▼──────────────────────────────────────┐
│ Node 网关（server.mjs）                                               │
│   api.mjs          路由 / JSON / 同源校验 / 限额 / 错误映射            │
│   mcp-client.mjs   协议：2026-07-28 无状态 + ≤2025-11-25 会话 + SSE     │
│   mcp-registry.mjs 配置落盘 .data/、token 加密、指纹、日志环            │
│   mcp-oauth.mjs    P3：PRM 发现 / PKCE / CIMD / DCR / 刷新             │
└──────────┬───────────────────────────────────────┬───────────────────┘
           │ HTTPS POST（JSON 或 SSE）              │ stdio（可选）
    ┌──────▼──────┐                          ┌─────▼──────┐
    │ 远端 MCP     │                          │ 本地 MCP    │
    │ 2026-07-28   │                          │ 子进程      │
    │ 2025-11-25…  │                          └────────────┘
    └─────────────┘
```

---

## 3. 协议实现范围（关键：现在有两代协议）

截至 2026-10，MCP 现行版本是 **2026-07-28**，它是**无状态**的：没有 `initialize` 握手、没有 `Mcp-Session-Id`。而市面上大量服务仍是 **2025-11-25 及更早**的会话式实现。**两者都必须支持**，否则「真连」只能连到一半生态。

### 3.1 现代（2026-07-28，优先尝试）

每个请求独立带版本、客户端身份与能力：

```http
POST /mcp HTTP/1.1
Content-Type: application/json
Accept: application/json, text/event-stream
MCP-Protocol-Version: 2026-07-28
Mcp-Method: server/discover

{"jsonrpc":"2.0","id":"d1","method":"server/discover","params":{"_meta":{
  "io.modelcontextprotocol/protocolVersion":"2026-07-28",
  "io.modelcontextprotocol/clientInfo":{"name":"Design Buddy","version":"1.0.0"},
  "io.modelcontextprotocol/clientCapabilities":{}
}}}
```

- 连接动作 = `server/discover` → 拿 `supportedVersions` / `capabilities` / `serverInfo` / `instructions`；再 `tools/list`。
- 调工具 = `tools/call`，同样带 `Mcp-Method: tools/call` 与 `Mcp-Name: <tool>`；若工具 schema 标了 `x-mcp-header`，还要按规范把参数镜像成 `Mcp-Param-*` 头（P2 再做）。
- 版本不匹配：服务端返回 400 + `UnsupportedProtocolVersionError`（附 `supportedVersions`），按交集降级重试一次。

### 3.2 旧版（2025-03-26 … 2025-11-25，回退）

```
POST initialize           → result.protocolVersion + 响应头 Mcp-Session-Id
POST notifications/initialized → 202
POST tools/list           → 带 Mcp-Session-Id + MCP-Protocol-Version
```

会话 ID 必须逐请求回传；`DELETE` 结束会话（断开连接时调用）。

### 3.3 更老的 HTTP+SSE（2024-11-05，P3 / 可选）

探测方式：现代 POST 返回 400/404/405 且**不是**结构化 JSON-RPC 错误时，GET 端点等 `event: endpoint`；拿到消息地址后所有请求 POST 过去、响应从 GET 流里读。建议先不做，只在 UI 上明确报「该服务版本过旧」。

### 3.4 协商流程（网关内部）

```
try   modern POST server/discover (2026-07-28)
  ├─ 200 + JSON/SSE          → mode=stateless, version=2026-07-28
  ├─ 400 UnsupportedProtocolVersion → 取交集（2026-07-28 > 2025-11-25 > 2025-06-18 > 2025-03-26）重试
  ├─ 401/403                 → 授权失败（不降级，直接报）
  └─ 400/404/405 非 JSON-RPC → try legacy initialize
        ├─ 200                → mode=session（记 sessionId）
        ├─ 400/404/405        → try HTTP+SSE 或报「版本不兼容」
        └─ 401/403            → 授权失败
缓存协商结果；之后每次握手若失败，清缓存并重新协商一次。
```

---

## 4. 网关 API

统一前缀 `/api/mcp`，全部同源、`Content-Type: application/json`，错误统一：

```json
{ "ok": false, "error": { "code": "MCP_AUTH", "message": "远端返回 401：需要授权", "status": 401, "requestId": "req_..." } }
```

| 方法 | 路径 | 作用 | 返回（不含任何密钥） |
| --- | --- | --- | --- |
| GET | `/servers` | 已接入服务列表 | `[{id,label,url,authMode,fingerprint,serverInfo,protocolVersion,transport,toolCount,lastCheck}]` |
| POST | `/servers` | 新增并**立即真握手** | 同上 + `tools[]` + `handshake{ms,requestId}`；失败不落库 |
| PATCH | `/servers/:id` | 改名称 / 换凭据（换完重握手） | 同 GET 单项 |
| DELETE | `/servers/:id` | 移除，并尽量 `DELETE` 远端会话 | `{ok:true}` |
| POST | `/servers/:id/handshake` | 重新 discover + tools/list | `{ok,ms,protocolVersion,transport,serverInfo,capabilities,tools,toolCount,requestId}` |
| POST | `/servers/:id/call` | `tools/call` | `{ok,ms,isError,content,structuredContent,artifacts,bytes,requestId}` |
| GET | `/servers/:id/logs` | 该服务最近调用 | `[{at,method,status,ms,bytes,requestId}]`（脱敏） |

请求体示例（新增）：

```json
{
  "label": "内部知识库",
  "url": "https://mcp.example.com/mcp",
  "auth": { "mode": "bearer", "token": "sk-..." },
  "allowPrivate": false,
  "timeoutMs": 15000
}
```

`auth.mode`：`none` / `bearer` / `header`（自定义头名，如 `X-Api-Key`）。P3 增加 `oauth`。

---

## 5. 数据与安全

### 5.1 服务端

`.data/mcp-servers.json`（0600，`.gitignore` 排除）：

```json
{
  "id": "srv_7f3a",
  "label": "内部知识库",
  "url": "https://mcp.example.com/mcp",
  "auth": { "mode": "bearer", "fingerprint": "9c1e77a0b2d4", "sealed": { "iv": "...", "tag": "...", "ct": "..." } },
  "allowPrivate": false,
  "createdAt": 1793000000000,
  "protocol": { "mode": "stateless", "version": "2026-07-28" },
  "tools": [{ "name": "search", "description": "…", "inputSchema": { "…": "…" } }]
}
```

- **token 加密**：AES-256-GCM，密钥来自 `MCP_SECRET`（scrypt 派生）；未设环境变量时生成 `.data/key`（0600）并提示「本地密钥，仅适合单机」。
- 前端只拿到 `fingerprint = sha256(token).slice(0,12)` 与掩码，**任何 GET 都不返回原文**。
- 日志环（200 条）只记 method / status / ms / bytes / requestId，不记 headers、不记 body（避免 token / 业务数据外泄）。

### 5.2 网关自我保护

| 风险 | 措施 |
| --- | --- |
| CSRF / DNS rebinding | 校验 `Origin`（存在时必须同源）+ 要求自定义头 `X-DB-Client: design-buddy`（浏览器跨站需预检，直接拒）；不返回任何 CORS 头 |
| SSRF | 只允许 `https`（`http` 仅本地/内网且显式勾选）；`dns.lookup` 后拒绝 loopback / 私网 / link-local / 169.254.169.254，除非 `allowPrivate`；`redirect: 'manual'`，跨源跳转一律拒绝 |
| 大响应 / 慢服务 | 响应上限 8 MB、请求体上限 256 KB、握手 10 s / 调用 30 s（可配），超出即 `MCP_TIMEOUT` / `MCP_TOO_LARGE` |
| 资源耗尽 | 最多 32 个服务；同时在途调用 ≤ 8；每个服务 1 次/秒限流 |
| 子进程（stdio） | 默认关闭，需 `MCP_STDIO=1` + 白名单命令；`spawn` 时 `shell:false`、限制 env、超时杀进程 |

### 5.3 前端

- localStorage 只存展示态：`{serverId, label, url, protocolVersion, transport, toolCount, lastCheck}` + 指纹，**不存 token**。
- 连接状态新语义：
  - `connected: true` **只能**由网关握手成功写入；
  - `lastCheck.transport = 'mcp-http' | 'mcp-sse' | 'mcp-stdio' | 'local'`；
  - 面板「传输」行显示 `远端 · https://mcp.example.com · 2026-07-28` 或 `本地引擎（真实执行）`，不再含糊。

---

## 6. 前端改造点

### 6.1 连接器页

- 「自定义连接器」升级为 **接入 MCP 服务**：名称、MCP 地址、认证（无 / Bearer / 自定义头）、信任内网、超时；按钮文案「测试并保存」——点击后真的发 `server/discover`，失败把具体原因写在输入框下（401 / 域名不存在 / TLS / 超时 / 版本不兼容），**不落库**。
- 接入成功后卡片新增：
  - `.cn-verified` → `远端已连 · 84 ms · 12 个工具`
  - 副行 → `ExampleServer 1.0.0 · MCP 2026-07-28`
- 面板：
  - 身份区：serverInfo、协议版本、传输方式、requestId；
  - **工具清单**（`tools/list` 真实数据）：名称 + 描述 + 参数必填项；
  - 点工具 → 按 `inputSchema` 生成表单（string / number / boolean / enum，其余走 JSON 编辑器）；
  - 「调用」→ 显示真实 content（text / json / image）、耗时、字节数、isError；可下载产物；
  - 调用记录写 `mcp-call`，带 method / status / ms / requestId。
- 「调用记录」合并三类来源：本地引擎、网关握手、工具调用，并可导出 JSON/CSV。

### 6.2 设置页

- 代理配置接网关：`HTTPS_PROXY` / `HTTP_PROXY` 环境变量优先；设置页的「自定义代理」用于**网关自检**（`POST /api/mcp/probe`），不再只是前端 fetch 同源文件。
- 新增「网关状态」卡：版本、已接入服务数、是否允许内网、stdio 是否开启。

### 6.3 其他入口

- 首页「连接器」浮层里，远端服务的图标与本地连接器区分（小地球角标）。
- 任何「已连接」文案都必须带 transport，不允许只写「已连接」。

---

## 7. 认证：分两步走

### P1（先做）：静态凭据

- `Authorization: Bearer <token>` 或自定义头。
- 保存前先真握手验证；401 直接把 `WWW-Authenticate` 的关键信息（如 `resource_metadata`）回给前端，提示「需要 OAuth」。

### P3（再做）：OAuth 2.1（现行 2026-07-28 授权规范）

1. 401 → 读 `WWW-Authenticate` 的 `resource_metadata`，或 `/.well-known/oauth-protected-resource`（RFC 9728）。
2. 从 PRM 取 `authorization_servers`，读 RFC 8414 / OIDC 发现；校验 `issuer` 与构造 well-known 的 issuer **完全一致**（RFC 9207）。
3. 客户端注册优先级：预注册 client → **CIMD**（HTTPS URL 作为 client_id）→ DCR（已废弃，仅兼容）。
4. 授权码 + PKCE（S256）+ `resource` 参数（RFC 8707）绑定目标 MCP；token 存服务端加密；
5. refresh token 轮换；换 token 后重握手。

> 说明：CIMD 要求客户端元数据托管在**公网 HTTPS**。本地预览（`localhost`）只能用预注册 client 或 DCR 回退；这一点会在 UI 上如实说明。

---

## 8. 测试方案（不依赖外网）

### 8.1 `tests/mock-mcp-server.mjs`（零依赖，可独立跑）

- 一个 Node HTTP 服务，同时实现三种模式：
  - `/modern/mcp`：2026-07-28 无状态，支持 JSON 与 SSE 两种响应；工具 `echo` / `add` / `slow` / `fail` / `big`；可要求 Bearer。
  - `/legacy/mcp`：2025-11-25 会话式，`initialize` 下发 `Mcp-Session-Id`，校验后续请求头。
  - `/broken/*`：401、404、返回非 JSON、超时、超大响应，用来测错误路径。
- 记录收到的每个请求（method / headers / body），供断言「网关真的发了什么」。

### 8.2 套件

| 套件 | 覆盖 |
| --- | --- |
| `verify-mcp-gateway.mjs` | 现代/旧版协商、SSE 解析、版本降级、401/404/超时/超大、SSRF 拦截、token 不回显、日志脱敏、requestId 一致 |
| `verify-mcp-ui.mjs` | 接入表单真握手、失败不落库、卡片/面板协议信息、tools/list 渲染、参数表单校验、tools/call 结果与产物、调用记录、刷新后状态保持 |
| `verify-connector-connect.mjs`（扩展） | 本地连接器行为不回归；远端与本地 transport 文案不混淆 |

关键断言（直接对应用户的「不许假」）：

- 网关 `GET /servers` 的响应体里**不含** token 原文（字符串搜索）；
- localStorage 里**不含** token；
- mock 服务收到 `server/discover` 且 `MCP-Protocol-Version` 与 `_meta` 一致；
- 旧版 mock 收到 `Mcp-Session-Id` 回传；
- 401 时前端**不得**出现「已连接」；
- `tools/call` 的返回内容与 mock 计算结果逐字一致；
- 断开后远端收到 `DELETE`（会话模式）。

---

## 9. 分阶段交付

| 阶段 | 内容 | 产出 | 规模 |
| --- | --- | --- | --- |
| **P0** | `server/api.mjs`、`mcp-client.mjs`（现代 + 旧版 Streamable HTTP）、`mcp-registry.mjs`、mock 服务、网关测试 | `curl /api/mcp/servers` 能真握手出工具清单 | 中 |
| **P1** | 接入表单、卡片/面板协议信息、错误文案、调用记录合并 | 页面上能接一个真实 MCP 并看到工具 | 中 |
| **P2** | tools/call、schema 表单、产物下载、`x-mcp-header`、限流与限额 | 能真正调用工具并拿到结果 | 中大 |
| **P3** | OAuth 2.1（PRM / PKCE / CIMD / DCR 回退）、stdio、2024-11 SSE | 完整生态覆盖 | 大（可拆） |

**验收标准（P0–P2）**

1. 断开网络后点连接：卡片保持未连接，错误写「DNS 解析失败 / 连接超时」，有 requestId。
2. 接一个 mock MCP：卡片显示真实 serverInfo、协议版本、工具数、握手耗时。
3. 调用 `add(2,3)`：结果 `5` 来自远端，耗时/字节数/requestId 都记录。
4. token 在 localStorage、页面 DOM、GET 响应、日志里都搜不到。
5. 刷新页面：服务配置还在（服务端），连接态与工具清单可重新握手恢复；前端不存 token。
6. 旧版 2025-11-25 mock 同样能接、能调。

---

## 10. 风险与已知限制

1. **沙箱出网白名单**：Arena 预览环境只允许 github / npm / pypi 等，连公网 MCP 会失败。方案用**本地 mock** 验证协议；真实服务请在你自己机器 `npm start` 后接，或在可出网的环境部署。
2. **部署形态变化**：从「纯静态托管」变成「Node 进程」。若要保留纯静态，只能选「浏览器直连 + 目标服务开 CORS」，安全性与兼容性都差，不推荐。
3. **协议碎片**：2026-07-28 与 2025-11-25 差异大，且部分服务只实现其一；网关的协商与回退是必需项，不是可选项。
4. **OAuth 的 CIMD 需要公网 HTTPS**：本地开发只能走预注册 / DCR，UI 要如实提示。
5. **多用户**：当前是单用户本地应用。若要多用户，`.data` 需换成数据库，并按用户隔离服务与 token。

---

## 11. 需要拍板

1. **传输范围**：先只做 Streamable HTTP（现代 + 旧版）够不够？还是要一起做 stdio 本地进程？
2. **认证范围**：先 Bearer / 自定义头（P1），OAuth 放到 P3，是否可以？
3. **开工范围**：先做 P0（网关 + mock + 测试，页面暂不动），还是 P0+P1+P2 一次做到「页面上能接、能调」？

> 建议：**P0 + P1 + P2，认证先 Bearer，传输先 Streamable HTTP**。这样一周内就能在真实服务上跑通「接入 → 握手 → 调工具 → 审计」，OAuth 与 stdio 作为独立增量，不阻塞主链路。
