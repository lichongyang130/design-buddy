# art/ — 真实配图素材目录（P1 起）

本目录由 `scripts/asset-pipeline.mjs` 自动填充，**不要手工改名或删除 `manifest.json`**。

## 目录结构

```
art/
├── manifest.json            # 概念 key → 素材 URL/署名信息 的总清单
├── illustration/            # 绘本插画模式素材（svg/webp）
├── photo/                   # 真实照片模式素材（webp/jpg）
└── portrait/                # CC0 手绘人物肖像（Open Peeps / Humaaans）
```

## 运行管线（需要在能访问外网的本地/CI 环境执行，沙箱内不可用）

```bash
# 仅查看抓取计划，不发请求
node scripts/asset-pipeline.mjs --dry-run

# 用免密钥的 Openverse 补齐全部插画与照片
node scripts/asset-pipeline.mjs --provider openverse

# 配好免费 API key 后启用 Pixabay/Pexels
export PIXABAY_KEY=... PEXELS_KEY=...
node scripts/asset-pipeline.mjs

# 只补某一个概念（例如蜜蜂）
node scripts/asset-pipeline.mjs --only edu.bee
```

## 设计约束

- 概念 key 定义在 `src/art-concepts.js`，**key 稳定不可改名**（用户单页换图覆盖按 key 持久化）。
- 引擎（`template-engine.js` 的 `art()`）读取 manifest：找不到素材时自动回退程序化内联 SVG，
  因此本目录为空或文件缺失时页面永不白屏，应用仍可完全离线运行。
- 所有素材仅使用免费可商用来源；需要署名的 CC 条目，作者与许可链接写入 manifest 对应条目，
  由素材库 UI 展示。
