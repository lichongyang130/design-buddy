/* ============================================================
   DesignBuddy 商业级演示文稿模板（英文版）
   5 个模板 × 30-35 页，西方特色，内容丰富，含真实图片
   ============================================================ */

import { FRAMEWORKS, PALETTES, FONT_PAIRS } from './template-engine.js'
import { GENERATED_PRESENTATION_TEMPLATES, IMG } from './presentation-generator.js'

/* ---------------- 图片池（从生成器导入） ---------------- */
/* IMG 从 presentation-generator.js 导入 */

/* ---------------- 模板定义 ---------------- */

const PRESENTATION_TEMPLATES_MANUAL = [
  /* ========== 1. Investor Pitch Deck ========== */
  {
    id: 'pitch-deck',
    name: 'Investor Pitch Deck',
    zh: '投资人融资演讲稿',
    a: 'Series A Fundraising Pitch',
    b: 'Raising $15M to Redefine Enterprise AI',
    cat: '融资演讲稿',
    format: '演示文稿',
    fw: 16, pal: 1, font: 1,
    pageCount: 35, imgCount: 6,
    images: [IMG.g, IMG.h, IMG.i, IMG.j, IMG.k, IMG.a],
    pages: [
      { layout: 'cover', eyebrow: 'SERIES A · 2025', title: 'Series A Fundraising Pitch', sub: 'RAISING $15M TO REDEFINE ENTERPRISE AI', img: 6 },
      { layout: 'agenda', title: 'Agenda', items: ['Market Opportunity', 'The Problem', 'Our Solution', 'Technology', 'Traction', 'Business Model', 'Team', 'Financials', 'The Ask'], img: 6 },
      { layout: 'divider', no: 1, title: 'Market Opportunity', sub: 'A $48B market growing at 32% annually', img: 7 },
      { layout: 'stats', title: 'The AI Infrastructure Boom', stats: [
        { v: '$48B', l: 'Total Market Size' }, { v: '32%', l: 'CAGR' },
        { v: '$12B', l: 'Enterprise AI Spend' }, { v: '4.2M', l: 'Developers Building on AI' },
      ], body: 'Enterprises are racing to adopt AI, but the infrastructure layer remains fragmented and underserved.', img: 7 },
      { layout: 'hero', eyebrow: 'MARKET OPPORTUNITY', title: 'Why Now', body: 'Three converging forces — model capability, cost reduction, and regulatory pressure — are creating a once-in-a-decade window for AI infrastructure.', img: 8 },
      { layout: 'divider', no: 2, title: 'The Problem', sub: 'Enterprises are bleeding time and money on AI adoption', img: 8 },
      { layout: 'hero', eyebrow: 'THE PROBLEM', title: 'AI Adoption is Broken', body: '73% of enterprises report that their AI projects fail to reach production. The root cause is not model quality — it is infrastructure fragmentation.', img: 8 },
      { layout: 'split', eyebrow: 'Pain Points', title: 'Three Structural Barriers', body0: 'Fragmented tooling: 15+ separate tools for deployment, monitoring, and scaling — each with its own dashboard and learning curve.', body1: 'Hidden costs: model inference costs are unpredictable, with 40% of budgets blown on over-provisioning and idle capacity.', img: 9 },
      { layout: 'divider', no: 3, title: 'Our Solution', sub: 'The unified AI infrastructure platform', img: 9 },
      { layout: 'hero', eyebrow: 'OUR SOLUTION', title: 'One Platform. Every Model. Zero Friction.', body: 'NebulaAI provides a single control plane for deploying, scaling, and monitoring any AI model — from open-source to proprietary — with predictable costs and enterprise-grade reliability.', img: 9 },
      { layout: 'split', eyebrow: 'How It Works', title: 'Deploy in Minutes, Not Weeks', body0: 'Connect your models — any framework, any cloud, any region. NebulaAI handles the rest.', body1: 'Auto-scaling, load balancing, cost optimization, and observability — all in one dashboard.', img: 10 },
      { layout: 'timeline', title: 'Development Journey', steps: ['MVP (2024 Q1)', 'Private Beta (2024 Q2)', 'Public Launch (2024 Q3)', 'Series A (2025 Q1)', 'Enterprise Scale (2025 Q3)', 'Global Expansion (2026 Q1)'], img: 10 },
      { layout: 'divider', no: 4, title: 'Technology', sub: 'Built for scale, designed for reliability', img: 10 },
      { layout: 'big-stat', eyebrow: 'TECH EDGE', stat: '99.99%', sub: 'Uptime SLA', body: 'Our globally distributed architecture delivers four-nines uptime with automatic failover across regions.', img: 0 },
      { layout: 'comparison', title: 'Technology Comparison', leftTitle: 'Legacy Approach', rightTitle: 'NebulaAI',
        left: ['Manual scaling, hours of downtime', 'Per-model silos, no unified view', 'Costs scale linearly with usage'],
        right: ['Auto-scaling, zero-downtime deploys', 'Single pane of glass for all models', 'Cost optimization saves 40-60%'], img: 0 },
      { layout: 'divider', no: 5, title: 'Traction', sub: 'Momentum that speaks for itself', img: 0 },
      { layout: 'stats', title: 'Key Growth Metrics', stats: [
        { v: '$2.8M', l: 'ARR' }, { v: '180+', l: 'Enterprise Customers' },
        { v: '94%', l: 'Net Revenue Retention' }, { v: '3.2x', l: 'YoY Growth' },
      ], body: 'From $0 to $2.8M ARR in 18 months, with 94% net revenue retention — best-in-class for B2B SaaS at our stage.', img: 6 },
      { layout: 'table', title: 'Milestone Timeline', head: ['Quarter', 'MRR', 'Customers', 'Key Milestone'],
        rows: [
          ['Q1 2024', '$15K', '3', 'MVP launched'],
          ['Q2 2024', '$85K', '25', 'Private beta'],
          ['Q3 2024', '$320K', '80', 'Public launch'],
          ['Q4 2024', '$1.1M', '140', 'Series A prep'],
          ['Q1 2025', '$2.8M', '180', 'Series A close'],
        ], img: 7 },
      { layout: 'divider', no: 6, title: 'Business Model', sub: 'A scalable, repeatable revenue engine', img: 7 },
      { layout: 'timeline', title: 'Monetization Path', steps: ['Usage-based pricing', 'Enterprise contracts', 'Platform licensing', 'Marketplace revenue', 'API monetization', 'Data services'], img: 8 },
      { layout: 'big-stat', eyebrow: 'UNIT ECONOMICS', stat: '$48K', sub: 'Average Annual Contract Value', body: 'With 94% gross margins and a 14-month payback period, our unit economics are best-in-class for B2B infrastructure.', img: 8 },
      { layout: 'comparison', title: 'Competitive Analysis', leftTitle: 'Competitors', rightTitle: 'NebulaAI',
        left: ['Niche focus, limited scope', 'Complex pricing, hard to predict', 'Limited multi-cloud support'],
        right: ['Full-stack AI infrastructure', 'Transparent, usage-based pricing', 'Cloud-agnostic from day one'], img: 9 },
      { layout: 'divider', no: 7, title: 'Team', sub: 'Operators who have done it before', img: 9 },
      { layout: 'hero', eyebrow: 'THE TEAM', title: 'Built by Operators, for Operators', body: 'Our founding team has shipped AI infrastructure at scale — from early-stage startups to Fortune 500 enterprises.', img: 9 },
      { layout: 'stats', title: 'Team Composition', stats: [
        { v: '24', l: 'Team Members' }, { v: '12', l: 'Engineers' },
        { v: '5', l: 'PhDs in ML' }, { v: '8', l: 'Years Avg Experience' },
      ], body: 'A lean, senior team with deep expertise in distributed systems, ML infrastructure, and enterprise sales.', img: 10 },
      { layout: 'divider', no: 8, title: 'Financials', sub: 'Three-year projection', img: 10 },
      { layout: 'table', title: 'Financial Projection', head: ['Metric', 'Year 1', 'Year 2', 'Year 3'],
        rows: [
          ['ARR', '$8M', '$35M', '$120M'],
          ['Customers', '400', '1,200', '3,500'],
          ['Gross Margin', '82%', '85%', '88%'],
          ['Net Income', '-$3M', '$4M', '$18M'],
        ], img: 10 },
      { layout: 'stats', title: 'Key Financial Metrics', stats: [
        { v: '$15M', l: 'Funding Raised' }, { v: '$8M', l: 'Year 1 ARR Target' },
        { v: '18mo', l: 'Runway' }, { v: '3.2x', l: 'YoY Growth Rate' },
      ], body: 'Conservative projections with clear paths to $120M ARR by Year 3.', img: 0 },
      { layout: 'divider', no: 9, title: 'The Ask', sub: 'Join us in building the future', img: 0 },
      { layout: 'big-stat', eyebrow: 'THE ASK', stat: '$15M', sub: 'Series A Round', body: 'Raising $15M to accelerate product development, expand sales capacity, and scale infrastructure globally.', img: 0 },
      { layout: 'timeline', title: 'Use of Funds', steps: ['Product (40%)', 'Sales (30%)', 'Engineering (20%)', 'Operations (10%)'], img: 6 },
      { layout: 'comparison', title: 'Why NebulaAI', leftTitle: 'Risks', rightTitle: 'Mitigations',
        left: ['Market timing risk', 'Execution risk', 'Competitive risk'],
        right: ['$48B market, 32% CAGR', 'Proven team, $2.8M ARR', 'Technology 2x ahead'], img: 7 },
      { layout: 'quote', quote: 'The best infrastructure companies are invisible — they just work. That is what we are building.', source: 'CEO, NebulaAI', img: 8 },
      { layout: 'table', title: 'Investment Terms', head: ['Term', 'Detail', 'Value'],
        rows: [
          ['Round', 'Series A Preferred', '—'],
          ['Amount', '$15,000,000', '—'],
          ['Valuation', '$80M Post-Money', '—'],
          ['Instrument', '1x Non-Participating Preferred', '—'],
        ], img: 9 },
      { layout: 'closing', title: 'Thank You', sub: 'Let\'s build the future of enterprise AI together', img: 0 },
    ],
  },

  /* ========== 2. Quarterly Business Review ========== */
  {
    id: 'qbr-report',
    name: 'Quarterly Business Review',
    zh: '季度业务复盘报告',
    a: 'Q4 2025 Business Review',
    b: 'Performance, Insights & Forward Outlook',
    cat: '报告',
    format: '演示文稿',
    fw: 11, pal: 6, font: 1,
    pageCount: 30, imgCount: 6,
    images: [IMG.h, IMG.i, IMG.j, IMG.k, IMG.a, IMG.b],
    pages: [
      { layout: 'cover', eyebrow: 'QBR · Q4 2025', title: 'Quarterly Business Review', sub: 'PERFORMANCE, INSIGHTS & FORWARD OUTLOOK', img: 1 },
      { layout: 'agenda', title: 'Contents', items: ['Executive Summary', 'Financial Performance', 'Key Initiatives', 'Customer Metrics', 'Market Analysis', 'Operational Excellence', 'Q1 2026 Outlook', 'Strategic Priorities'], img: 1 },
      { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'A quarter of exceeding expectations', img: 2 },
      { layout: 'stats', title: 'Q4 Headline Numbers', stats: [
        { v: '$12.4M', l: 'Revenue' }, { v: '+28%', l: 'vs Q3' },
        { v: '1,847', l: 'Active Customers' }, { v: '94.2%', l: 'NPS' },
      ], body: 'Q4 delivered record revenue growth, expanded into three new markets, and achieved the highest customer satisfaction score in company history.', img: 2 },
      { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: 'Above Plan on Every Metric', body: 'We exceeded our Q4 revenue target by 12%, grew net new logos by 34%, and reduced churn to a record-low 1.8%.', img: 3 },
      { layout: 'divider', no: 2, title: 'Financial Performance', sub: 'Strong revenue growth with improving margins', img: 3 },
      { layout: 'stats', title: 'Revenue Breakdown', stats: [
        { v: '$12.4M', l: 'Total Revenue' }, { v: '$8.1M', l: 'Subscription' },
        { v: '$3.3M', l: 'Services' }, { v: '$1.0M', l: 'Other' },
      ], body: 'Subscription revenue grew 31% YoY, now representing 65% of total revenue — a healthy shift toward recurring revenue.', img: 3 },
      { layout: 'table', title: 'Quarterly Revenue Trend', head: ['Quarter', 'Revenue', 'Growth', 'Margin'],
        rows: [
          ['Q1 2025', '$8.2M', '+18%', '68%'],
          ['Q2 2025', '$9.5M', '+16%', '70%'],
          ['Q3 2025', '$9.7M', '+2%', '72%'],
          ['Q4 2025', '$12.4M', '+28%', '75%'],
        ], img: 4 },
      { layout: 'hero', eyebrow: 'PROFITABILITY', title: 'Margin Expansion', body: 'Gross margin improved to 75%, driven by scale efficiencies and a shift toward higher-margin subscription revenue.', img: 4 },
      { layout: 'divider', no: 3, title: 'Key Initiatives', sub: 'What we shipped this quarter', img: 4 },
      { layout: 'timeline', title: 'Product Launches', steps: ['NebulaAI Platform 2.0', 'Multi-Region Deployment', 'AI Cost Optimizer', 'Enterprise SSO', 'Advanced Analytics', 'API Marketplace'], img: 5 },
      { layout: 'split', eyebrow: 'Platform 2.0', title: 'The Biggest Release Yet', body0: 'Platform 2.0 introduces multi-region deployment, AI cost optimization, and advanced analytics — features our top 50 customers requested.', body1: 'Early adopters report 40-60% cost savings and 3x faster deployment times.', img: 5 },
      { layout: 'stats', title: 'Initiative Impact', stats: [
        { v: '3', l: 'New Markets Entered' }, { v: '47', l: 'Features Shipped' },
        { v: '$2.2M', l: 'Cost Savings Delivered' }, { v: '92%', l: 'On-Time Delivery' },
      ], body: 'We shipped 47 features across 12 initiatives, entering three new markets and delivering $2.2M in customer cost savings.', img: 6 },
      { layout: 'divider', no: 4, title: 'Customer Metrics', sub: 'The metrics that matter', img: 6 },
      { layout: 'stats', title: 'Customer Health Scorecard', stats: [
        { v: '1,847', l: 'Active Customers' }, { v: '34', l: 'Net New Logos' },
        { v: '1.8%', l: 'Churn Rate' }, { v: '94.2%', l: 'NPS Score' },
      ], body: 'Customer growth accelerated, churn hit record lows, and NPS reached an all-time high of 94.2.', img: 1 },
      { layout: 'comparison', title: 'Customer Satisfaction', leftTitle: 'Last Quarter', rightTitle: 'This Quarter',
        left: ['NPS: 89.1', 'Churn: 2.4%', 'CSAT: 4.3/5', 'Retention: 92%'],
        right: ['NPS: 94.2', 'Churn: 1.8%', 'CSAT: 4.6/5', 'Retention: 95%'], img: 2 },
      { layout: 'divider', no: 5, title: 'Market Analysis', sub: 'Positioned for continued growth', img: 2 },
      { layout: 'big-stat', eyebrow: 'MARKET POSITION', stat: '#3', sub: 'Market Share in AI Infrastructure', body: 'We are now the #3 player in the AI infrastructure market, with a 7% market share and the fastest growth rate among top 10 competitors.', img: 3 },
      { layout: 'comparison', title: 'Competitive Landscape', leftTitle: 'Traditional Players', rightTitle: 'NebulaAI',
        left: ['Slow innovation cycles', 'Complex pricing models', 'Limited AI-native features'],
        right: ['Rapid feature delivery', 'Transparent usage pricing', 'AI-native from the ground up'], img: 3 },
      { layout: 'table', title: 'Market Growth Projection', head: ['Year', 'Market Size', 'Our ARR', 'Share'],
        rows: [
          ['2024', '$28B', '$3.1M', '0.01%'],
          ['2025', '$37B', '$48M', '0.13%'],
          ['2026', '$48B', '$120M', '0.25%'],
          ['2027', '$62B', '$280M', '0.45%'],
        ], img: 4 },
      { layout: 'divider', no: 6, title: 'Operational Excellence', sub: 'Building a scalable, efficient organization', img: 4 },
      { layout: 'stats', title: 'Operational Metrics', stats: [
        { v: '24', l: 'Team Members' }, { v: '$85K', l: 'Revenue per Employee' },
        { v: '92%', l: 'On-Time Delivery' }, { v: '0', l: 'Critical Incidents' },
      ], body: 'We maintained zero critical incidents while achieving $85K revenue per employee — a 22% improvement over Q3.', img: 5 },
      { layout: 'timeline', title: 'Operational Improvements', steps: ['Process automation', 'Cross-team collaboration', 'Hiring pipeline', 'Tool consolidation', 'Cost optimization', 'Quality assurance'], img: 5 },
      { layout: 'divider', no: 7, title: 'Q1 2026 Outlook', sub: 'Looking ahead', img: 5 },
      { layout: 'stats', title: 'Q1 2026 Targets', stats: [
        { v: '$15M', l: 'Revenue Target' }, { v: '50', l: 'Net New Logos' },
        { v: '95+', l: 'NPS Target' }, { v: '3', l: 'New Markets' },
      ], body: 'We are targeting $15M revenue in Q1 2026, with continued margin expansion and market expansion.', img: 6 },
      { layout: 'table', title: 'Q1 2026 Initiatives', head: ['Initiative', 'Investment', 'Expected Impact'],
        rows: [
          ['Platform 3.0', '$3.5M', '+$5M ARR'],
          ['Sales Expansion', '$2.0M', '+50 logos'],
          ['Market Entry (APAC)', '$1.5M', '+3 markets'],
          ['AI Research', '$1.0M', '2x model efficiency'],
        ], img: 6 },
      { layout: 'divider', no: 8, title: 'Strategic Priorities', sub: 'Where we are focused', img: 6 },
      { layout: 'comparison', title: 'Strategic Priorities', leftTitle: 'FY 2026', rightTitle: 'Success Metrics',
        left: ['Scale to $150M ARR', 'Expand to 5 new markets', 'Launch Platform 3.0', 'Achieve 90%+ NRR'],
        right: ['3x YoY growth', '5,000+ customers', '40% cost reduction', 'Best-in-class retention'], img: 1 },
      { layout: 'quote', quote: 'Q4 proved that our strategy works. Now we execute with even greater ambition.', source: 'CEO, NebulaAI', img: 2 },
      { layout: 'closing', title: 'Thank You', sub: 'Q4 2025 Quarterly Business Review', img: 6 },
    ],
  },

  /* ========== 3. Brand Heritage Story ========== */
  {
    id: 'brand-story',
    name: 'Brand Heritage Story',
    zh: '品牌传承故事',
    a: 'Maison Lumière — Heritage & Craft',
    b: 'A Century of Artistry in Light',
    cat: '品牌设计',
    format: '演示文稿',
    fw: 29, pal: 2, font: 0,
    pageCount: 35, imgCount: 6,
    images: [IMG.i, IMG.j, IMG.k, IMG.a, IMG.b, IMG.c],
    pages: [
      { layout: 'cover', eyebrow: 'HERITAGE · 1928—2025', title: 'Maison Lumière', sub: 'A CENTURY OF ARTISTRY IN LIGHT', img: 7 },
      { layout: 'agenda', title: 'Our Story', items: ['The Origin', 'The Craft', 'The Vision', 'The Collections', 'The Atelier', 'The Legacy'], img: 7 },
      { layout: 'divider', no: 1, title: 'The Origin', sub: 'Where it all began', img: 8 },
      { layout: 'hero', eyebrow: '1928 · PARIS', title: 'A Workshop on Rue de Rivoli', body: 'In a small atelier on Rue de Rivoli, Édouard Lumière began crafting light fixtures by hand — each one a unique work of art.', img: 8 },
      { layout: 'quote', quote: 'Light is not something we manufacture. It is something we liberate.', source: 'Édouard Lumière, Founder', img: 8 },
      { layout: 'stats', title: 'The Early Years', stats: [
        { v: '1928', l: 'Founded in Paris' }, { v: '47', l: 'First Collection Pieces' },
        { v: '3', l: 'Atelier Workers' }, { v: '12', l: 'First Patrons' },
      ], body: 'From a single atelier with three workers, Maison Lumière grew slowly — each piece crafted by hand, each design a conversation with light.', img: 9 },
      { layout: 'divider', no: 2, title: 'The Craft', sub: 'The art of hand-making light', img: 9 },
      { layout: 'split', eyebrow: 'The Atelier', title: 'Where Craft Meets Light', body0: 'Every Maison Lumière piece passes through seven pairs of hands. From the initial sketch to the final polish, no step is rushed.', body1: 'Our master craftspeople train for a decade before their work is considered finished.', img: 9 },
      { layout: 'timeline', title: 'The Craft Process', steps: ['Design Sketch', 'Material Selection', 'Hand Forming', 'Finishing', 'Light Calibration', 'Quality Sign-off'], img: 10 },
      { layout: 'stats', title: 'Craft Metrics', stats: [
        { v: '7', l: 'Hands per Piece' }, { v: '120h', l: 'Per Piece Average' },
        { v: '10yr', l: 'Training Period' }, { v: '0.01mm', l: 'Precision Tolerance' },
      ], body: 'Each piece requires 120 hours of handwork, with a precision tolerance of 0.01mm — the width of a human hair.', img: 10 },
      { layout: 'divider', no: 3, title: 'The Vision', sub: 'Our philosophy of light', img: 10 },
      { layout: 'hero', eyebrow: 'OUR VISION', title: 'Light That Speaks, But Never Shouts', body: 'We believe the most beautiful light is the light you do not notice — it simply makes everything else visible.', img: 10 },
      { layout: 'quote', quote: 'A great design disappears. What remains is the experience it creates.', source: 'Clara Lumière, Creative Director', img: 0 },
      { layout: 'split', eyebrow: 'Design Philosophy', title: 'Three Principles', body0: 'Restraint: We remove until only the essential remains. What you see is what matters; what you do not see is what makes it work.', body1: 'Proportion: Every dimension follows the golden ratio. Light is not placed — it is composed.', img: 0 },
      { layout: 'divider', no: 4, title: 'The Collections', sub: 'A century of iconic designs', img: 0 },
      { layout: 'triple-grid', title: 'Signature Collections', sub: 'Each collection is a chapter in our century-long conversation with light', img: 0 },
      { layout: 'stats', title: 'Collection Highlights', stats: [
        { v: '12', l: 'Signature Collections' }, { v: '340+', l: 'Designs in Production' },
        { v: '8', l: 'Limited Editions' }, { v: '47', l: 'Award-Winning Pieces' },
      ], body: 'From the iconic Étoile chandelier to the minimalist Lumière Linear, our collections span every style and era.', img: 1 },
      { layout: 'timeline', title: 'Collection Timeline', steps: ['1928 Étoile', '1952 Aurora', '1971 Linear', '1995 Prism', '2010 Nebula', '2025 Quantum'], img: 1 },
      { layout: 'divider', no: 5, title: 'The Atelier', sub: 'Where the magic happens', img: 1 },
      { layout: 'hero', eyebrow: 'THE ATELIER', title: 'A Sanctuary of Craft', body: 'Our Paris atelier is a living museum — where 1928 meets 2025, and where every piece begins its journey.', img: 7 },
      { layout: 'stats', title: 'Atelier Facts', stats: [
        { v: '3,200㎡', l: 'Atelier Space' }, { v: '48', l: 'Master Craftspeople' },
        { v: '12', l: 'Specialized Workshops' }, { v: '9', l: 'Decades of Heritage' },
      ], body: 'Our atelier houses 48 master craftspeople across 12 specialized workshops, each dedicated to a single craft.', img: 7 },
      { layout: 'split', eyebrow: 'The Workshops', title: 'Twelve Workshops, One Vision', body0: 'From the Glass Studio to the Metal Foundry, from the Textile Atelier to the Light Calibration Room — each workshop is a world unto itself.', body1: 'But they share one language: the language of light.', img: 8 },
      { layout: 'divider', no: 6, title: 'The Legacy', sub: 'A century and counting', img: 8 },
      { layout: 'stats', title: 'By the Numbers', stats: [
        { v: '97', l: 'Years of Heritage' }, { v: '12', l: 'Global Boutiques' },
        { v: '64', l: 'Countries Served' }, { v: '1.2M', l: 'Pieces Installed' },
      ], body: 'From a single Paris atelier to 12 global boutiques, Maison Lumière has brought light to over a million spaces worldwide.', img: 9 },
      { layout: 'comparison', title: 'Our Promise', leftTitle: 'What We Promise', rightTitle: 'What You Receive',
        left: ['Lifetime craftsmanship', 'Timeless design', 'Personalized service', 'Global preservation'],
        right: ['Heirloom-quality pieces', 'Designs that transcend eras', 'A dedicated advisor', 'Worldwide maintenance'], img: 9 },
      { layout: 'quote', quote: 'We do not make products. We create heirlooms — pieces that will be passed down through generations.', source: 'Henri Lumière, Current CEO', img: 10 },
      { layout: 'stats', title: 'Future Vision', stats: [
        { v: '2028', l: 'Centennial Year' }, { v: '3', l: 'New Ateliers Planned' },
        { v: '20', l: 'New Boutiques' }, { v: '100%', l: 'Sustainable Materials' },
      ], body: 'As we approach our centennial in 2028, we are expanding to three new ateliers and 20 new boutiques worldwide.', img: 10 },
      { layout: 'timeline', title: 'The Next Century', steps: ['2026 — Atelier Expansion', '2027 — Sustainable Transition', '2028 — Centennial Collection', '2030 — Digital Heritage', '2035 — Global Atelier Network', '2040 — Foundation Launch'], img: 0 },
      { layout: 'divider', no: 7, title: 'The Experience', sub: 'How we serve our patrons', img: 0 },
      { layout: 'hero', eyebrow: 'THE EXPERIENCE', title: 'From Consultation to Installation', body: 'Our patrons do not buy products. They commission experiences — each one tailored to their space, their taste, their light.', img: 0 },
      { layout: 'timeline', title: 'The Commission Process', steps: ['Consultation', 'Design Proposal', 'Atelier Visit', 'Crafting', 'Installation', 'Lifetime Care'], img: 1 },
      { layout: 'comparison', title: 'The Lumière Difference', leftTitle: 'Mass Production', rightTitle: 'Maison Lumière',
        left: ['10,000 identical pieces', '6-month lead time', 'No personalization', '5-year warranty'],
        right: ['1 of 1, hand-crafted', '6-12 month commission', 'Fully personalized', 'Lifetime guarantee'], img: 1 },
      { layout: 'quote', quote: 'The most beautiful light is the light that was made just for you.', source: 'Maison Lumière Manifesto', img: 7 },
      { layout: 'closing', title: 'Thank You', sub: 'MAISON LUMIERE · A CENTURY OF ARTISTRY IN LIGHT', img: 7 },
    ],
  },

  /* ========== 4. Market Expansion Strategy ========== */
  {
    id: 'market-strategy',
    name: 'Market Expansion Strategy',
    zh: '市场拓展战略',
    a: 'Global Expansion Blueprint',
    b: 'Entering 5 New Markets in 18 Months',
    cat: '商业规划',
    format: '演示文稿',
    fw: 2, pal: 6, font: 1,
    pageCount: 30, imgCount: 6,
    images: [IMG.j, IMG.k, IMG.a, IMG.b, IMG.c, IMG.d],
    pages: [
      { layout: 'cover', eyebrow: 'STRATEGY · 2025—2026', title: 'Global Expansion Blueprint', sub: 'ENTERING 5 NEW MARKETS IN 18 MONTHS', img: 2 },
      { layout: 'agenda', title: 'Strategic Plan', items: ['Current State', 'Market Selection', 'Go-to-Market', 'Operational Plan', 'Financial Model', 'Risk Assessment', 'Timeline & Milestones'], img: 2 },
      { layout: 'divider', no: 1, title: 'Current State', sub: 'Where we are today', img: 3 },
      { layout: 'stats', title: 'Current Market Position', stats: [
        { v: '$48M', l: 'Current ARR' }, { v: '3', l: 'Current Markets' },
        { v: '1,200', l: 'Customers' }, { v: '82%', l: 'Gross Margin' },
      ], body: 'Currently operating in three markets (North America, Western Europe, Japan) with $48M ARR and 1,200 customers.', img: 3 },
      { layout: 'hero', eyebrow: 'CURRENT STATE', title: 'Strong Foundation, Global Ambitions', body: 'We have proven our model in three mature markets. Now we replicate that success in five high-growth regions.', img: 3 },
      { layout: 'divider', no: 2, title: 'Market Selection', sub: 'Where to expand and why', img: 4 },
      { layout: 'stats', title: 'Target Markets Overview', stats: [
        { v: '5', l: 'New Markets' }, { v: '$120M', l: 'Combined TAM' },
        { v: '24%', l: 'Average Growth Rate' }, { v: '18mo', l: 'Expansion Timeline' },
      ], body: 'We selected five markets based on TAM, growth rate, competitive landscape, and regulatory complexity.', img: 4 },
      { layout: 'table', title: 'Market Selection Matrix', head: ['Market', 'TAM', 'Growth', 'Competition', 'Priority'],
        rows: [
          ['APAC — Singapore', '$35B', '28%', 'Medium', 'Tier 1'],
          ['LATAM — Brazil', '$22B', '32%', 'Low', 'Tier 1'],
          ['MEA — Dubai', '$18B', '24%', 'Low', 'Tier 1'],
          ['APAC — India', '$28B', '35%', 'High', 'Tier 2'],
          ['EU — Nordics', '$17B', '18%', 'Medium', 'Tier 2'],
        ], img: 5 },
      { layout: 'comparison', title: 'Market Comparison', leftTitle: 'Tier 1 Markets', rightTitle: 'Tier 2 Markets',
        left: ['Singapore, Brazil, Dubai', 'High TAM, fast entry', 'Low competition', 'Immediate revenue'],
        right: ['India, Nordics', 'Very high TAM', 'High competition or slow growth', 'Phase 2 expansion'], img: 5 },
      { layout: 'divider', no: 3, title: 'Go-to-Market', sub: 'How we enter each market', img: 5 },
      { layout: 'timeline', title: 'Go-to-Market Strategy', steps: ['Market Research', 'Localization', 'Partner Selection', 'Pilot Launch', 'Scale-Up', 'Optimization'], img: 6 },
      { layout: 'split', eyebrow: 'Localization Approach', title: 'Think Global, Act Local', body0: 'Each market gets a tailored product: local language, local compliance, local payment methods, local support.', body1: 'But our core platform remains the same — one codebase, one architecture, localized on top.', img: 6 },
      { layout: 'stats', title: 'GTM Investment', stats: [
        { v: '$4.2M', l: 'Total GTM Budget' }, { v: '$1.5M', l: 'Per Tier 1 Market' },
        { v: '$1.8M', l: 'Tier 2 Combined' }, { v: '9mo', l: 'Average Time to Revenue' },
      ], body: 'We are allocating $4.2M for GTM activities across all five markets, with an average time to first revenue of 9 months.', img: 7 },
      { layout: 'divider', no: 4, title: 'Operational Plan', sub: 'Building the infrastructure', img: 7 },
      { layout: 'stats', title: 'Operational Requirements', stats: [
        { v: '5', l: 'Local Offices' }, { v: '40', l: 'New Hires' },
        { v: '12', l: 'Data Center Regions' }, { v: '6', l: 'Language Support' },
      ], body: 'Expanding to five markets requires 5 local offices, 40 new hires, 12 data center regions, and 6 language support teams.', img: 2 },
      { layout: 'timeline', title: 'Operational Timeline', steps: ['Office Setup (M1-3)', 'Hiring (M2-6)', 'Infrastructure (M3-9)', 'Compliance (M1-12)', 'Support (M4-9)', 'Optimization (M9-18)'], img: 2 },
      { layout: 'table', title: 'Hiring Plan', head: ['Role', 'Count', 'Markets', 'Timeline'],
        rows: [
          ['Country Managers', '5', 'All', 'M1-3'],
          ['Sales Directors', '8', 'All', 'M2-4'],
          ['Solution Engineers', '12', 'All', 'M3-6'],
          ['Support Engineers', '15', 'All', 'M4-8'],
        ], img: 3 },
      { layout: 'divider', no: 5, title: 'Financial Model', sub: 'The economics of expansion', img: 3 },
      { layout: 'stats', title: 'Expansion Investment', stats: [
        { v: '$8.5M', l: 'Total Investment' }, { v: '$4.2M', l: 'GTM' },
        { v: '$3.0M', l: 'Operations' }, { v: '$1.3M', l: 'Technology' },
      ], body: 'Total investment of $8.5M to enter five markets, with $4.2M for GTM, $3.0M for operations, and $1.3M for technology infrastructure.', img: 4 },
      { layout: 'table', title: 'Revenue Projection', head: ['Market', 'Y1 Revenue', 'Y2 Revenue', 'Y3 Revenue'],
        rows: [
          ['Singapore', '$4.5M', '$12M', '$28M'],
          ['Brazil', '$3.2M', '$9M', '$22M'],
          ['Dubai', '$2.8M', '$7.5M', '$18M'],
          ['India', '$1.5M', '$6M', '$15M'],
          ['Nordics', '$1.2M', '$4M', '$10M'],
        ], img: 4 },
      { layout: 'stats', title: 'Return on Investment', stats: [
        { v: '$15.2M', l: 'Y1 Revenue' }, { v: '$51M', l: 'Y2 Revenue' },
        { v: '$93M', l: 'Y3 Revenue' }, { v: '4.2x', l: 'ROI by Y3' },
      ], body: 'Expansion is expected to generate $15.2M in Year 1, growing to $93M by Year 3 — a 4.2x return on the $8.5M investment.', img: 5 },
      { layout: 'divider', no: 6, title: 'Risk Assessment', sub: 'Identifying and mitigating risks', img: 5 },
      { layout: 'comparison', title: 'Risk Mitigation', leftTitle: 'Key Risks', rightTitle: 'Mitigations',
        left: ['Regulatory complexity', 'Talent acquisition', 'Cultural fit', 'Competitive response', 'Infrastructure costs'],
        right: ['Local counsel in each market', 'Regional talent partners', 'Culture training program', 'Differentiated positioning', 'Cloud-agnostic architecture'], img: 6 },
      { layout: 'table', title: 'Risk Matrix', head: ['Risk', 'Probability', 'Impact', 'Mitigation'],
        rows: [
          ['Regulatory changes', 'Medium', 'High', 'Local counsel + monitoring'],
          ['Talent shortage', 'Medium', 'High', 'Regional partners + training'],
          ['Market rejection', 'Low', 'High', 'Pilot programs + feedback'],
          ['Cost overrun', 'Medium', 'Medium', 'Phased investment + reviews'],
        ], img: 6 },
      { layout: 'divider', no: 7, title: 'Timeline & Milestones', sub: 'The 18-month roadmap', img: 6 },
      { layout: 'timeline', title: 'Expansion Roadmap', steps: ['Q1: Market Research', 'Q2: Tier 1 Launch', 'Q3: Tier 1 Scale', 'Q4: Tier 2 Prep', 'Q5: Tier 2 Launch', 'Q6: Optimization'], img: 7 },
      { layout: 'table', title: 'Key Milestones', head: ['Month', 'Milestone', 'Investment', 'Revenue'],
        rows: [
          ['M3', 'Singapore office open', '$1.2M', '$0'],
          ['M6', 'Brazil pilot launch', '$1.5M', '$0.5M'],
          ['M9', 'Dubai launch', '$1.8M', '$2.0M'],
          ['M12', 'Tier 1 revenue target', '$2.5M', '$8.0M'],
          ['M18', 'All 5 markets live', '$8.5M', '$15.2M'],
        ], img: 7 },
      { layout: 'stats', title: 'Success Criteria', stats: [
        { v: '$15.2M', l: 'Y1 Revenue Target' }, { v: '500', l: 'New Customers' },
        { v: '90%', l: 'Market Coverage' }, { v: '18mo', l: 'Time to Break-even' },
      ], body: 'Success means $15.2M in Year 1 revenue, 500 new customers, 90% market coverage in target segments, and break-even within 18 months.', img: 2 },
      { layout: 'quote', quote: 'Global expansion is not about being everywhere. It is about being in the right places, at the right time, with the right preparation.', source: 'Strategy Director, NebulaAI', img: 3 },
      { layout: 'closing', title: 'Thank You', sub: 'GLOBAL EXPANSION BLUEPRINT · 2025—2026', img: 3 },
    ],
  },

  /* ========== 5. Product Launch Keynote ========== */
  {
    id: 'launch-keynote',
    name: 'Product Launch Keynote',
    zh: '产品发布主题演讲',
    a: 'NebulaAI Platform 3.0 Launch',
    b: 'The Future of Enterprise AI Infrastructure',
    cat: '营销材料',
    format: '演示文稿',
    fw: 44, pal: 4, font: 1,
    pageCount: 35, imgCount: 6,
    images: [IMG.k, IMG.a, IMG.b, IMG.c, IMG.d, IMG.e],
    pages: [
      { layout: 'cover', eyebrow: 'LAUNCH · 2025', title: 'NebulaAI Platform 3.0', sub: 'THE FUTURE OF ENTERPRISE AI INFRASTRUCTURE', img: 8 },
      { layout: 'agenda', title: 'Keynote Agenda', items: ['The Journey', 'The Problem', 'The Vision', 'The Platform', 'The Features', 'The Demo', 'The Pricing', 'The Future'], img: 8 },
      { layout: 'divider', no: 1, title: 'The Journey', sub: 'How we got here', img: 9 },
      { layout: 'timeline', title: 'Our Journey', steps: ['2023 — Founded', '2024 — Platform 1.0', '2024 — Platform 2.0', '2025 — Platform 3.0', '2026 — AI-Native', '2027 — Global'], img: 9 },
      { layout: 'stats', title: 'The Journey in Numbers', stats: [
        { v: '24mo', l: 'Since Founding' }, { v: '3', l: 'Platform Versions' },
        { v: '180+', l: 'Enterprise Customers' }, { v: '$2.8M', l: 'ARR' },
      ], body: 'In 24 months, we have shipped 3 platform versions, acquired 180+ enterprise customers, and reached $2.8M ARR.', img: 9 },
      { layout: 'divider', no: 2, title: 'The Problem', sub: 'What we are solving', img: 10 },
      { layout: 'hero', eyebrow: 'THE PROBLEM', title: 'Enterprise AI is Stuck', body: '73% of AI projects never reach production. The bottleneck is not models — it is infrastructure.', img: 10 },
      { layout: 'stats', title: 'The State of Enterprise AI', stats: [
        { v: '73%', l: 'Projects Fail' }, { v: '15+', l: 'Tools per Team' },
        { v: '40%', l: 'Budget Wasted' }, { v: '6mo', l: 'Avg Deployment Time' },
      ], body: 'Enterprises waste 40% of their AI budget on infrastructure overhead, with an average deployment time of 6 months.', img: 10 },
      { layout: 'comparison', title: 'Before vs After', leftTitle: 'Today', rightTitle: 'With Platform 3.0',
        left: ['6-month deployments', '15+ disconnected tools', 'Unpredictable costs', 'Manual scaling'],
        right: ['Minutes to deploy', 'One unified platform', 'Predictable pricing', 'Auto-scaling'], img: 0 },
      { layout: 'divider', no: 3, title: 'The Vision', sub: 'Where we are going', img: 0 },
      { layout: 'big-stat', eyebrow: 'OUR VISION', stat: '10x', sub: 'Faster. Cheaper. Better.', body: 'Platform 3.0 makes enterprise AI 10x faster to deploy, 10x cheaper to run, and 10x easier to manage.', img: 0 },
      { layout: 'quote', quote: 'We are not building a better tool. We are building a new category — one that makes AI infrastructure invisible.', source: 'CEO, NebulaAI', img: 0 },
      { layout: 'divider', no: 4, title: 'The Platform', sub: 'What we are launching', img: 1 },
      { layout: 'hero', eyebrow: 'PLATFORM 3.0', title: 'The Unified AI Infrastructure', body: 'One platform. Every model. Every cloud. Every region. Zero friction.', img: 1 },
      { layout: 'stats', title: 'Platform 3.0 at a Glance', stats: [
        { v: '50+', l: 'Model Support' }, { v: '6', l: 'Cloud Providers' },
        { v: '12', l: 'Regions' }, { v: '99.99%', l: 'Uptime SLA' },
      ], body: 'Platform 3.0 supports 50+ models across 6 cloud providers in 12 regions, with a 99.99% uptime SLA.', img: 1 },
      { layout: 'divider', no: 5, title: 'The Features', sub: 'Six new capabilities', img: 2 },
      { layout: 'timeline', title: 'New Features', steps: ['AI Cost Optimizer', 'Multi-Region Deployment', 'Advanced Analytics', 'Enterprise SSO', 'API Marketplace', 'AI Guardrails'], img: 2 },
      { layout: 'split', eyebrow: 'Feature 1', title: 'AI Cost Optimizer', body0: 'Automatically routes inference requests to the most cost-effective model and region.', body1: 'Early adopters report 40-60% cost reduction with zero accuracy loss.', img: 8 },
      { layout: 'split', eyebrow: 'Feature 2', title: 'Multi-Region Deployment', body0: 'Deploy to any region in minutes with automatic failover and load balancing.', body1: 'Global deployments are now 10x faster, with zero-downtime updates.', img: 9 },
      { layout: 'stats', title: 'Feature Impact', stats: [
        { v: '60%', l: 'Cost Reduction' }, { v: '10x', l: 'Faster Deployment' },
        { v: '99.99%', l: 'Uptime' }, { v: '40+', l: 'New Features' },
      ], body: 'Platform 3.0 delivers 60% cost reduction, 10x faster deployment, 99.99% uptime, and 40+ new features.', img: 9 },
      { layout: 'comparison', title: 'Platform Evolution', leftTitle: 'Platform 2.0', rightTitle: 'Platform 3.0',
        left: ['Single cloud', 'Manual scaling', 'Basic monitoring', '30 models'],
        right: ['Multi-cloud', 'Auto-scaling', 'Advanced analytics', '50+ models'], img: 10 },
      { layout: 'divider', no: 6, title: 'The Demo', sub: 'See it in action', img: 10 },
      { layout: 'hero', eyebrow: 'LIVE DEMO', title: 'Deploy in 90 Seconds', body: 'Watch as we deploy a production AI workload across three regions in under two minutes.', img: 10 },
      { layout: 'timeline', title: 'Demo Walkthrough', steps: ['Connect Model', 'Select Regions', 'Configure Rules', 'Deploy', 'Monitor', 'Scale'], img: 0 },
      { layout: 'stats', title: 'Demo Results', stats: [
        { v: '90s', l: 'Deployment Time' }, { v: '3', l: 'Regions Active' },
        { v: '$0.04', l: 'Cost per 1K Requests' }, { v: '0', l: 'Configuration Steps' },
      ], body: 'The demo shows a 90-second deployment across 3 regions at $0.04 per 1,000 requests with zero manual configuration.', img: 0 },
      { layout: 'divider', no: 7, title: 'The Pricing', sub: 'Simple, transparent, usage-based', img: 1 },
      { layout: 'stats', title: 'Pricing Tiers', stats: [
        { v: '$0', l: 'Starter (Free)' }, { v: '$499', l: 'Pro (Monthly)' },
        { v: 'Custom', l: 'Enterprise' }, { v: '$0.04', l: 'Per 1K Requests' },
      ], body: 'Start free. Upgrade when you need more. Pay only for what you use — no hidden fees, no surprises.', img: 1 },
      { layout: 'table', title: 'Pricing Comparison', head: ['Feature', 'Starter', 'Pro', 'Enterprise'],
        rows: [
          ['Requests/mo', '10K', '1M', 'Unlimited'],
          ['Regions', '1', '3', 'All 12'],
          ['Models', '5', '20', 'All 50+'],
          ['Support', 'Community', 'Business', 'Dedicated'],
        ], img: 2 },
      { layout: 'comparison', title: 'Cost Comparison', leftTitle: 'Industry Average', rightTitle: 'NebulaAI 3.0',
        left: ['$0.12 per 1K requests', '30% cost variance', 'Hidden fees', 'Over-provisioning'],
        right: ['$0.04 per 1K requests', '3% cost variance', 'Transparent pricing', 'Auto-optimization'], img: 2 },
      { layout: 'divider', no: 8, title: 'The Future', sub: 'What comes next', img: 2 },
      { layout: 'timeline', title: 'Roadmap', steps: ['Q1 2026 — AI-Native Features', 'Q2 2026 — Global Expansion', 'Q3 2026 — Marketplace', 'Q4 2026 — Autonomous Ops', '2027 — Platform 4.0', '2028 — $100M ARR'], img: 8 },
      { layout: 'stats', title: 'The Path to $100M', stats: [
        { v: '$100M', l: '2028 ARR Target' }, { v: '5,000', l: 'Customer Target' },
        { v: '12', l: 'Markets by 2027' }, { v: '90%', l: 'NRR Target' },
      ], body: 'Our path to $100M ARR by 2028 requires 5,000 customers across 12 markets with 90% net revenue retention.', img: 8 },
      { layout: 'quote', quote: 'Platform 3.0 is not an update. It is a redefinition of what enterprise AI infrastructure can be.', source: 'CEO, NebulaAI', img: 9 },
      { layout: 'comparison', title: 'The Bottom Line', leftTitle: 'Before 3.0', rightTitle: 'After 3.0',
        left: ['6-month deployments', '40% budget waste', '15+ tools', 'Manual everything'],
        right: ['90-second deployments', '60% cost reduction', '1 unified platform', 'Automated everything'], img: 1 },
      { layout: 'closing', title: 'Thank You', sub: 'NEBULAAI PLATFORM 3.0 — THE FUTURE IS NOW', img: 2 },
    ],
  },
]

/* ---------------- 元数据 ---------------- */

export function getPresentationMeta(tpl) {
  return {
    id: tpl.id,
    name: tpl.name,
    zh: tpl.zh,
    a: tpl.a,
    b: tpl.b,
    cats: [tpl.cat],
    cat: tpl.cat,
    format: tpl.format || '演示文稿',
    docMode: !!tpl.docMode,
    pageCount: tpl.pageCount,
    imgCount: tpl.imgCount,
    gen: true,
    serial: tpl.serial || 1,
    fw: tpl.fw,
    pal: tpl.pal,
    font: tpl.font,
    seed: tpl.seed || (tpl.serial * 1000 + 7),
    presentation: true,
    _tpl: tpl,
  }
}

export function getPresentationTemplates() {
  return PRESENTATION_TEMPLATES.map(getPresentationMeta)
}

/* ============================================================
   渲染函数：将自定义页面内容渲染为 HTML
   复用 template-engine.js 的 CSS 类名与结构
   ============================================================ */

function escapeHtml(s) {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function imgTag(imgIdx) {
  if (imgIdx == null || imgIdx < 0) return ''
  const key = Object.keys(IMG)[imgIdx]
  return `<div class="dp-art dp-art-img"><img loading="lazy" src="${IMG[key]}" alt=""></div>`
}

/**
 * 渲染单个自定义幻灯片
 * 结构: <div class="dp-page ifr-xx head-xx lay-xx" style="vars">
 *   <span class="dp-page-tag">NN / NN</span>
 *   <div class="dp-inner">...</div>
 * </div>
 */
export function renderPresentationSlide(tpl, pageIdx) {
  const page = tpl.pages[pageIdx]
  if (!page) return ''
  const lay = page.layout || 'split'
  const fw = FRAMEWORKS[tpl.fw] || FRAMEWORKS[0]
  const pal = PALETTES[tpl.pal] || PALETTES[0]
  const font = FONT_PAIRS[tpl.font || 0] || FONT_PAIRS[0]
  const rootVars = `--dp-bg:${pal[0]};--dp-paper:${pal[1]};--dp-ink:${pal[2]};--dp-muted:${pal[3]};--dp-accent:${pal[4]};--dp-accent2:${pal[5]};--dp-radius:${fw.radius}px;--dp-head:${font.head};--dp-body:${font.body};`
  const img = imgTag(page.img)
  const eb = (t) => t ? `<span class="dp-eyebrow">${escapeHtml(t)}</span>` : ''
  const h3 = (t) => `<h3>${escapeHtml(t)}</h3>`
  const h2 = (t) => `<h2>${escapeHtml(t)}</h2>`
  const p = (t) => t ? `<p>${escapeHtml(t)}</p>` : ''
  const lead = (t) => t ? `<p class="dp-lead">${escapeHtml(t)}</p>` : ''
  const tag = `<span class="dp-page-tag">${String(pageIdx + 1).padStart(2, '0')} / ${String(tpl.pages.length).padStart(2, '0')}</span>`

  let inner = ''

  switch (lay) {
    case 'cover':
      inner = `<div class="dp-cover-art">${img}</div>
        <div class="dp-cover-text">
          ${eb(page.eyebrow)}
          ${h2(page.title)}
          ${p(page.sub)}
        </div>`
      break

    case 'agenda':
      const agendaItems = (page.items || []).map((t, i) =>
        `<li><i>${String(i + 1).padStart(2, '0')}</i><span>${escapeHtml(t)}</span></li>`).join('')
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          ${eb(page.eyebrow)}
          ${h3(page.title)}
          <ol class="dp-agenda">${agendaItems}</ol>
        </div><div class="dp-side-art">${img}</div></div>`
      break

    case 'divider':
      inner = `<div class="dp-divider-art">${img}</div>
        <span class="dp-big-no">${String(pageIdx + 1).padStart(2, '0')}</span>
        ${h3(page.title)}
        ${p(page.sub)}`
      break

    case 'hero':
      inner = `<div class="dp-hero-art">${img}</div>
        <div class="dp-hero-copy">
          ${eb(page.eyebrow)}
          ${h3(page.title)}
          ${p(page.sub)}
          ${p(page.body)}
        </div>`
      break

    case 'split':
      inner = `<div class="dp-split-art">${img}</div>
        <div class="dp-split-copy">
          ${eb(page.eyebrow)}
          ${h3(page.title)}
          ${p(page.sub)}
          ${p(page.body)}
          ${p(page.body1)}
        </div>`
      break

    case 'stats':
      const statsHtml = (page.stats || []).map(s =>
        `<div class="dp-stat"><b>${escapeHtml(s.val)}</b><span>${escapeHtml(s.lab)}</span></div>`).join('')
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          ${h3(page.title)}
          <div class="dp-stats">${statsHtml}</div>
          ${p(page.body)}
        </div><div class="dp-side-art">${img}</div></div>`
      break

    case 'big-stat':
      inner = `<div class="dp-split-grid"><div class="dp-main-col dp-main-center">
          ${eb(page.eyebrow)}
          <b class="dp-big-stat">${escapeHtml(page.stat)}</b>
          ${lead(page.lab)}
          ${p(page.sub)}
        </div><div class="dp-side-art dp-side-round">${img}</div></div>`
      break

    case 'quote':
      inner = `<div class="dp-quote-art">${img}</div>
        <blockquote>${escapeHtml(page.quote)}</blockquote>
        ${eb(page.source)}`
      break

    case 'timeline':
      const stepsHtml = (page.steps || []).map((s, i) =>
        `<div class="dp-tl-item"><i></i><b>${String(i + 1).padStart(2, '0')}</b><span>${escapeHtml(s)}</span></div>`).join('')
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          ${h3(page.title)}
          <div class="dp-timeline">${stepsHtml}</div>
        </div><div class="dp-side-art">${img}</div></div>`
      break

    case 'comparison':
      const leftItems = (page.left || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')
      const rightItems = (page.right || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')
      inner = `${h3(page.title)}
        <div class="dp-banner-art">${img}</div>
        <div class="dp-compare">
          <div class="dp-col"><h4>${escapeHtml(page.leftTitle)}</h4><ul>${leftItems}</ul></div>
          <div class="dp-col dp-col-hot"><h4>${escapeHtml(page.rightTitle)}</h4><ul>${rightItems}</ul></div>
        </div>`
      break

    case 'table':
      const headHtml = (page.head || []).map(h => `<th>${escapeHtml(h)}</th>`).join('')
      const rowsHtml = (page.rows || []).map(r =>
        `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          ${h3(page.title)}
          <table class="dp-table"><thead><tr>${headHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
        </div><div class="dp-side-art">${img}</div></div>`
      break

    case 'triple-grid':
      const gridHtml = (page.items || []).map(s =>
        `<div class="dp-card"><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.body || '')}</p></div>`).join('')
      inner = `${eb(page.eyebrow)}
        ${h3(page.title)}
        <div class="dp-cards">${gridHtml}</div>`
      break

    case 'closing':
      inner = `<div class="dp-end-art">${img}</div>
        ${h3(page.title)}
        ${p(page.sub)}
        ${eb(page.eyebrow)}`
      break

    default:
      inner = `${h3(page.title)}
        ${p(page.sub)}
        ${p(page.body)}
        ${p(page.body1)}`
  }

  return `<div class="dp-page ifr-${fw.imgFrame} head-${fw.heading} lay-${lay}" style="${rootVars}" data-layout="${lay}" data-no="${pageIdx + 1}">
    ${tag}
    <div class="dp-inner">${inner}</div>
  </div>`
}

/**
 * 渲染完整演示文稿文档（全部页面）
 */
export function renderPresentationDocument(tpl) {
  const pagesHtml = tpl.pages.map((_, i) => renderPresentationSlide(tpl, i)).join('')
  return `<div class="td-deck">${pagesHtml}</div>`
}

<<<<<<< HEAD
=======
/* 文档模式渲染：将所有页面堆叠为可滚动文档 */
export function renderDocumentPresentation(presTpl, locale) {
  const total = presTpl.pages.length
  let html = `<div class="doc-pres-scroll">`
  for (let i = 0; i < total; i++) {
    html += `<div class="doc-pres-page">`
    html += renderPresentationSlide(presTpl, i)
    html += `<div class="doc-pres-pagenum">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>`
    html += `</div>`
  }
  html += `</div>`
  return html
}

/* 合并手动模板和生成模板 */
export const PRESENTATION_TEMPLATES = [...PRESENTATION_TEMPLATES_MANUAL, ...GENERATED_PRESENTATION_TEMPLATES]
