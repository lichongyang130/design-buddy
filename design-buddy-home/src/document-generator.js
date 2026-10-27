/* ============================================================
   DesignBuddy 文档模板生成器
   程序化生成 500 个高质量文档模板
   每个 20-30 页，每页至少 1 张图片，框架各不相同
   ============================================================ */

import { PALETTES } from './template-engine.js'
import { IMG as PRES_IMG } from './presentation-generator.js'

const IMG = PRES_IMG
const IMG_KEYS = Object.keys(IMG)

/* ---------------- 文档主题数据库 ---------------- */

const DOC_INDUSTRIES = [
  // 科技
  { industry: 'Software Engineering', tagline: 'Building the digital future', metrics: ['$48B', '32%', '$12B', '4.2M'] },
  { industry: 'Cloud Architecture', tagline: 'Scalable infrastructure design', metrics: ['$62B', '28%', '$38B', '78%'] },
  { industry: 'Cybersecurity', tagline: 'Protecting digital assets', metrics: ['$18B', '41%', '$9B', '12K'] },
  { industry: 'Data Engineering', tagline: 'Pipelines that power decisions', metrics: ['$34B', '29%', '$14B', '68%'] },
  { industry: 'DevOps Practices', tagline: 'Shipping faster, breaking less', metrics: ['$9.2B', '31%', '$4.8B', '84%'] },
  { industry: 'AI Integration', tagline: 'Making machines think', metrics: ['$22B', '38%', '$11B', '3.1M'] },
  { industry: 'Mobile Development', tagline: 'Apps that people love', metrics: ['$28B', '24%', '$15B', '5.2B'] },
  { industry: 'Web Platforms', tagline: 'The front door to digital', metrics: ['$14B', '20%', '$7.2B', '4.8B'] },
  { industry: 'API Design', tagline: 'Connecting everything', metrics: ['$8.4B', '26%', '$4.2B', '180M'] },
  { industry: 'Microservices', tagline: 'Distributed by design', metrics: ['$12B', '25%', '$6.1B', '95M'] },
  { industry: 'Database Systems', tagline: 'Data at your fingertips', metrics: ['$16B', '18%', '$8.4B', '42M'] },
  { industry: 'DevTools', tagline: 'Tools that make developers faster', metrics: ['$14B', '27%', '$8B', '72%'] },
  // 商业
  { industry: 'Retail Operations', tagline: 'Running the store', metrics: ['$8.4B', '22%', '$4.2B', '180M'] },
  { industry: 'E-Commerce Strategy', tagline: 'Winning the digital shelf', metrics: ['$24B', '21%', '$13B', '480M'] },
  { industry: 'Supply Chain', tagline: 'Moving goods efficiently', metrics: ['$16B', '20%', '$8B', '8.4B'] },
  { industry: 'Marketing Analytics', tagline: 'Data that drives growth', metrics: ['$6.2B', '28%', '$3.1B', '140M'] },
  { industry: 'Customer Success', tagline: 'Keeping customers happy', metrics: ['$4.8B', '23%', '$2.4B', '180M'] },
  { industry: 'Revenue Operations', tagline: 'Aligning teams for growth', metrics: ['$3.4B', '25%', '$1.7B', '48M'] },
  { industry: 'Product Management', tagline: 'Building the right thing', metrics: ['$5.2B', '21%', '$2.6B', '72M'] },
  { industry: 'Business Strategy', tagline: 'Planning for success', metrics: ['$7.8B', '19%', '$3.9B', '84M'] },
  // 金融
  { industry: 'Investment Analysis', tagline: 'Finding value', metrics: ['$12B', '16%', '$6.1B', '280K'] },
  { industry: 'Risk Management', tagline: 'Identifying threats', metrics: ['$7.1B', '23%', '$3.9B', '24K'] },
  { industry: 'Financial Planning', tagline: 'Planning for what comes next', metrics: ['$5.2B', '28%', '$2.6B', '65M'] },
  { industry: 'Portfolio Strategy', tagline: 'Diversifying for returns', metrics: ['$8.6B', '18%', '$4.3B', '12M'] },
  { industry: 'Compliance', tagline: 'Staying on the right side', metrics: ['$4.8B', '22%', '$2.4B', '48M'] },
  { industry: 'Insurance', tagline: 'Protecting what matters', metrics: ['$9.4B', '17%', '$4.7B', '180M'] },
  // 健康
  { industry: 'Healthcare Administration', tagline: 'Running hospitals', metrics: ['$14B', '19%', '$7.2B', '85M'] },
  { industry: 'Medical Research', tagline: 'Finding cures', metrics: ['$8.4B', '19%', '$4.6B', '2.8K'] },
  { industry: 'Patient Care', tagline: 'Care that matters', metrics: ['$6.8B', '24%', '$3.4B', '180M'] },
  { industry: 'Health Informatics', tagline: 'Data for better care', metrics: ['$4.2B', '27%', '$2.1B', '68M'] },
  { industry: 'Pharmaceuticals', tagline: 'Drugs that change lives', metrics: ['$13B', '16%', '$7.2B', '8.4K'] },
  // 教育
  { industry: 'Curriculum Design', tagline: 'Building better courses', metrics: ['$4.8B', '23%', '$2.4B', '48M'] },
  { industry: 'Online Learning', tagline: 'Education anywhere', metrics: ['$12B', '28%', '$6.4B', '320M'] },
  { industry: 'Student Success', tagline: 'Helping students thrive', metrics: ['$3.8B', '21%', '$1.9B', '48M'] },
  { industry: 'Training Programs', tagline: 'Skills for the job', metrics: ['$8.2B', '22%', '$4.1B', '120M'] },
  { industry: 'Educational Technology', tagline: 'Tech for learning', metrics: ['$18B', '24%', '$10B', '480M'] },
  // 制造
  { industry: 'Production Planning', tagline: 'Making things efficiently', metrics: ['$12B', '22%', '$6B', '48K'] },
  { industry: 'Quality Assurance', tagline: 'Perfection in every product', metrics: ['$3.8B', '21%', '$1.9B', '120K'] },
  { industry: 'Manufacturing Process', tagline: 'From raw to ready', metrics: ['$16B', '18%', '$8.4B', '120K'] },
  { industry: 'Industrial Design', tagline: 'Designing for manufacture', metrics: ['$4.2B', '19%', '$2.1B', '8.4K'] },
  { industry: 'Supply Chain Optimization', tagline: 'Leaner, faster, better', metrics: ['$9.4B', '22%', '$4.7B', '8.4B'] },
  // 能源
  { industry: 'Energy Efficiency', tagline: 'Less energy, more value', metrics: ['$8.6B', '21%', '$4.3B', '280M'] },
  { industry: 'Renewable Energy', tagline: 'Powering a sustainable future', metrics: ['$24B', '26%', '$12B', '1.8B'] },
  { industry: 'Grid Management', tagline: 'Smarter grids', metrics: ['$7.2B', '20%', '$3.6B', '12K'] },
  { industry: 'Sustainability', tagline: 'Green by design', metrics: ['$5.4B', '25%', '$2.7B', '42K'] },
  // 法律
  { industry: 'Contract Review', tagline: 'Every clause matters', metrics: ['$4.8B', '18%', '$2.4B', '48M'] },
  { industry: 'Compliance Auditing', tagline: 'Keeping records clean', metrics: ['$3.2B', '21%', '$1.6B', '8.4M'] },
  { industry: 'Legal Strategy', tagline: 'Winning in court', metrics: ['$5.8B', '16%', '$2.9B', '2.8M'] },
  // 媒体
  { industry: 'Content Strategy', tagline: 'Stories that resonate', metrics: ['$6.2B', '26%', '$3.1B', '180M'] },
  { industry: 'Social Media', tagline: 'Connecting brands', metrics: ['$12B', '21%', '$6.4B', '4.8B'] },
  { industry: 'Digital Publishing', tagline: 'Reaching readers', metrics: ['$4.8B', '19%', '$2.4B', '280M'] },
  // 房地产
  { industry: 'Property Management', tagline: 'Managing assets', metrics: ['$6.2B', '18%', '$3.1B', '48M'] },
  { industry: 'Real Estate Development', tagline: 'Building communities', metrics: ['$14B', '14%', '$7.2B', '1.4M'] },
  { industry: 'Commercial Leasing', tagline: 'Space for business', metrics: ['$5.2B', '17%', '$2.6B', '4.2M'] },
]

const DOC_COMPANY_PREFIXES = [
  'Docu', 'Paper', 'Page', 'Sheet', 'Scroll', 'Codex', 'Volume', 'Chapter',
  'Atlas', 'Codex', 'Manifest', 'Blueprint', 'Roadmap', 'Playbook', 'Field',
  'Handbook', 'Guide', 'Reference', 'Compendium', 'Anthology',
]

const DOC_COMPANY_SUFFIXES = [
  'Guide', 'Handbook', 'Reference', 'Playbook', 'Blueprint', 'Roadmap',
  'Manual', 'Compendium', 'Field Guide', 'Workbook', 'Primer', 'Overview',
  'Analysis', 'Report', 'Study', 'Overview', 'Notes', 'Brief',
]

function generateDocCompanyNames() {
  const names = []
  const used = new Set()
  let pi = 0, si = 0
  while (names.length < 100) {
    const prefix = DOC_COMPANY_PREFIXES[pi % DOC_COMPANY_PREFIXES.length]
    const suffix = DOC_COMPANY_SUFFIXES[si % DOC_COMPANY_SUFFIXES.length]
    const name = prefix + suffix
    if (!used.has(name)) {
      used.add(name)
      names.push(name)
    }
    pi++
    si++
    if (pi > DOC_COMPANY_PREFIXES.length * 5) break
  }
  return names
}

const DOC_COMPANY_NAMES = generateDocCompanyNames()

export const DOC_THEMES = DOC_INDUSTRIES.map((ind, i) => ({
  company: DOC_COMPANY_NAMES[i % DOC_COMPANY_NAMES.length],
  industry: ind.industry,
  tagline: ind.tagline,
  metrics: ind.metrics,
  serial: i + 1,
}))

/* ---------------- 文档类别定义 ---------------- */

const DOC_CATEGORIES = [
  {
    type: 'guide',
    name: 'Technical Guide',
    zh: '技术指南',
    cat: '技术文档',
    sections: ['Introduction', 'Getting Started', 'Core Concepts', 'Architecture', 'Implementation', 'Testing', 'Deployment', 'Best Practices', 'Troubleshooting', 'Conclusion'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company}: ${theme.industry} Guide`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Contents', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Introduction', sub: `Overview of ${theme.industry}`, img: ib(1) },
        { layout: 'hero', eyebrow: 'INTRODUCTION', title: `What is ${theme.industry}?`, body: `${theme.company} provides comprehensive guidance on ${theme.industry}. This guide covers everything from basic concepts to advanced implementation.`, img: ib(1) },
        { layout: 'stats', title: `${theme.industry} Market Overview`, stats: [{ val: m[0], lab: 'Market Size' }, { val: m[1], lab: 'CAGR' }, { val: m[2], lab: 'Investment' }, { val: m[3], lab: 'Adoption' }], body: `The ${theme.industry} market is growing rapidly, with significant investment and adoption.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Getting Started', sub: 'Your first steps', img: ib(2) },
        { layout: 'timeline', title: 'Setup Process', steps: ['Install dependencies', 'Configure environment', 'Run initial setup', 'Verify installation', 'Start development', 'Deploy to production'], img: ib(2) },
        { layout: 'split', eyebrow: 'PREREQUISITES', title: 'Before You Begin', body0: `Required knowledge: Basic understanding of ${theme.industry} fundamentals.`, body1: `Required tools: Standard development environment and build tools.`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Core Concepts', sub: 'Understanding the fundamentals', img: ib(3) },
        { layout: 'triple-grid', eyebrow: 'KEY CONCEPTS', title: 'Three Pillars', items: [{ title: 'Concept A', body: `Core principle of ${theme.industry} that every practitioner should understand.` }, { title: 'Concept B', body: `Essential methodology for implementing ${theme.industry} solutions.` }, { title: 'Concept C', body: `Best practices for measuring and optimizing ${theme.industry} performance.` }], img: ib(3) },
        { layout: 'comparison', title: 'Approaches Compared', leftTitle: 'Traditional', rightTitle: 'Modern', left: ['Manual processes', 'Limited scalability', 'High cost', 'Slow iteration'], right: ['Automated', 'Elastic scale', 'Cost-effective', 'Fast iteration'], img: ib(3) },
        { layout: 'divider', no: 4, title: 'Architecture', sub: 'System design patterns', img: ib(4) },
        { layout: 'hero', eyebrow: 'ARCHITECTURE', title: `${theme.company} Architecture`, body: `Our architecture is designed for scalability, reliability, and maintainability. It follows industry best practices and has been proven at scale.`, img: ib(4) },
        { layout: 'stats', title: 'Architecture Metrics', stats: [{ val: '99.99%', lab: 'Uptime' }, { val: '4.2M', lab: 'Daily Requests' }, { val: '12ms', lab: 'Avg Latency' }, { val: '98%', lab: 'Cache Hit' }], body: `Proven architecture metrics at scale across production environments.`, img: ib(4) },
        { layout: 'divider', no: 5, title: 'Implementation', sub: 'Putting it into practice', img: ib(5) },
        { layout: 'timeline', title: 'Implementation Steps', steps: ['Design phase', 'Development phase', 'Testing phase', 'Deployment phase', 'Monitoring phase', 'Optimization phase'], img: ib(5) },
        { layout: 'split', eyebrow: 'CODE EXAMPLE', title: 'Sample Implementation', body0: `Here is a basic example of implementing ${theme.industry} in your project.`, body1: `This code demonstrates the core functionality with minimal dependencies.`, img: ib(5) },
        { layout: 'divider', no: 6, title: 'Testing', sub: 'Ensuring quality', img: ib(6) },
        { layout: 'stats', title: 'Test Coverage', stats: [{ val: '94%', lab: 'Unit Tests' }, { val: '82%', lab: 'Integration' }, { val: '78%', lab: 'E2E' }, { val: '96%', lab: 'Code Coverage' }], body: `Comprehensive testing ensures reliability across all components.`, img: ib(6) },
        { layout: 'comparison', title: 'Testing Strategies', leftTitle: 'Manual', rightTitle: 'Automated', left: ['Slow', 'Error-prone', 'Expensive', 'Hard to scale'], right: ['Fast', 'Reliable', 'Cost-effective', 'Scalable'], img: ib(6) },
        { layout: 'divider', no: 7, title: 'Deployment', sub: 'Shipping to production', img: ib(7) },
        { layout: 'timeline', title: 'Deployment Pipeline', steps: ['Code commit', 'CI trigger', 'Build & test', 'Staging deploy', 'Production deploy', 'Monitor'], img: ib(7) },
        { layout: 'big-stat', eyebrow: 'DEPLOYMENT', stat: '14 min', sub: 'Average Deploy Time', body: `From commit to production in 14 minutes, with automated testing and rollback.`, img: ib(7) },
        { layout: 'divider', no: 8, title: 'Best Practices', sub: 'Lessons learned', img: ib(8) },
        { layout: 'triple-grid', eyebrow: 'BEST PRACTICES', title: 'Three Key Principles', items: [{ title: 'Keep It Simple', body: `Simplicity leads to maintainability. Avoid unnecessary complexity.` }, { title: 'Measure Everything', body: `Data-driven decisions lead to better outcomes. Track what matters.` }, { title: 'Iterate Fast', body: `Ship small, ship often. Learn from feedback and improve.` }], img: ib(8) },
        { layout: 'quote', quote: `Simplicity is the ultimate sophistication.`, source: `${theme.company} Engineering Philosophy`, img: ib(8) },
        { layout: 'divider', no: 9, title: 'Troubleshooting', sub: 'Solving common issues', img: ib(9) },
        { layout: 'faq', title: 'Common Issues', items: ['Configuration errors', 'Performance issues', 'Integration problems', 'Deployment failures'], img: ib(9) },
        { layout: 'divider', no: 10, title: 'Conclusion', sub: 'Next steps', img: ib(10) },
        { layout: 'hero', eyebrow: 'CONCLUSION', title: `Moving Forward with ${theme.industry}`, body: `You now have a comprehensive understanding of ${theme.industry}. Apply these principles in your projects and continue learning.`, img: ib(10) },
        { layout: 'closing', eyebrow: 'Thank You', title: `${theme.company} Guide`, sub: theme.tagline, img: ib(10) },
      ]
    },
  },
  {
    type: 'report',
    name: 'Analysis Report',
    zh: '分析报告',
    cat: '报告',
    sections: ['Executive Summary', 'Background', 'Methodology', 'Findings', 'Data Analysis', 'Trends', 'Comparisons', 'Recommendations', 'Conclusion', 'Appendix'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company} ${theme.industry} Report`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Table of Contents', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'Key findings', img: ib(1) },
        { layout: 'stats', title: 'Key Metrics', stats: [{ val: m[0], lab: 'Market Size' }, { val: m[1], lab: 'Growth Rate' }, { val: m[2], lab: 'Investment' }, { val: m[3], lab: 'Participants' }], body: `${theme.industry} is experiencing significant growth with increasing investment and participation.`, img: ib(1) },
        { layout: 'hero', eyebrow: 'SUMMARY', title: `${theme.industry} Landscape`, body: `This report provides a comprehensive analysis of the ${theme.industry} market, including trends, data, and strategic recommendations.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Background', sub: 'Context and scope', img: ib(2) },
        { layout: 'hero', eyebrow: 'BACKGROUND', title: `Why ${theme.industry} Matters`, body: `${theme.industry} plays a critical role in the modern economy. This report examines its current state and future trajectory.`, img: ib(2) },
        { layout: 'stats', title: 'Historical Context', stats: [{ val: '2015', lab: 'Baseline Year' }, { val: '2020', lab: 'Growth Phase' }, { val: '2025', lab: 'Current State' }, { val: '2030', lab: 'Forecast' }], body: `The evolution of ${theme.industry} over the past decade shows consistent growth and innovation.`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Methodology', sub: 'How we conducted this analysis', img: ib(3) },
        { layout: 'timeline', title: 'Research Process', steps: ['Data collection', 'Qualitative interviews', 'Quantitative analysis', 'Expert review', 'Peer validation', 'Final report'], img: ib(3) },
        { layout: 'split', eyebrow: 'SOURCES', title: 'Data Sources', body0: `Primary sources: Industry reports, company filings, expert interviews.`, body1: `Secondary sources: Academic papers, market research, government data.`, img: ib(3) },
        { layout: 'divider', no: 4, title: 'Findings', sub: 'What we discovered', img: ib(4) },
        { layout: 'triple-grid', eyebrow: 'KEY FINDINGS', title: 'Three Critical Insights', items: [{ title: 'Growth Driver', body: `${theme.industry} is being driven by technology adoption and changing consumer behavior.` }, { title: 'Challenge Area', body: `Regulatory uncertainty and talent shortages are key challenges.` }, { title: 'Opportunity', body: `AI and automation present significant opportunities for innovation.` }], img: ib(4) },
        { layout: 'big-stat', eyebrow: 'HEADLINE', stat: m[0], sub: 'Market Size', body: `The total ${theme.industry} market is valued at ${m[0]}, growing at ${m[1]} annually.`, img: ib(4) },
        { layout: 'divider', no: 5, title: 'Data Analysis', sub: 'Deep dive into numbers', img: ib(5) },
        { layout: 'table', title: 'Market Data', head: ['Segment', 'Size', 'Growth', 'Share'], rows: [['Enterprise', '$12B', '22%', '42%'], ['Mid-Market', '$6B', '28%', '21%'], ['SMB', '$8B', '31%', '28%'], ['Emerging', '$2.4B', '42%', '9%']], img: ib(5) },
        { layout: 'bars', title: 'Growth by Segment', items: ['Enterprise 22%', 'Mid-Market 28%', 'SMB 31%', 'Emerging 42%', 'Overall 29%'], img: ib(5) },
        { layout: 'divider', no: 6, title: 'Trends', sub: 'What\'s shaping the future', img: ib(6) },
        { layout: 'timeline', title: 'Trend Evolution', steps: ['2020: Digital Shift', '2021: Cloud Adoption', '2022: AI Integration', '2023: Data Focus', '2024: Automation', '2025: AI-Native'], img: ib(6) },
        { layout: 'comparison', title: 'Current vs Future', leftTitle: 'Today', rightTitle: '2030', left: ['$48B market', '12% automation', '38% adoption', '15 markets'], right: ['$120B market', '78% automation', '85% adoption', '42 markets'], img: ib(6) },
        { layout: 'divider', no: 7, title: 'Comparisons', sub: 'Benchmarking against peers', img: ib(7) },
        { layout: 'table', title: 'Competitive Landscape', head: ['Company', 'Market Share', 'Revenue', 'Growth'], rows: [{ v: 'Acme Corp', lab: '22%', rev: '$8.4B', g: '12%' }, { v: theme.company, lab: '18%', rev: '$6.8B', g: '28%' }, { v: 'GlobalTech', lab: '15%', rev: '$5.6B', g: '19%' }, { v: 'Innovate Inc', lab: '12%', rev: '$4.5B', g: '31%' }], img: ib(7) },
        { layout: 'comparison', title: 'Performance Comparison', leftTitle: 'Industry Average', rightTitle: theme.company, left: ['Growth: 16%', 'Satisfaction: 78', 'Retention: 85%', 'Innovation: Medium'], right: ['Growth: 28%', 'Satisfaction: 94', 'Retention: 96%', 'Innovation: High'], img: ib(7) },
        { layout: 'divider', no: 8, title: 'Recommendations', sub: 'Strategic actions', img: ib(8) },
        { layout: 'triple-grid', eyebrow: 'RECOMMENDATIONS', title: 'Three Strategic Actions', items: [{ title: 'Invest in AI', body: `Prioritize AI investment to stay competitive in ${theme.industry}.` }, { title: 'Expand Markets', body: `Enter new geographic markets to capture growth.` }, { title: 'Build Talent', body: `Invest in talent development and hiring.` }], img: ib(8) },
        { layout: 'timeline', title: 'Action Plan', steps: ['Q1: AI Strategy', 'Q2: Market Entry', 'Q3: Talent Build', 'Q4: Scale Operations', 'Q1: Optimize', 'Q2: Expand'], img: ib(8) },
        { layout: 'divider', no: 9, title: 'Conclusion', sub: 'Final thoughts', img: ib(9) },
        { layout: 'hero', eyebrow: 'CONCLUSION', title: `${theme.industry}: A Bright Future`, body: `${theme.industry} is poised for significant growth. Organizations that invest strategically will be well-positioned for success.`, img: ib(9) },
        { layout: 'closing', eyebrow: 'Thank You', title: `${theme.company} Analysis Report`, sub: theme.tagline, img: ib(9) },
      ]
    },
  },
  {
    type: 'proposal',
    name: 'Project Proposal',
    zh: '项目提案',
    cat: '商业规划',
    sections: ['Executive Summary', 'Project Overview', 'Objectives', 'Scope', 'Deliverables', 'Timeline', 'Resources', 'Budget', 'Risks', 'Approval'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company} Project Proposal`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Proposal Contents', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'Project overview', img: ib(1) },
        { layout: 'hero', eyebrow: 'SUMMARY', title: `${theme.company} Initiative`, body: `This proposal outlines a strategic ${theme.industry} initiative to drive growth and innovation. Total investment: $2.4M over 12 months.`, img: ib(1) },
        { layout: 'stats', title: 'Project Highlights', stats: [{ val: '$2.4M', lab: 'Investment' }, { val: '12 mo', lab: 'Timeline' }, { val: '34%', lab: 'ROI Target' }, { val: '5', lab: 'Team Members' }], body: `Expected ROI of 34% with a 12-month timeline and dedicated team of 5.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Project Overview', sub: 'What we are building', img: ib(2) },
        { layout: 'hero', eyebrow: 'OVERVIEW', title: `${theme.industry} Initiative`, body: `${theme.company} will implement a comprehensive ${theme.industry} solution to address key business challenges and create new opportunities.`, img: ib(2) },
        { layout: 'split', eyebrow: 'BACKGROUND', title: 'Why This Project', body0: `Market demand: ${theme.industry} is growing at ${m[1]} with increasing customer demand.`, body1: `Competitive pressure: Competitors are investing heavily in ${theme.industry} capabilities.`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Objectives', sub: 'What we aim to achieve', img: ib(3) },
        { layout: 'triple-grid', eyebrow: 'OBJECTIVES', title: 'Three Primary Goals', items: [{ title: 'Revenue Growth', body: `Increase revenue by 25% through ${theme.industry} capabilities.` }, { title: 'Cost Reduction', body: `Reduce operational costs by 18% through automation.` }, { title: 'Market Expansion', body: `Enter 3 new markets within 12 months.` }], img: ib(3) },
        { layout: 'stats', title: 'Success Metrics', stats: [{ val: '+25%', lab: 'Revenue Growth' }, { val: '-18%', lab: 'Cost Reduction' }, { val: '3', lab: 'New Markets' }, { val: '94%', lab: 'Customer Satisfaction' }], body: `Success will be measured against these key metrics over the project timeline.`, img: ib(3) },
        { layout: 'divider', no: 4, title: 'Scope', sub: 'What\'s included', img: ib(4) },
        { layout: 'comparison', title: 'Scope Breakdown', leftTitle: 'In Scope', rightTitle: 'Out of Scope', left: ['Core platform development', 'Integration with existing systems', 'User training', 'Documentation', 'Initial support'], right: ['Third-party integrations', 'Custom features', 'Ongoing support', 'Future phases', 'Other products'], img: ib(4) },
        { layout: 'divider', no: 5, title: 'Deliverables', sub: 'What we will produce', img: ib(5) },
        { layout: 'timeline', title: 'Deliverables Timeline', steps: ['M1: Requirements Doc', 'M2: Design Spec', 'M3: Prototype', 'M4: Beta Release', 'M5: Full Release', 'M6: Documentation'], img: ib(5) },
        { layout: 'stats', title: 'Key Deliverables', stats: [{ val: '1', lab: 'Core Platform' }, { val: '3', lab: 'Integrations' }, { val: '12', lab: 'Documents' }, { val: '5', lab: 'Training Sessions' }], body: `Deliverables include the core platform, integrations, documentation, and training.`, img: ib(5) },
        { layout: 'divider', no: 6, title: 'Timeline', sub: 'Project schedule', img: ib(6) },
        { layout: 'table', title: 'Project Schedule', head: ['Phase', 'Start', 'End', 'Duration'], rows: [['Planning', 'Month 1', 'Month 2', '2 months'], ['Development', 'Month 3', 'Month 7', '5 months'], ['Testing', 'Month 8', 'Month 9', '2 months'], ['Deployment', 'Month 10', 'Month 11', '2 months'], ['Support', 'Month 12', 'Month 12', '1 month']], img: ib(6) },
        { layout: 'big-stat', eyebrow: 'TIMELINE', stat: '12 mo', sub: 'Total Duration', body: `The project will be completed in 12 months with milestone-based deliverables.`, img: ib(6) },
        { layout: 'divider', no: 7, title: 'Resources', sub: 'Team and tools', img: ib(7) },
        { layout: 'stats', title: 'Team Composition', stats: [{ val: '5', lab: 'Team Members' }, { val: '2', lab: 'Senior Roles' }, { val: '1', lab: 'PM' }, { val: '1', lab: 'QA' }], body: `Dedicated team of 5 with senior technical roles and project management.`, img: ib(7) },
        { layout: 'split', eyebrow: 'RESOURCES', title: 'Tools & Infrastructure', body0: `Development: Modern tech stack with cloud infrastructure.`, body1: `Tools: Industry-standard development, testing, and deployment tools.`, img: ib(7) },
        { layout: 'divider', no: 8, title: 'Budget', sub: 'Financial plan', img: ib(8) },
        { layout: 'table', title: 'Budget Breakdown', head: ['Category', 'Amount', '% of Total'], rows: [['Personnel', '$1.4M', '58%'], ['Infrastructure', '$500K', '21%'], ['Software', '$300K', '12%'], ['Training', '$100K', '4%'], ['Contingency', '$100K', '5%']], img: ib(8) },
        { layout: 'big-stat', eyebrow: 'TOTAL INVESTMENT', stat: '$2.4M', sub: 'Project Budget', body: `Total investment of $2.4M with expected ROI of 34% over 2 years.`, img: ib(8) },
        { layout: 'divider', no: 9, title: 'Risks', sub: 'Potential challenges', img: ib(9) },
        { layout: 'comparison', title: 'Risk Mitigation', leftTitle: 'Risks', rightTitle: 'Mitigation', left: ['Talent acquisition', 'Technical complexity', 'Timeline delays', 'Budget overrun'], right: ['Early hiring plan', 'Prototype first', 'Buffer time built in', 'Regular reviews'], img: ib(9) },
        { layout: 'divider', no: 10, title: 'Approval', sub: 'Next steps', img: ib(10) },
        { layout: 'closing', eyebrow: 'Requesting Approval', title: `${theme.company} Proposal`, sub: theme.tagline, img: ib(10) },
      ]
    },
  },
  {
    type: 'whitepaper',
    name: 'Whitepaper',
    zh: '白皮书',
    cat: '报告',
    sections: ['Abstract', 'Introduction', 'Background', 'Problem Statement', 'Approach', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company} Whitepaper`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Contents', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Abstract', sub: 'Executive summary', img: ib(1) },
        { layout: 'hero', eyebrow: 'ABSTRACT', title: `${theme.industry} Innovation`, body: `This whitepaper presents a novel approach to ${theme.industry}, demonstrating how ${theme.company} achieves superior results through innovation and best practices.`, img: ib(1) },
        { layout: 'stats', title: 'Key Results', stats: [{ val: m[0], lab: 'Market Impact' }, { val: m[1], lab: 'Improvement' }, { val: '3.2x', lab: 'Performance Gain' }, { val: '98%', lab: 'Accuracy' }], body: `Our approach delivers measurable improvements across key metrics.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Introduction', sub: 'Context and motivation', img: ib(2) },
        { layout: 'hero', eyebrow: 'INTRODUCTION', title: `The ${theme.industry} Challenge`, body: `${theme.industry} faces significant challenges in the modern era. This whitepaper presents a comprehensive solution addressing these challenges.`, img: ib(2) },
        { layout: 'quote', quote: `The best way to predict the future is to invent it.`, source: `Alan Kay`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Background', sub: 'Historical context', img: ib(3) },
        { layout: 'timeline', title: 'Evolution of ${theme.industry}', steps: ['2010: Traditional Methods', '2015: Digital Transformation', '2020: Cloud Adoption', '2023: AI Integration', '2025: AI-Native', '2030: Autonomous'], img: ib(3) },
        { layout: 'stats', title: 'Background Stats', stats: [{ val: '15yr', lab: 'Evolution' }, { val: '4x', lab: 'Growth' }, { val: '68%', lab: 'Adoption' }, { val: '$48B', lab: 'Market Size' }], body: `The evolution of ${theme.industry} over 15 years shows dramatic change and growth.`, img: ib(3) },
        { layout: 'divider', no: 4, title: 'Problem Statement', sub: 'What we are solving', img: ib(4) },
        { layout: 'comparison', title: 'Current Challenges', leftTitle: 'Problems', rightTitle: 'Impact', left: ['Inefficiency', 'High cost', 'Limited scalability', 'Poor UX', 'Security risks'], right: ['40% wasted effort', '$8.4B annual loss', 'Cannot scale', '68% dissatisfaction', '2.4K breaches/year'], img: ib(4) },
        { layout: 'big-stat', eyebrow: 'PROBLEM SCALE', stat: '$8.4B', sub: 'Annual Loss', body: `Current ${theme.industry} inefficiencies cost the industry $8.4B annually.`, img: ib(4) },
        { layout: 'divider', no: 5, title: 'Approach', sub: 'Our solution', img: ib(5) },
        { layout: 'hero', eyebrow: 'APPROACH', title: `${theme.company} Solution`, body: `We propose a novel approach that addresses the root causes of ${theme.industry} challenges through innovation and best practices.`, img: ib(5) },
        { layout: 'triple-grid', eyebrow: 'SOLUTION PILLARS', title: 'Three Innovation Pillars', items: [{ title: 'Pillar 1: Architecture', body: `Modern architecture designed for scale and reliability.` }, { title: 'Pillar 2: Automation', body: `AI-powered automation reduces manual effort by 60%.` }, { title: 'Pillar 3: Optimization', body: `Continuous optimization ensures peak performance.` }], img: ib(5) },
        { layout: 'comparison', title: 'Solution Comparison', leftTitle: 'Existing Approach', rightTitle: `${theme.company} Approach`, left: ['Manual', 'Expensive', 'Limited', 'Slow', 'Risky'], right: ['Automated', 'Cost-effective', 'Scalable', 'Fast', 'Secure'], img: ib(5) },
        { layout: 'divider', no: 6, title: 'Methodology', sub: 'How we validated', img: ib(6) },
        { layout: 'timeline', title: 'Research Methodology', steps: ['Literature review', 'Industry interviews', 'Prototype development', 'A/B testing', 'Statistical analysis', 'Peer review'], img: ib(6) },
        { layout: 'stats', title: 'Research Scope', stats: [{ val: '1,200', lab: 'Participants' }, { val: '48', lab: 'Interviews' }, { val: '2.4M', lab: 'Data Points' }, { val: '12', lab: 'Countries' }], body: `Comprehensive research across 12 countries with 1,200 participants.`, img: ib(6) },
        { layout: 'divider', no: 7, title: 'Results', sub: 'What we found', img: ib(7) },
        { layout: 'stats', title: 'Performance Results', stats: [{ val: '3.2x', lab: 'Faster' }, { val: '60%', lab: 'Cheaper' }, { val: '98%', lab: 'Accuracy' }, { val: '99.99%', lab: 'Uptime' }], body: `Our approach delivers 3.2x faster performance at 60% lower cost with 98% accuracy.`, img: ib(7) },
        { layout: 'bars', title: 'Performance Comparison', items: ['Speed 3.2x', 'Cost -60%', 'Accuracy 98%', 'Uptime 99.99%', 'Satisfaction 94%'], img: ib(7) },
        { layout: 'divider', no: 8, title: 'Discussion', sub: 'Implications and insights', img: ib(8) },
        { layout: 'quote', quote: `Innovation distinguishes between a leader and a follower.`, source: `Steve Jobs`, img: ib(8) },
        { layout: 'split', eyebrow: 'IMPLICATIONS', title: 'Two Key Insights', body0: `Organizations that adopt our approach will gain significant competitive advantage.`, body1: `The technology is ready for widespread adoption with clear ROI.`, img: ib(8) },
        { layout: 'divider', no: 9, title: 'Conclusion', sub: 'Summary and next steps', img: ib(9) },
        { layout: 'hero', eyebrow: 'CONCLUSION', title: `The Future of ${theme.industry}`, body: `${theme.industry} is ready for transformation. ${theme.company} provides the roadmap to achieve superior results through innovation.`, img: ib(9) },
        { layout: 'closing', eyebrow: 'References', title: `${theme.company} Whitepaper`, sub: theme.tagline, img: ib(9) },
      ]
    },
  },
  {
    type: 'case-study',
    name: 'Case Study',
    zh: '案例分析',
    cat: '报告',
    sections: ['Overview', 'Client Background', 'Challenge', 'Solution', 'Implementation', 'Results', 'Key Metrics', 'Lessons Learned', 'Next Steps', 'About'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company} Case Study`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Case Study Contents', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Overview', sub: 'Executive summary', img: ib(1) },
        { layout: 'hero', eyebrow: 'OVERVIEW', title: `${theme.company} Success Story`, body: `${theme.company} transformed their ${theme.industry} operations, achieving 280% revenue growth and 60% cost reduction in 18 months.`, img: ib(1) },
        { layout: 'stats', title: 'Headline Results', stats: [{ val: '280%', lab: 'Revenue Growth' }, { val: '60%', lab: 'Cost Reduction' }, { val: '94', lab: 'NPS' }, { val: '18mo', lab: 'Timeline' }], body: `Exceptional results across all key metrics within 18 months.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Client Background', sub: 'Who is the client', img: ib(2) },
        { layout: 'hero', eyebrow: 'BACKGROUND', title: `${theme.company} Profile`, body: `${theme.company} is a leading ${theme.industry} company with $8.4B revenue and 480 employees across 5 markets.`, img: ib(2) },
        { layout: 'stats', title: 'Company Profile', stats: [{ val: '$8.4B', lab: 'Revenue' }, { val: '480', lab: 'Employees' }, { val: '5', lab: 'Markets' }, { val: '1,200', lab: 'Customers' }], body: `Established ${theme.industry} company with global operations.`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Challenge', sub: 'What problem needed solving', img: ib(3) },
        { layout: 'comparison', title: 'The Challenge', leftTitle: 'Before', rightTitle: 'Problems', left: ['Stagnant growth', 'High costs', 'Customer churn', 'Market pressure', 'Talent gaps'], right: ['2% growth', '40% waste', '12% churn', 'Rising competition', 'Skills shortage'], img: ib(3) },
        { layout: 'big-stat', eyebrow: 'CHALLENGE SCALE', stat: '12%', sub: 'Customer Churn', body: `Customer churn was at 12%, costing the company $1.2M in lost revenue annually.`, img: ib(3) },
        { layout: 'divider', no: 4, title: 'Solution', sub: 'What we did', img: ib(4) },
        { layout: 'hero', eyebrow: 'SOLUTION', title: `${theme.company} Transformation`, body: `We implemented a comprehensive ${theme.industry} transformation strategy, including technology modernization, process optimization, and organizational change.`, img: ib(4) },
        { layout: 'triple-grid', eyebrow: 'SOLUTION COMPONENTS', title: 'Three Strategic Initiatives', items: [{ title: 'Technology Modernization', body: `Deployed modern ${theme.industry} platform with AI capabilities.` }, { title: 'Process Optimization', body: `Reengineered core processes for 60% efficiency gain.` }, { title: 'Organizational Change', body: `Trained 480 employees and restructured teams for agility.` }], img: ib(4) },
        { layout: 'comparison', title: 'Before vs After', leftTitle: 'Before', rightTitle: 'After', left: ['Manual processes', '2% growth', '12% churn', '5 markets', '40% waste'], right: ['Automated', '280% growth', '2% churn', '12 markets', '8% waste'], img: ib(4) },
        { layout: 'divider', no: 5, title: 'Implementation', sub: 'How we executed', img: ib(5) },
        { layout: 'timeline', title: 'Implementation Journey', steps: ['Month 1: Assessment', 'Month 2: Strategy', 'Month 3: Pilot', 'Month 6: Scale', 'Month 9: Optimize', 'Month 18: Complete'], img: ib(5) },
        { layout: 'split', eyebrow: 'EXECUTION', title: 'Two Key Phases', body0: `Phase 1 (Months 1-6): Technology deployment and process redesign.`, body1: `Phase 2 (Months 7-18): Organizational change and optimization.`, img: ib(5) },
        { layout: 'divider', no: 6, title: 'Results', sub: 'What we achieved', img: ib(6) },
        { layout: 'stats', title: 'Outcome Metrics', stats: [{ val: '280%', lab: 'Revenue Growth' }, { val: '60%', lab: 'Cost Reduction' }, { val: '94', lab: 'NPS' }, { val: '2%', lab: 'Churn Rate' }], body: `Dramatic improvement across all metrics within 18 months.`, img: ib(6) },
        { layout: 'bars', title: 'Performance Improvements', items: ['Revenue +280%', 'Costs -60%', 'NPS 94', 'Churn -83%', 'Markets +140%'], img: ib(6) },
        { layout: 'divider', no: 7, title: 'Key Metrics', sub: 'Detailed results', img: ib(7) },
        { layout: 'table', title: 'Detailed Results', head: ['Metric', 'Before', 'After', 'Change'], rows: [['Revenue', '$8.4B', '$24B', '+185%'], ['Costs', '$5.2B', '$2.1B', '-60%'], ['NPS', '62', '94', '+32'], ['Churn', '12%', '2%', '-83%'], ['Markets', '5', '12', '+140%']], img: ib(7) },
        { layout: 'big-stat', eyebrow: 'ROI', stat: '5.2x', sub: 'Return on Investment', body: `Total investment of $4.2M yielded $22M in returns — a 5.2x ROI.`, img: ib(7) },
        { layout: 'divider', no: 8, title: 'Lessons Learned', sub: 'Key takeaways', img: ib(8) },
        { layout: 'quote', quote: `Transformation is not about technology — it\'s about people and process.`, source: `${theme.company} CEO`, img: ib(8) },
        { layout: 'triple-grid', eyebrow: 'LESSONS', title: 'Three Key Lessons', items: [{ title: 'People First', body: `Organizational change is the hardest part. Invest in training and communication.` }, { title: 'Start Small', body: `Pilot before scaling. Learn from mistakes on a smaller scale.` }, { title: 'Measure Everything', body: `Data-driven decisions lead to better outcomes. Track what matters.` }], img: ib(8) },
        { layout: 'divider', no: 9, title: 'Next Steps', sub: 'What\'s next', img: ib(9) },
        { layout: 'hero', eyebrow: 'NEXT STEPS', title: `${theme.company} Future`, body: `${theme.company} plans to expand into 5 more markets and double revenue again in the next 18 months.`, img: ib(9) },
        { layout: 'closing', eyebrow: 'Contact', title: `${theme.company} Case Study`, sub: theme.tagline, img: ib(9) },
      ]
    },
  },
  {
    type: 'onboarding',
    name: 'Onboarding Guide',
    zh: '入职指南',
    cat: '教育',
    sections: ['Welcome', 'Company Overview', 'Team Structure', 'Tools & Systems', 'First Week', 'Key Policies', 'Training Plan', 'Mentorship', 'Goals & KPIs', 'Resources'],
    build: (theme, imgBase, variant) => {
      const m = theme.metrics
      const ib = (n) => (imgBase + n) % 11
      return [
        { layout: 'cover', title: `${theme.company} Onboarding Guide`, sub: theme.tagline.toUpperCase(), img: ib(0) },
        { layout: 'agenda', title: 'Welcome Guide', items: theme.sections, img: ib(0) },
        { layout: 'divider', no: 1, title: 'Welcome', sub: 'Joining the team', img: ib(1) },
        { layout: 'hero', eyebrow: 'WELCOME', title: `Welcome to ${theme.company}!`, body: `We\'re excited to have you join our ${theme.industry} team. This guide will help you get started and succeed in your role.`, img: ib(1) },
        { layout: 'stats', title: 'Company Snapshot', stats: [{ val: m[0], lab: 'Market Position' }, { val: m[3], lab: 'Team Members' }, { val: '5', lab: 'Markets' }, { val: '94', lab: 'NPS' }], body: `${theme.company} is a leading ${theme.industry} company with a great culture.`, img: ib(1) },
        { layout: 'divider', no: 2, title: 'Company Overview', sub: 'What we do', img: ib(2) },
        { layout: 'hero', eyebrow: 'COMPANY', title: `${theme.company} Mission`, body: `${theme.company} is transforming ${theme.industry} through innovation and customer-centric design.`, img: ib(2) },
        { layout: 'split', eyebrow: 'OUR MISSION', title: 'Two Key Goals', body0: `Mission: To make ${theme.industry} accessible, efficient, and delightful for everyone.`, body1: `Vision: To be the world\'s most innovative ${theme.industry} company.`, img: ib(2) },
        { layout: 'divider', no: 3, title: 'Team Structure', sub: 'Who you\'ll work with', img: ib(3) },
        { layout: 'triple-grid', eyebrow: 'TEAM STRUCTURE', title: 'Three Key Teams', items: [{ title: 'Engineering', body: `Building and maintaining our ${theme.industry} platform.` }, { title: 'Product', body: `Defining requirements and prioritizing features.` }, { title: 'Design', body: `Creating beautiful and functional user experiences.` }], img: ib(3) },
        { layout: 'stats', title: 'Team Size', stats: [{ val: '480', lab: 'Total Employees' }, { val: '42', lab: 'Engineering' }, { val: '18', lab: 'Product' }, { val: '12', lab: 'Design' }], body: `You\'ll be part of a growing team with opportunities to learn and grow.`, img: ib(3) },
        { layout: 'divider', no: 4, title: 'Tools & Systems', sub: 'What you\'ll use', img: ib(4) },
        { layout: 'timeline', title: 'Tools Setup', steps: ['Email & Slack', 'Code repository', 'Project management', 'Design tools', 'Analytics', 'All set up'], img: ib(4) },
        { layout: 'split', eyebrow: 'KEY TOOLS', title: 'Essential Tools', body0: `Communication: Slack for team chat, Email for external.`, body1: `Development: Git, IDE, CI/CD pipeline, and monitoring tools.`, img: ib(4) },
        { layout: 'divider', no: 5, title: 'First Week', sub: 'Your first 7 days', img: ib(5) },
        { layout: 'timeline', title: 'Week 1 Plan', steps: ['Day 1: Setup & intro', 'Day 2: Team meetings', 'Day 3: Tools training', 'Day 4: Code walkthrough', 'Day 5: First task', 'Weekend: Rest'], img: ib(5) },
        { layout: 'stats', title: 'First Week Goals', stats: [{ val: '5', lab: 'Team Meetings' }, { val: '3', lab: 'Tools Setup' }, { val: '1', lab: 'First Task' }, { val: '2', lab: '1-on-1s' }], body: `Your first week focuses on setup, learning, and meeting the team.`, img: ib(5) },
        { layout: 'divider', no: 6, title: 'Key Policies', sub: 'What you need to know', img: ib(6) },
        { layout: 'comparison', title: 'Key Policies', leftTitle: 'Work', rightTitle: 'Time', left: ['Flexible hours', 'Remote-friendly', 'Unlimited PTO', 'Learning budget', 'Health benefits'], right: ['40 hrs/week', 'Core: 10-4', 'Take what you need', '$2K/year', 'Full coverage'], img: ib(6) },
        { layout: 'divider', no: 7, title: 'Training Plan', sub: 'How you\'ll grow', img: ib(7) },
        { layout: 'triple-grid', eyebrow: 'TRAINING', title: 'Three Learning Tracks', items: [{ title: 'Technical', body: `Deep dive into ${theme.industry} technologies and best practices.` }, { title: 'Domain', body: `Understanding the ${theme.industry} market and customer needs.` }, { title: 'Soft Skills', body: `Communication, leadership, and collaboration skills.` }], img: ib(7) },
        { layout: 'stats', title: 'Learning Investment', stats: [{ val: '$2K', lab: 'Annual Budget' }, { val: '40hr', lab: 'Training Hours' }, { val: '12', lab: 'Courses' }, { val: '4', lab: 'Conferences' }], body: `${theme.company} invests $2K per employee annually in learning.`, img: ib(7) },
        { layout: 'divider', no: 8, title: 'Mentorship', sub: 'Who\'s helping you', img: ib(8) },
        { layout: 'hero', eyebrow: 'MENTORSHIP', title: 'Your Mentorship Team', body: `You\'ll have a buddy for day-to-day questions, a mentor for career growth, and a manager for regular feedback.`, img: ib(8) },
        { layout: 'split', eyebrow: 'SUPPORT', title: 'Two Support Channels', body0: `Buddy: A peer who helps you navigate the first 90 days.`, body1: `Mentor: A senior colleague who guides your long-term growth.`, img: ib(8) },
        { layout: 'divider', no: 9, title: 'Goals & KPIs', sub: 'What success looks like', img: ib(9) },
        { layout: 'stats', title: '30-60-90 Day Goals', stats: [{ val: '30d', lab: 'Set up & Learn' }, { val: '60d', lab: 'Contribute' }, { val: '90d', lab: 'Own & Lead' }, { val: '12mo', lab: 'Expert' }], body: `Clear goals for your first 90 days and first year.`, img: ib(9) },
        { layout: 'closing', eyebrow: 'Welcome Aboard', title: `${theme.company} Onboarding`, sub: theme.tagline, img: ib(9) },
      ]
    },
  },
]

/* ---------------- 文档变体构建器 ---------------- */

const DOC_VARIANT_ORDERS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 0, 4, 3, 5, 7, 6, 8, 9],
  [2, 0, 1, 5, 3, 4, 8, 6, 7, 9],
  [0, 2, 1, 3, 5, 4, 6, 9, 7, 8],
]

function makeDocVariants(basePages, theme, imgBase, variant) {
  const cover = basePages[0]
  const agenda = basePages[1]
  const closing = basePages[basePages.length - 1]
  const middle = basePages.slice(2, -1)

  const sections = []
  let current = null
  for (const page of middle) {
    if (page.layout === 'divider') {
      if (current) sections.push(current)
      current = [page]
    } else {
      if (current) current.push(page)
      else current = [page]
    }
  }
  if (current) sections.push(current)

  const order = DOC_VARIANT_ORDERS[variant % DOC_VARIANT_ORDERS.length]
  const reordered = order.map((i) => sections[i]).filter(Boolean)

  const m = theme.metrics
  const ib = (n) => (imgBase + n) % 11
  const extra = []

  if (variant === 1) {
    extra.push({ layout: 'quote', quote: `What gets measured gets managed.`, source: `${theme.company}` , img: ib(6) })
    extra.push({ layout: 'stats', title: `${theme.industry} Snapshot`, stats: [{ val: m[0], lab: 'Size' }, { val: m[1], lab: 'Growth' }, { val: m[2], lab: 'Investment' }, { val: m[3], lab: 'Scale' }], body: `Quick overview of ${theme.industry} market dynamics.`, img: ib(7) })
  } else if (variant === 2) {
    extra.push({ layout: 'comparison', title: 'Approaches Compared', leftTitle: 'Traditional', rightTitle: 'Modern', left: ['Manual', 'Expensive', 'Limited', 'Slow'], right: ['Automated', 'Affordable', 'Scalable', 'Fast'], img: ib(6) })
    extra.push({ layout: 'big-stat', eyebrow: 'IMPACT', stat: m[0], sub: 'Market Size', body: `${theme.company} operates in a ${m[0]} market.`, img: ib(7) })
  } else if (variant === 3) {
    extra.push({ layout: 'timeline', title: `${theme.company} Timeline`, steps: ['Founded', 'Growth Phase', 'Expansion', 'Industry Leader', 'Future Vision'], img: ib(6) })
    extra.push({ layout: 'split', eyebrow: 'VISION', title: 'Two Pillars', body0: `Innovation: Push boundaries in ${theme.industry}.`, body1: `Impact: Create lasting value.`, img: ib(7) })
  }

  return [cover, agenda, ...reordered.flat(), ...extra, closing]
}

/* ---------------- 文档模板生成 ---------------- */

export function generateDocumentTemplates() {
  const templates = []
  let themeIdx = 0
  let globalIdx = 0
  const variantsPerCategory = Math.ceil(500 / DOC_CATEGORIES.length)

  for (const catDef of DOC_CATEGORIES) {
    for (let i = 0; i < variantsPerCategory && themeIdx < DOC_THEMES.length * 10; i++) {
      // 循环使用主题，但每个模板有不同的公司名和行业
      const themeBase = DOC_THEMES[themeIdx % DOC_THEMES.length]
      const theme = {
        company: `${themeBase.company} ${themeIdx + 1}`,
        industry: themeBase.industry,
        tagline: themeBase.tagline,
        metrics: themeBase.metrics,
        serial: themeIdx + 1,
      }
      const variant = (themeIdx) % 4
      const fw = globalIdx % 50
      const pal = (globalIdx * 7) % 16
      const font = (theme.serial + i) % 3
      const imgBase = globalIdx % 11

      const basePages = catDef.build(theme, imgBase, variant)
      const pages = makeDocVariants(basePages, theme, imgBase, variant)

      templates.push({
        id: `${catDef.type}-doc-${i}`,
        name: `${theme.company} ${catDef.name}`,
        zh: catDef.zh,
        a: `${theme.company} ${catDef.name}`,
        b: theme.tagline,
        cat: catDef.cat,
        format: '文档',
        fw,
        pal,
        font,
        pageCount: pages.length,
        imgCount: 6,
        images: IMG_KEYS.map((_, k) => IMG[IMG_KEYS[(imgBase + k) % 11]]),
        pages,
        seed: theme.serial * 1000 + 7,
        serial: theme.serial,
        presentation: true,
        docMode: true,
      })
      themeIdx++
      globalIdx++
    }
  }

  return templates
}

export const GENERATED_DOCUMENT_TEMPLATES = generateDocumentTemplates()
