# 栖野 QIYE · 周末旅行 App 案例

## 打开

- `/qiye-app.html`：独立交互原型，不依赖账号或外部 API。
- 模板页 `/templates.html` → 形式「App」→「栖野 · 周末旅行 App」。缩略图是实际首页的只读 iframe，点击打开可操作的完整案例。
- `npm run build` 后，直接预览首页：`PORT=5176 PREVIEW_ENTRY=qiye-app.html node server.mjs`。服务器默认行为保持工作区首页不变。

## 六个页面

1. `#home`：杂志式首页、当季主视觉、四种出走主题、偏好优先推荐。
2. `#discover`：即时搜索、主题与天数组合筛选、清空与无结果状态。
3. `#destination/mountain` 等：五个目的地、图片切换、收藏、加入行程。
4. `#trips`：新建 1–3 天行程、多个行程切换、添加/移除目的地、同日上移/下移、日期调整、删除确认、示例预算合计。
5. `#saved`：收藏列表与取消收藏、空状态。
6. `#profile`：昵称、偏好、紧凑布局、本地数据清空确认。

路线支持直接打开及浏览器前进后退；手机为底部导航，桌面为侧栏。弹窗支持 Escape、焦点圈定及关闭后焦点返回。图标有语义标签，交互状态使用 aria-pressed / aria-current，反馈使用 aria-live。

## 数据与范围

本地键：`design-buddy-qiye-v1`。收藏、行程、昵称、偏好和紧凑布局刷新后保留。损坏数据、安全存储不可用、未知目的地、重复地点均有保护。昵称与行程名称转义后输出。

所有目的地、预算、车程均为演示内容；不核实实际交通距离，不执行支付、预订、导航或实时天气请求。预算合计仅汇总示例金额，不能作为费用承诺。没有声称具备原生安装包、账号同步或生产后端。

五张专属 AI 场景图位于 `public/art/qiye`，分别为山野、海岸、古镇、林居、湖泊。`manifest.json` 记录摘要与 SHA-256。图片不是纪实摄影；详情切换图为不同场景灵感，不冒充同一真实地点。

自托管字体来自 Fontsource 的 Noto Sans SC / Noto Serif SC 400 字重，为界面实际使用字符选择的分片。许可证与版权信息保留在 `public/art/qiye/fonts`。运行时不依赖 Google Fonts 或外部字体服务，未涵盖的自定义昵称字符回退系统字体。

## 验证

在 5174 上运行静态预览后：

```sh
npm run build
node tests/verify-qiye-app.mjs
node tests/verify-template-engine.mjs
node tests/verify-regression.mjs
```

附加 Chromium 实测：六个页面 × 360、390、768、1440 四档宽度无横向溢出；无页面错误、无失败资源请求；手机创建行程、即时搜索和刷新后持久化通过。浏览器与截图属于本地验证工具/临时产物，不加入项目依赖或版本库。
