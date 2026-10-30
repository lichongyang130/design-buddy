# DeepSeek 模型列表与探测

## 原因与修复范围

之前 `AVAILABLE_MODELS = []`，默认地址又指向其他供应商，设置页只会显示「尚未发现可用模型」。

现在区分两种状态：

- **预置、未验证**：`deepseek-chat` / `deepseek-reasoner` 是兼容模型标识示例，允许保存偏好，但不表示你的账号可用、服务已连通或这些标识始终有效。最终以账号 `/models` 返回及真实探测为准。
- **探测通过**：脚本使用环境变量密钥请求模型列表，再逐个发送最小对话请求；只有返回有效内容或推理内容的模型才写入已验证列表。失败不会清空旧配置。

**普通问答现已接入同源后端 `/api/models/chat`。仅选择模型仍不等于验证成功：必须有有效密钥、账号权限以及可访问供应商 API 的服务器网络。测试连接和普通问答均会实际请求上游，不生成伪造回答。**

## 安全配置与运行

进入 `design-buddy-home` 目录，在可访问 DeepSeek API 的环境里操作。

1. 复制 `.env.example` 为 `.env.local`。
2. 用本地编辑器填写 `DEEPSEEK_API_KEY`。不要把真实密钥发到聊天、写进前端源码或提交 Git。
3. 使用支持 `--env-file` 的 Node（当前开发环境 Node 22）：

   ```sh
   node --env-file=.env.local scripts/discover-models.mjs
   ```

   或由部署平台/终端安全地注入 `DEEPSEEK_API_KEY` 环境变量后执行：

   ```sh
   npm run discover-models
   ```

   注意：普通 `npm run discover-models` **不会自动读取** `.env.local`；要么先注入环境变量，要么使用上面的 `--env-file` 命令。

4. 探测成功后重新构建、刷新页面（如果使用部署平台，应重新部署）：

   ```sh
   npm run build
   ```

默认 API 基址：`https://api.deepseek.com/v1`。脚本也兼容 `LLM_API_KEY`，基址可通过 `LLM_BASE_URL` / `LLM_API_BASE_URL` / `DEEPSEEK_BASE_URL` 或 `--base-url` 覆盖。

可选参数：

```sh
npm run discover-models -- --timeout 60000 --models deepseek-chat,deepseek-reasoner
```

模型列表超过 30 项时需用 `--models` 指定子集，避免意外探测费用。每个模型一次最小对话请求可能产生少量费用。旧的 `--key` 参数已移除，避免密钥出现在进程参数及 shell 历史中。

## 常见失败

- 401：密钥无效/过期。
- 403：账号或模型权限不足。
- 402：余额不足。
- 429：限流或额度问题。
- 超时/连接失败：检查 DNS、代理、服务器出站限制，必要时调大 `--timeout`。
- HTTP 200 但没有有效对话内容：不会误报验证通过。

`.env` 和 `.env.*` 已忽略，仅 `.env.example` 可提交。配置文件只保存公开模型 ID、API 基址、验证时间与延迟，不保存密钥。错误输出不回显供应商响应体中的凭据。

## 验证

`node tests/verify-model-discovery.mjs` 使用本机假 API 验证认证头、去重、推理回复、错误响应、超时、配置保留与日志/产物不泄露测试凭据；**不是 DeepSeek 官方服务的连通性证明**。

`node tests/verify-settings-real.mjs` 验证设置页的候选模型选择、保存、语言切换与其他设置交互。未验证模型在界面上明确标注为预置项。

## 设置页的自定义模型卡片

「设置 → 模型」可添加、编辑、选择、删除模型元数据，并导出 `models.json`。
添加/编辑弹窗按 OpenAI 兼容协议布局：供应商、接口地址、API Key、模型名称、工具调用/图片输入/思考模式/自定义协议及输入/输出上限。模型名称填写实际模型 ID。工具/图片/思考/自定义协议选项及输入上限仍是元数据偏好，目前只发送文本消息；输出上限用于请求，服务器限制最多 4096 tokens，默认 2048。
API Key 默认隐藏，可临时切换显示；不会写入浏览器持久存储、日志或导出文件。测试成功后密钥仅在服务器内存保留 30 分钟，通过 HttpOnly / SameSite=Strict Cookie 关联当前浏览器与模型/接口。测试成功、关闭或保存会清空输入框；再次编辑时不回填密钥。临时会话过期或服务器重启后需重新测试。同一浏览器当前仅保留最后一次成功测试的模型连接。
数据保存在当前浏览器的现有应用存储中，不会自动写入 `~/.workbuddy/models.json`。
删除当前模型会选择剩余列表的第一项；删除全部后保留空列表，刷新不会重新填入预置项。

预置项不是已验证的服务。添加弹窗与链条图标内的「测试连接」都会调用 `/api/models/test`，发送小额对话请求（最多 32 tokens，可能收费）。只有上游返回有效内容/推理内容才显示成功。错误不回显上游原始响应体或密钥。

### 使用真实问答

1. 刷新页面，进入「设置 → 模型 → 添加/编辑」。接口可填基址或完整的 `/chat/completions` 地址。
2. 输入模型 ID 和 API Key，点击「测试连接」。成功后保存，并点击列表中的模型名称选中它。
3. 返回首页提问。普通问答使用该模型和会话中的临时密钥；停止回答会取消请求。生产中应通过 HTTPS 访问应用。
4. 若希望服务器重启后仍可用，在忽略的 `.env.local` 配置 `DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY`（相应官方域名专用），然后用 `node --env-file=.env.local server.mjs` 启动。普通 `npm start` 不自动加载此文件。
5. 其他供应商需配置 `MODEL_ALLOWED_HOSTS`（仅额外的域名，不含协议和路径）；如需服务端常驻凭据，另外设置 `MODEL_BASE_URL` 和 `MODEL_API_KEY`。后端不任意读取前端传入的环境变量名，通用密钥只发送给 `MODEL_BASE_URL` 的 origin。

默认允许 `api.deepseek.com` / `api.openai.com`，以及本工作区明确批准的 `discovery-api.intern-ai.org.cn`，拒绝非 HTTPS、非 443 端口、私网、回环、metadata 地址和重定向；DNS 解析后检查全部地址，并固定用于 TLS 请求的地址，防止 DNS rebinding。后端有 20 次/分钟/IP 限流、最多 4 个并发请求和响应大小限制。临时密钥不写磁盘；本地登录不是生产后端鉴权，公开多人部署还需真正的服务端账号认证、用户额度隔离及网关审计。

当前 Arena 沙箱仅允许访问指定外网域名（不含模型供应商），也没有真实密钥，因此不能在这里证明 DeepSeek 官方服务已连通。部署端需放行供应商域名的 HTTPS 出站。

导出文件是本应用元数据备份，不宣称兼容其他应用的模型配置格式。

验证：`npm run build` 后运行 `node tests/verify-custom-models.mjs`、
`node tests/verify-settings-real.mjs`。
可选真实 Chromium 检查：`node tests/verify-custom-models-browser.mjs`，
支持现有 `APP_PLAYWRIGHT_MODULE` / `APP_CHROMIUM_MODULE` 模块覆盖及 `APP_PREVIEW_URL`。

后端测试：`node tests/verify-model-api.mjs`。该测试走真实本机 HTTP 网关，但上游使用显式模拟响应，不是官方 API 实测。
问答浏览器测试：`node tests/verify-model-chat-browser.mjs`，同样使用模拟上游，验证成功、错误、重试及停止/迟到响应保护。

Intern Discovery 接口基址可填 `https://discovery-api.intern-ai.org.cn/v1`，后端自动补齐 `/chat/completions`。请使用该平台自己的有效凭据和模型 ID；许可域名不等于已验证连通，也不保证接受 DeepSeek 官方密钥。
