# 五个格式栏目，各新增 100 个案例

入口：`/showcase.html`，或模板库对应格式筛选。原演示文稿、文档与 50 个 App 不替换、不重复计数。

| 格式 | 新增 | 实际能力 |
| --- | ---: | --- |
| 社交轮播卡片 | 100 | 每例 10 页，共 1,000 页；逐页编辑标题/正文、修改强调色、方向键翻页、保存、当前页 SVG/PNG 导出 |
| 网站复刻 | 100 | 虚构原创品牌设计研究；首页/作品/手记/联系 4 个视图，100 种首页模块排列，5 种首屏构图与视觉处理；筛选、收藏、本地选物清单及合计、展开文章、联系意向表单 |
| 图片 | 100 | 海报/编辑封面/视觉设计；文字、颜色、25 种版式组合、3 种画幅编辑，导出内嵌配图与字体的 SVG/PNG |
| 实时产物 | 100 | 20 类真实公式或生成器，各 5 套不同参数预设；实时输入校验与计算、图表/结果表、JSON/CSV 导出 |
| WebGL | 100 | 10 类真实片元着色器，各 10 套几何/色彩参数；指针交互、速度/缩放/强度控制、暂停/继续、PNG 保存 |

## 范围与诚实说明

500 是可打开的案例组合数量，不是 500 套互不共享代码的引擎。图片/轮播采用共享的参数化排版与领域图形；网站采用原创虚构品牌的设计研究，用户未指定第三方复刻来源，不冒称已像素级复制 100 个真实网站。实时产物不是 100 个独立算法，也没有冒称连接外部实时数据或大模型。WebGL 不是 100 份独立手写着色器。

所有网站价格是示例，选物清单不支持支付；联系意向只保存在本机，没有发送邮件、产生真实预约或外部提交。金融、税率、营养等工具均为假设算例，不提供专业建议。

## 图像来源

- 复用 `/art/apps/` 中已制作的 10 张领域 AI 场景，按主题共享。没有新增 500 张案例独占 AI 照片。
- 内联 SVG 图形和文字排版见 `src/showcase/art.js`。
- `/art/showcase/<id>.webp`：500 张 1200×714 独立缩略图，全部截取对应实际浏览器运行时的干净构图，不是 iframe，不是 AI 生成的假界面；WebGL 封面确实来自 GPU 渲染。
- `manifest.json` 记录每例来源、结构/参数、大小与 SHA-256。哈希唯一仅证明文件不同，不替代人工视觉判断。
- 字体复用自托管 Noto Sans SC。导出的 SVG 按实际文字选择字体分片，并将字体与主题图内嵌，PNG 由该可移植 SVG 栅格化。

## 实时工具

预算分配、目标储蓄、项目报价、盈亏平衡、时间排程、日期倒数、长度换算、色彩混合、WCAG 对比度、网格计算、版式比例、复利假设、折扣、税费假设、食材按份数缩放、阅读排程、行程预算、习惯日期追踪、文本清单生成、加权决策矩阵。

输入校验覆盖空值、非数值、上下界、比例总和、零除、无效日期、售价低于变动成本、负列宽、权重总和为零、错误分数等。CSV 对用户文字中的公式前缀做安全处理。清单生成不会调用 AI。

## WebGL

流光球体、极光织幕、液态波纹、无限隧道、数字山脊、融合光场、晶格细胞、拓扑网格、星尘轨迹、极坐标花园。每类十套几何与色彩参数。尊重系统减少动效设置；暂停后不再持续提交 GPU 绘制。隐藏页面暂停绘制，离开页面释放缓冲、程序与上下文。GPU 禁用/编译失败/上下文丢失会明确提示，不用静态图假装实时效果。

## 存储与入口

各例状态键为 `design-buddy-showcase-v1:<case-id>`。不同案例相互隔离，刷新保留。原 App、工作区与文档存储不变。重置按钮只清空当前案例；损坏数据回退到初始状态；存储不可用时提示并暂存内存。网站页面有 hash 路由，可刷新、前进/后退。

所有浏览器请求均为相对同源地址。Node 测试/封面脚本默认 `http://127.0.0.1:5174`，可由 `APP_PREVIEW_URL` 覆盖。

## 构建、测试和复现

```
npm run build
SHOWCASE_REQUIRE_COVERS=1 node tests/verify-showcase.mjs
node tests/verify-showcase-templates.mjs
node tests/verify-qiye-app.mjs
node tests/verify-app-cases.mjs
node tests/verify-template-engine.mjs
node tests/verify-regression.mjs
```

真实浏览器工具可通过外部安装路径注入，不增加生产依赖：

```
APP_PLAYWRIGHT_MODULE=/absolute/path/playwright-core/index.mjs \
APP_CHROMIUM_MODULE=/absolute/path/@sparticuz/chromium/build/index.js \
node tests/verify-showcase-browser.mjs
```

同样的环境变量可运行 `scripts/make-showcase-covers.mjs`。`SHOWCASE_FORMAT=social,website,image,live,webgl` 可选子集；`SHOWCASE_RESUME=1` 跳过已有且非空的文件。封面脚本在同一个浏览器上下文中创建工作页，避免单进程 Chromium 提前关闭独立 context 导致其他任务退出。截图前等待图片和中文字体。完成后运行：

```
node scripts/make-showcase-manifest.mjs
npm run build
```

测试按 500 例逐个打开并执行相应交互、刷新与检查。额外检查真实 SVG/PNG/JSON/CSV 下载、75 个格式/尺寸/构图组合、目录五类精确数量与搜索、JavaScript/HTTP 错误。WebGL 检查初始化状态、实际绘制像素与 GPU 错误，不只断言有 canvas 标签。可用 `SHOWCASE_TEST_FORMAT` 单独复测一个格式。
