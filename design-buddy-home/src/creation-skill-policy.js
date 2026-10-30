// Product focus: presentation, document and web-design creation. Stable names remain storage/runtime keys.
export const NEW_CREATION_SKILLS = [
  { id: 'reg-document-structure', name: '文档结构检查', desc: '检查标题层级、重复标题、待填项和长段落，导出目录与问题清单', category: '文档报告', glyph: '纲' },
  { id: 'reg-accessibility', name: '页面可访问性检查', desc: '静态检查 HTML 的图片替代文本、表单标签、按钮名称和标题层级，不替代浏览器无障碍审计', category: '网站原型', glyph: 'A' },
  { id: 'reg-asset-inventory', name: '素材引用清单', desc: '提取 HTML 或 Markdown 的资源引用并去重，不下载、不验证版权或链接可用性', category: '导入与交付', glyph: '图' },
]
export const RETIRED_REGISTRY_NAMES = new Set(['中英互译', '邮件撰写助手', '深度联网调研', '自动化工作流执行'])
export const CREATION_SKILL_OVERRIDES = {
  'PPT 大纲生成': { desc: '根据主题生成逐页大纲与讲稿分配，不直接导出 PPT 文件' },
  '文案润色': { desc: '本地规则清理套话和冗余，输出修改前后对比，不代替大模型改写' },
  '数据图表化': { desc: '解析粘贴的数值并生成 SVG 图表，不联网获取数据' },
  '长文摘要': { desc: '按本地句子评分提取摘要，不进行事实核验' },
  'SEO 关键词规划': { desc: '从输入提取关键词和页面标题建议，不提供搜索量数据' },
  'Excel 表格处理': { displayName: 'CSV / TSV 表格分析', desc: '解析粘贴的 CSV / TSV，统计数值列并导出 CSV，不读取 XLSX 文件' },
  'Word 文档处理': { displayName: 'Markdown 转 Word（.doc）', desc: '把粘贴的 Markdown 转成 Word 可打开的 HTML .doc，不是原生 DOCX' },
  'PDF 文档处理': { displayName: '文本分页与目录', desc: '按段落和字数规划分页，导出 Markdown 目录，不解析或导出 PDF' },
  'MarkItDown': { displayName: 'HTML 转 Markdown', desc: '将粘贴的 HTML 转为 Markdown，不读取 PDF、Word 或 PPT 文件' },
  'AI交付前全自动自检': { displayName: '交付文本与源码自检', desc: '检查输入文本和 HTML 源码中的常见问题，不验证实际 Office 导出文件' },
  'grill-me': { displayName: '方案假设与风险审查', desc: '根据输入生成本地规则追问清单，不联网核验结论', risk: 'trusted' },
  '检查代码并按照截图调整界面': { displayName: 'HTML 响应式规则检查', desc: '检查粘贴源码的固定宽度、视口等规则，不读取截图或自动改代码' },
  '页面布局': { desc: '按输入内容量估算密度并给出版式方案，不测量真实渲染页面' },
  '品牌规范提取': { displayName: '品牌色与设计令牌', desc: '从输入色值推导色阶、字体和间距令牌，不自动提取品牌文件' },
  '原型搭建': { desc: '按输入生成可下载的单文件 HTML 原型，不代替生产后端' },
}
export const requiresSkillConfirmation = (entry, trustedSkills) => !trustedSkills || entry.risk === 'review'
