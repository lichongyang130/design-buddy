# 内容配图：第一阶段

## 查看与范围

- `/art-review.html`：六类案例，每类五页，共 30 页；类别筛选、依据说明、素材下载。
- `/templates.html`：全目录接入内容驱动图解；详情「图片」标签可查看来源、生成说明和下载。
- 全目录为 712 个案例、21,084 页。它们不再按 `page.img % 11` 轮换通用照片。
- 六个样板案例各有一张按正文独立生成的 AI 场景插画，文件在 `public/art/content/`。其余是程序化 SVG；并不是两万张独立生成的 AI 图片，也不保证每个概念场景构图不同。

## 生成路线

`planContentArt(template, index)` 从页面结构、正文和案例上下文规划图像：

- steps → 顺序流程，箭头只连接原始步骤；
- left/right → 原文双侧对照；
- stats/stat → 原始指标；混合单位、负值、年份不绘制比较条；
- table → 原始表格摘要；
- items → 原始主题信息图；
- 其他 → 领域概念图和页面原文摘要，不冒充事实架构。

SVG 带有 title、desc、来源提示和内容 ID。主题配色按案例固定，ID 按页面内容确定。文字始终转义。图中可见文字空间有限，完整依据保留在说明中；它们是配图摘要，不替代正文。

## 场景插画

`content-art-scenes.js` 记录六个素材的模板 ID、对应标题、原始正文、来源和创作说明。素材只用于匹配的内容页，不按行业在其他案例中泛用。正文改变或页面重新排列后，匹配按内容进行；不匹配时回到明确标识的内容 SVG，而不是继续显示过时图片。

这些图是 AI 生成的概念插画，不是纪实照片、实际团队肖像、实际产品界面或经过核实的市场证据。模板本身的示例数值也没有因此获得事实认证。

## 后续批次

先验收这 30 页的相关性、图中文字可读性、同案例连续性，再扩大独立 AI 场景素材。当前领域概念 SVG 仍会共享绘画语言，尚未完成全量独立插画。增加专属素材应扩展内容映射，不允许静默回退到公共照片池。

## 检查

```sh
npm run build
# 5174 上需已有运行中的预览服务
node tests/verify-content-art.mjs
node tests/verify-exhibition-covers.mjs
node tests/verify-template-engine.mjs
node tests/verify-regression.mjs
```

内容测试覆盖全目录渲染、步骤来源、单位保护、XSS 转义、六个素材文件、内容匹配失效、30 页筛选和详情配图查看器。自动化通过不等于人工视觉验收通过。

## 全量扩展进度（2026-10-27）

新增八个案例的独立插画：食品技术、精准农业、云架构、网络安全、AI 基础设施融资、云系统集成、教育平台发布和巴黎灯具工坊品牌故事。

当前 **14 / 712 个案例**有专属 AI 插画，**698 个案例仍待生成**。11,573 个适合场景插画的页面中完成 14 页；其余页面的内容 SVG 不计入 AI 插画完成数。`/art-library.html` 展示全目录和真实进度，可筛选、搜索、下载已有素材或导出待生成任务。

### 可恢复的批次任务

```sh
node scripts/content-art-batch.mjs status
node scripts/content-art-batch.mjs plan --scope=case --out=../.artifacts/content-art/case-jobs.json
node scripts/content-art-batch.mjs plan --scope=page --out=../.artifacts/content-art/page-jobs.json
node scripts/content-art-batch.mjs audit
```

- case 范围：每个案例至少一张专属场景插画。
- page 范围：封面、图文、主张、章节、引用和收尾等场景页。指标/流程/对比页继续使用可编辑内容图解。
- `plan` 只导出尚未完成的任务，包含案例上下文、页面内容、配色和生成说明，不发起付费请求。
- 使用图像生成工具按任务独立生成。不可将多案例做成一张拼图或复用素材。
- 压缩为 WebP 后用 `import` 登记，必须提供计划里的原始 `sourceSnapshot`，避免旧计划的图片绑定到已修改正文。

```js
// argv 示例，避免 shell 手工转义正文中的引号
spawnSync(process.execPath, ['scripts/content-art-batch.mjs', 'import',
  `--job=${job.key}`, `--snapshot=${job.sourceSnapshot}`,
  '--file=/absolute/path/to/generated.webp', '--brief=Actual image creation brief ...'])
```

批次注册表为 `src/content-art-batch.json`。导入检查真实文件签名、大小、重复 SHA-256、任务是否存在和内容快照是否一致。审核检查文件是否存在、SHA-256 是否变化、是否存在完全相同的重复图片和失效正文映射。它不检测视觉近似，也不自动审核 AI 生成质量。

尚未启动无人值守图像生成服务，不会声称任务清单里的待生成图片已在后台自动生成。

已完成插画的案例，封面和作品展缩略图也使用该案例的主插画，作为同案例视觉身份延续；不把封面复用计为新增生成图片。其他案例保持现有 SVG，进度仍为待生成。
