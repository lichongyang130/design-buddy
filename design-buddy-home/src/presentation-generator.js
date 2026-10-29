/* ============================================================
   DesignBuddy 演示文稿模板生成器
   程序化生成 200 个高质量商业演示文稿模板
   ============================================================ */

import { FRAMEWORKS, PALETTES, FONT_PAIRS } from './template-engine.js'

/* ---------------- 图片池 ---------------- */

export const IMG = {
  a: '/covers/cover-1.jpg',
  b: '/covers/cover-2.jpg',
  c: '/covers/cover-3.jpg',
  d: '/covers/cover-4.jpg',
  e: '/covers/cover-5.jpg',
  f: '/covers/cover-6.jpg',
  g: '/covers/cover-7.jpg',
  h: '/covers/cover-8.jpg',
  i: '/covers/cover-9.jpg',
  j: '/covers/cover-10.jpg',
  k: '/covers/cover-11.jpg',
}

const IMG_KEYS = Object.keys(IMG) // ['a','b','c','d','e','f','g','h','i','j','k']

/* ---------------- 主题数据库 ---------------- */
/* 200 个独特的公司/行业组合 */

const INDUSTRIES = [
  // AI/科技
  { industry: 'AI Infrastructure', tagline: 'Building the foundation for intelligent systems', metrics: ['$48B', '32%', '$12B', '4.2M'], metricLabels: ['Market Size', 'CAGR', 'Enterprise Spend', 'Developers'] },
  { industry: 'Cloud Computing', tagline: 'Scalable infrastructure for the modern enterprise', metrics: ['$62B', '28%', '$38B', '78%'] , metricLabels: ['Market Size', 'CAGR', 'Cloud Spend', 'Adoption'] },
  { industry: 'Cybersecurity', tagline: 'Protecting the digital frontier', metrics: ['$18B', '41%', '$9B', '12K'], metricLabels: ['Market Size', 'CAGR', 'Security Spend', 'Threats/Day'] },
  { industry: 'Data Analytics', tagline: 'Turning raw data into actionable intelligence', metrics: ['$34B', '29%', '$14B', '68%'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Adoption'] },
  { industry: 'Software Platforms', tagline: 'Unified platforms for modern development', metrics: ['$85B', '24%', '$52B', '92%'], metricLabels: ['Market Size', 'CAGR', 'Platform Spend', 'Adoption'] },
  { industry: 'Semiconductor Design', tagline: 'Powering the silicon revolution', metrics: ['$52B', '18%', '$28B', '1.2K'], metricLabels: ['Market Size', 'CAGR', 'R&D Spend', 'Designs/Year'] },
  { industry: 'Quantum Computing', tagline: 'Computing beyond classical limits', metrics: ['$1.2B', '67%', '$800M', '14'], metricLabels: ['Market Size', 'CAGR', 'Investment', 'Qubits'] },
  { industry: 'IoT & Edge Devices', tagline: 'Connecting the physical world', metrics: ['$27B', '33%', '$11B', '4.8B'], metricLabels: ['Market Size', 'CAGR', 'Device Spend', 'Connected Devices'] },
  { industry: 'Robotics & Automation', tagline: 'Automating the future of work', metrics: ['$19B', '35%', '$7B', '1.4M'], metricLabels: ['Market Size', 'CAGR', 'Automation Spend', 'Robots Shipped'] },
  { industry: 'Blockchain & Web3', tagline: 'Building trust in digital economies', metrics: ['$8.4B', '52%', '$3.2B', '38M'], metricLabels: ['Market Size', 'CAGR', 'Investment', 'Active Wallets'] },
  { industry: 'Augmented Reality', tagline: 'Bridging digital and physical realities', metrics: ['$6.8B', '44%', '$2.1B', '28M'], metricLabels: ['Market Size', 'CAGR', 'AR Spend', 'Active Users'] },
  { industry: 'Developer Tools', tagline: 'Ship faster with better tools', metrics: ['$14B', '27%', '$8B', '72%'], metricLabels: ['Market Size', 'CAGR', 'DevTool Spend', 'Adoption'] },
  { industry: 'DevOps Platforms', tagline: 'Streamlining the software delivery pipeline', metrics: ['$9.2B', '31%', '$4.8B', '84%'], metricLabels: ['Market Size', 'CAGR', 'DevOps Spend', 'Adoption'] },
  { industry: 'Machine Learning', tagline: 'Making machines think', metrics: ['$22B', '38%', '$11B', '3.1M'], metricLabels: ['Market Size', 'CAGR', 'ML Spend', 'Models Trained'] },
  { industry: 'Autonomous Systems', tagline: 'Machines that navigate the world', metrics: ['$11B', '46%', '$5.4B', '120K'], metricLabels: ['Market Size', 'CAGR', 'R&D Spend', 'Vehicles Deployed'] },
  { industry: 'Speech Technology', tagline: 'Conversational interfaces for every business', metrics: ['$4.8B', '34%', '$2.1B', '5.2B'], metricLabels: ['Market Size', 'CAGR', 'Voice Spend', 'Voice Interactions'] },
  { industry: 'Computer Vision', tagline: 'Machines that see and understand', metrics: ['$7.6B', '39%', '$3.3B', '2.4M'], metricLabels: ['Market Size', 'CAGR', 'Vision Spend', 'Models Deployed'] },

  // 金融科技
  { industry: 'Digital Banking', tagline: 'Banking reimagined for the digital age', metrics: ['$14B', '22%', '$8.4B', '320M'], metricLabels: ['Market Size', 'CAGR', 'Digital Spend', 'Users'] },
  { industry: 'Payment Processing', tagline: 'Frictionless payments at scale', metrics: ['$28B', '19%', '$14B', '48B'], metricLabels: ['Market Size', 'CAGR', 'Payment Spend', 'Transactions/Year'] },
  { industry: 'Insurance Technology', tagline: 'Insurance that adapts to you', metrics: ['$8.2B', '26%', '$4.1B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Insurtech Spend', 'Policies'] },
  { industry: 'Wealth Management', tagline: 'Democratizing access to investment', metrics: ['$12B', '21%', '$6.8B', '45M'], metricLabels: ['Market Size', 'CAGR', 'Assets Managed', 'Investors'] },
  { industry: 'Lending Platforms', tagline: 'Credit made simple and accessible', metrics: ['$9.4B', '24%', '$5.2B', '12M'], metricLabels: ['Market Size', 'CAGR', 'Lending Volume', 'Borrowers'] },
  { industry: 'Cryptocurrency', tagline: 'Digital assets for the new economy', metrics: ['$6.2B', '48%', '$2.8B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Trading Volume', 'Active Traders'] },
  { industry: 'Trade Finance', tagline: 'Streamlining global trade', metrics: ['$5.8B', '16%', '$3.1B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'Trade Volume', 'Transactions'] },
  { industry: 'Risk Management', tagline: 'Identifying threats before they become losses', metrics: ['$7.1B', '23%', '$3.9B', '24K'], metricLabels: ['Market Size', 'CAGR', 'Risk Spend', 'Threats Mitigated'] },
  { industry: 'RegTech', tagline: 'Compliance without the complexity', metrics: ['$3.4B', '31%', '$1.6B', '5.8M'], metricLabels: ['Market Size', 'CAGR', 'Compliance Spend', 'Checks Automated'] },
  { industry: 'B2B Payments', tagline: 'Business payments that actually work', metrics: ['$11B', '25%', '$6.2B', '14M'], metricLabels: ['Market Size', 'CAGR', 'B2B Spend', 'Businesses'] },
  { industry: 'Embedded Finance', tagline: 'Finance woven into every experience', metrics: ['$4.8B', '36%', '$2.2B', '88M'], metricLabels: ['Market Size', 'CAGR', 'Embedded Spend', 'Integrations'] },
  { industry: 'Reinsurance', tagline: 'Stability for the insurance world', metrics: ['$6.4B', '14%', '$3.5B', '1.2K'], metricLabels: ['Market Size', 'CAGR', 'Premiums', 'Carriers'] },
  { industry: 'Consumer Finance', tagline: 'Financial tools for everyday life', metrics: ['$10B', '20%', '$5.6B', '210M'], metricLabels: ['Market Size', 'CAGR', 'Consumer Spend', 'Users'] },
  { industry: 'Capital Markets', tagline: 'Connecting capital with opportunity', metrics: ['$18B', '12%', '$10B', '12M'], metricLabels: ['Market Size', 'CAGR', 'Trading Volume', 'Trades'] },
  { industry: 'Financial Planning', tagline: 'Planning for what comes next', metrics: ['$5.2B', '28%', '$2.6B', '65M'], metricLabels: ['Market Size', 'CAGR', 'Planning Spend', 'Plans'] },
  { industry: 'Compliance Automation', tagline: 'Stay compliant without the headache', metrics: ['$2.8B', '34%', '$1.3B', '4.2M'], metricLabels: ['Market Size', 'CAGR', 'Compliance Spend', 'Rules Tracked'] },
  { industry: 'Cross-Border Payments', tagline: 'Money without borders', metrics: ['$8.6B', '29%', '$4.4B', '15B'], metricLabels: ['Market Size', 'CAGR', 'Cross-Border Volume', 'Transactions'] },

  // 医疗健康
  { industry: 'Healthcare IT', tagline: 'Technology that heals', metrics: ['$34B', '22%', '$18B', '520M'], metricLabels: ['Market Size', 'CAGR', 'Healthcare Spend', 'Patients Served'] },
  { industry: 'Biotechnology', tagline: 'Engineering biology for better outcomes', metrics: ['$12B', '18%', '$6.8B', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'R&D Spend', 'Pipeline Assets'] },
  { industry: 'Medical Devices', tagline: 'Precision instruments for better care', metrics: ['$18B', '16%', '$9.4B', '380M'], metricLabels: ['Market Size', 'CAGR', 'Device Spend', 'Procedures'] },
  { industry: 'Drug Discovery', tagline: 'Finding the next breakthrough therapy', metrics: ['$8.4B', '19%', '$4.6B', '2.8K'], metricLabels: ['Market Size', 'CAGR', 'R&D Spend', 'Candidates'] },
  { industry: 'Genomics', tagline: 'Reading the code of life', metrics: ['$6.2B', '33%', '$3.1B', '4.8M'], metricLabels: ['Market Size', 'CAGR', 'Sequencing Spend', 'Genomes Sequenced'] },
  { industry: 'Telemedicine', tagline: 'Care delivered anywhere, anytime', metrics: ['$14B', '38%', '$7.2B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Telehealth Spend', 'Visits'] },
  { industry: 'Diagnostics', tagline: 'Precision diagnosis for better treatment', metrics: ['$9.8B', '21%', '$5.2B', '320M'], metricLabels: ['Market Size', 'CAGR', 'Diagnostic Spend', 'Tests/Year'] },
  { industry: 'Digital Health', tagline: 'Healthcare goes digital', metrics: ['$11B', '29%', '$5.8B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Digital Health Spend', 'App Users'] },
  { industry: 'Clinical Research', tagline: 'Evidence that moves medicine forward', metrics: ['$7.4B', '17%', '$4.1B', '12K'], metricLabels: ['Market Size', 'CAGR', 'CRO Spend', 'Trials'] },
  { industry: 'Rehabilitation', tagline: 'Helping patients get back to life', metrics: ['$4.6B', '24%', '$2.4B', '85M'], metricLabels: ['Market Size', 'CAGR', 'Rehab Spend', 'Patients'] },
  { industry: 'Mental Health', tagline: 'Support for the mind', metrics: ['$5.8B', '31%', '$2.9B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Mental Health Spend', 'Users'] },
  { industry: 'Nutritional Science', tagline: 'Food as medicine', metrics: ['$8.2B', '15%', '$4.4B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Nutrition Spend', 'Consumers'] },
  { industry: 'Medical Imaging', tagline: 'Seeing inside the body', metrics: ['$10B', '14%', '$5.6B', '420M'], metricLabels: ['Market Size', 'CAGR', 'Imaging Spend', 'Scans/Year'] },
  { industry: 'Health Analytics', tagline: 'Data-driven decisions for better health', metrics: ['$6.8B', '27%', '$3.4B', '88M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Records Analyzed'] },
  { industry: 'Vaccine Development', tagline: 'Preventing disease before it starts', metrics: ['$9.2B', '19%', '$5.1B', '1.8B'], metricLabels: ['Market Size', 'CAGR', 'Vaccine Spend', 'Doses Administered'] },
  { industry: 'Medical Robotics', tagline: 'Precision beyond human hands', metrics: ['$3.4B', '28%', '$1.7B', '42K'], metricLabels: ['Market Size', 'CAGR', 'Robotic Spend', 'Robots Deployed'] },
  { industry: 'Pharmaceutical Tech', tagline: 'Better medicines, faster', metrics: ['$13B', '16%', '$7.2B', '8.4K'], metricLabels: ['Market Size', 'CAGR', 'Pharma Tech Spend', 'Drugs Developed'] },

  // 电商零售
  { industry: 'E-Commerce Platforms', tagline: 'Retail without boundaries', metrics: ['$24B', '21%', '$13B', '480M'], metricLabels: ['Market Size', 'CAGR', 'E-Com Spend', 'Shoppers'] },
  { industry: 'D2C Brands', tagline: 'Brands that connect directly', metrics: ['$11B', '26%', '$5.8B', '180M'], metricLabels: ['Market Size', 'CAGR', 'D2C Revenue', 'Customers'] },
  { industry: 'Marketplace Operations', tagline: 'Connecting buyers and sellers', metrics: ['$16B', '19%', '$8.4B', '320M'], metricLabels: ['Market Size', 'CAGR', 'GMV', 'Users'] },
  { industry: 'Retail Tech', tagline: 'The future of physical retail', metrics: ['$7.8B', '24%', '$4.1B', '180K'], metricLabels: ['Market Size', 'CAGR', 'Retail Tech Spend', 'Stores'] },
  { industry: 'Logistics E-Commerce', tagline: 'Fast delivery, every time', metrics: ['$9.4B', '22%', '$4.8B', '8.2B'], metricLabels: ['Market Size', 'CAGR', 'Logistics Spend', 'Packages/Year'] },
  { industry: 'Subscription Commerce', tagline: 'Recurring revenue made simple', metrics: ['$6.2B', '28%', '$3.1B', '140M'], metricLabels: ['Market Size', 'CAGR', 'Subscription Revenue', 'Subscribers'] },
  { industry: 'Fashion Tech', tagline: 'Style meets technology', metrics: ['$5.4B', '25%', '$2.7B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Fashion Tech Spend', 'Shoppers'] },
  { industry: 'Consumer Electronics', tagline: 'Gadgets that change lives', metrics: ['$12B', '14%', '$6.8B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Electronics Spend', 'Units Sold'] },
  { industry: 'Beauty Tech', tagline: 'Beauty personalized', metrics: ['$4.8B', '31%', '$2.3B', '72M'], metricLabels: ['Market Size', 'CAGR', 'Beauty Tech Spend', 'Customers'] },
  { industry: 'Grocery Delivery', tagline: 'Fresh food at your door', metrics: ['$8.6B', '34%', '$4.2B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Grocery Tech Spend', 'Orders/Month'] },
  { industry: 'Luxury Retail', tagline: 'Excellence in every detail', metrics: ['$3.8B', '12%', '$1.9B', '28M'], metricLabels: ['Market Size', 'CAGR', 'Luxury Spend', 'Customers'] },
  { industry: 'Vintage & Resale', tagline: 'Second life for great things', metrics: ['$5.2B', '29%', '$2.6B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Resale Volume', 'Transactions'] },
  { industry: 'Payments E-Commerce', tagline: 'Frictionless checkout experiences', metrics: ['$6.4B', '27%', '$3.2B', '8.4B'], metricLabels: ['Market Size', 'CAGR', 'Payment Spend', 'Transactions'] },
  { industry: 'Retail Analytics', tagline: 'Data that drives retail', metrics: ['$4.2B', '24%', '$2.1B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Records'] },
  { industry: 'Pop-Up Commerce', tagline: 'Experiential retail', metrics: ['$2.8B', '22%', '$1.4B', '48K'], metricLabels: ['Market Size', 'CAGR', 'Pop-Up Spend', 'Events/Year'] },
  { industry: 'Cross-Border Retail', tagline: 'Global shopping, locally', metrics: ['$7.2B', '31%', '$3.6B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Cross-Border Volume', 'Shoppers'] },
  { industry: 'Store Technology', tagline: 'The connected store', metrics: ['$5.6B', '23%', '$2.8B', '120K'], metricLabels: ['Market Size', 'CAGR', 'Store Tech Spend', 'Stores'] },

  // 教育
  { industry: 'EdTech Platforms', tagline: 'Learning without limits', metrics: ['$18B', '24%', '$10B', '480M'], metricLabels: ['Market Size', 'CAGR', 'EdTech Spend', 'Learners'] },
  { industry: 'Online Learning', tagline: 'Education at your pace', metrics: ['$12B', '28%', '$6.4B', '320M'], metricLabels: ['Market Size', 'CAGR', 'Learning Spend', 'Students'] },
  { industry: 'K-12 Education', tagline: 'Building foundations for success', metrics: ['$9.4B', '19%', '$4.8B', '180M'], metricLabels: ['Market Size', 'CAGR', 'K-12 Spend', 'Students'] },
  { industry: 'Higher Education', tagline: 'Empowering the next generation', metrics: ['$14B', '16%', '$7.2B', '85M'], metricLabels: ['Market Size', 'CAGR', 'Higher Ed Spend', 'Students'] },
  { industry: 'Professional Training', tagline: 'Skills for the working world', metrics: ['$8.2B', '22%', '$4.1B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Training Spend', 'Professionals'] },
  { industry: 'Language Learning', tagline: 'Communicate without borders', metrics: ['$5.8B', '26%', '$2.9B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Language Spend', 'Learners'] },
  { industry: 'STEM Education', tagline: 'Teaching the scientists of tomorrow', metrics: ['$6.4B', '21%', '$3.2B', '95M'], metricLabels: ['Market Size', 'CAGR', 'STEM Spend', 'Students'] },
  { industry: 'Special Education', tagline: 'Inclusive learning for all', metrics: ['$3.8B', '18%', '$1.9B', '48M'], metricLabels: ['Market Size', 'CAGR', 'Special Ed Spend', 'Students'] },
  { industry: 'Early Childhood', tagline: 'Starting strong', metrics: ['$4.6B', '24%', '$2.3B', '65M'], metricLabels: ['Market Size', 'CAGR', 'Early Ed Spend', 'Children'] },
  { industry: 'Corporate Training', tagline: 'Learning that drives business', metrics: ['$7.2B', '20%', '$3.6B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Corporate Spend', 'Employees'] },
  { industry: 'Virtual Reality Education', tagline: 'Immersive learning experiences', metrics: ['$2.4B', '35%', '$1.1B', '28M'], metricLabels: ['Market Size', 'CAGR', 'VR Ed Spend', 'Students'] },
  { industry: 'Skill Assessment', tagline: 'Measuring what matters', metrics: ['$3.2B', '23%', '$1.6B', '85M'], metricLabels: ['Market Size', 'CAGR', 'Assessment Spend', 'Assessments'] },
  { industry: 'Course Creation', tagline: 'Building the future of content', metrics: ['$4.8B', '27%', '$2.4B', '120K'], metricLabels: ['Market Size', 'CAGR', 'Creator Spend', 'Courses'] },
  { industry: 'Educational Content', tagline: 'Content that teaches', metrics: ['$6.2B', '19%', '$3.1B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Content Spend', 'Consumers'] },
  { industry: 'Tutoring Services', tagline: 'Personalized support', metrics: ['$8.8B', '17%', '$4.4B', '210M'], metricLabels: ['Market Size', 'CAGR', 'Tutoring Spend', 'Students'] },
  { industry: 'Education Analytics', tagline: 'Data that improves learning', metrics: ['$3.6B', '25%', '$1.8B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Records'] },
  { industry: 'Career Education', tagline: 'Skills for career success', metrics: ['$5.4B', '21%', '$2.7B', '72M'], metricLabels: ['Market Size', 'CAGR', 'Career Ed Spend', 'Students'] },

  // 房地产
  { industry: 'Real Estate Tech', tagline: 'Property meets technology', metrics: ['$8.4B', '22%', '$4.2B', '180M'], metricLabels: ['Market Size', 'CAGR', 'PropTech Spend', 'Properties'] },
  { industry: 'Property Management', tagline: 'Managing properties with ease', metrics: ['$6.2B', '18%', '$3.1B', '48M'], metricLabels: ['Market Size', 'CAGR', 'PM Spend', 'Properties'] },
  { industry: 'Construction Tech', tagline: 'Building better, faster', metrics: ['$9.8B', '26%', '$4.9B', '12K'], metricLabels: ['Market Size', 'CAGR', 'ConTech Spend', 'Projects'] },
  { industry: 'Home Building', tagline: 'Creating communities', metrics: ['$14B', '14%', '$7.2B', '1.4M'], metricLabels: ['Market Size', 'CAGR', 'Home Spend', 'Homes Built'] },
  { industry: 'Commercial Real Estate', tagline: 'Spaces that work', metrics: ['$11B', '12%', '$5.6B', '84K'], metricLabels: ['Market Size', 'CAGR', 'CRE Spend', 'Properties'] },
  { industry: 'Smart Homes', tagline: 'Homes that think', metrics: ['$5.4B', '28%', '$2.7B', '42M'], metricLabels: ['Market Size', 'CAGR', 'Smart Home Spend', 'Homes'] },
  { industry: 'Real Estate Marketplaces', tagline: 'Finding the perfect property', metrics: ['$7.2B', '24%', '$3.6B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Marketplace Volume', 'Users'] },
  { industry: 'Title & Closing', tagline: 'Securing property rights', metrics: ['$4.8B', '16%', '$2.4B', '12M'], metricLabels: ['Market Size', 'CAGR', 'Title Spend', 'Transactions'] },
  { industry: 'Real Estate Finance', tagline: 'Financing the dream', metrics: ['$10B', '19%', '$5.1B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'RE Finance Volume', 'Loans'] },
  { industry: 'Interior Design', tagline: 'Spaces that inspire', metrics: ['$3.8B', '21%', '$1.9B', '48M'], metricLabels: ['Market Size', 'CAGR', 'Design Spend', 'Projects'] },
  { industry: 'Land Development', tagline: 'Shaping the landscape', metrics: ['$6.4B', '15%', '$3.2B', '8.4K'], metricLabels: ['Market Size', 'CAGR', 'Land Spend', 'Developments'] },
  { industry: 'Property Analytics', tagline: 'Data-driven decisions', metrics: ['$2.8B', '27%', '$1.4B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Properties Analyzed'] },
  { industry: 'Virtual Tours', tagline: 'Tours without boundaries', metrics: ['$1.8B', '34%', '$800M', '42M'], metricLabels: ['Market Size', 'CAGR', 'VR Tour Spend', 'Tours'] },
  { industry: 'Commercial Leasing', tagline: 'Space for business', metrics: ['$5.2B', '17%', '$2.6B', '4.2M'], metricLabels: ['Market Size', 'CAGR', 'Leasing Volume', 'Leases'] },
  { industry: 'Home Services', tagline: 'Helping homeowners', metrics: ['$8.6B', '20%', '$4.3B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Home Services Spend', 'Jobs'] },
  { industry: 'Real Estate Investment', tagline: 'Investing in property', metrics: ['$9.4B', '18%', '$4.7B', '2.8M'], metricLabels: ['Market Size', 'CAGR', 'RE Investment', 'Investors'] },
  { industry: 'Housing Tech', tagline: 'The future of housing', metrics: ['$4.2B', '25%', '$2.1B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Housing Tech Spend', 'Homes'] },

  // 制造业
  { industry: 'Industrial Automation', tagline: 'Automating the factory floor', metrics: ['$12B', '22%', '$6B', '48K'], metricLabels: ['Market Size', 'CAGR', 'Automation Spend', 'Factories'] },
  { industry: 'Manufacturing Tech', tagline: 'The smart factory', metrics: ['$16B', '18%', '$8.4B', '120K'], metricLabels: ['Market Size', 'CAGR', 'ManuTech Spend', 'Facilities'] },
  { industry: 'Supply Chain', tagline: 'Moving goods efficiently', metrics: ['$14B', '21%', '$7.2B', '8.4B'], metricLabels: ['Market Size', 'CAGR', 'Supply Chain Spend', 'Shipments'] },
  { industry: '3D Printing', tagline: 'Printing the future', metrics: ['$8.2B', '28%', '$4.1B', '4.8M'], metricLabels: ['Market Size', 'CAGR', '3D Print Spend', 'Parts Printed'] },
  { industry: 'Automotive Manufacturing', tagline: 'Building the vehicles of tomorrow', metrics: ['$18B', '14%', '$9.2B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'Auto Spend', 'Vehicles'] },
  { industry: 'Aerospace Manufacturing', tagline: 'Reaching new heights', metrics: ['$10B', '16%', '$5.1B', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'Aerospace Spend', 'Aircraft'] },
  { industry: 'Electronics Manufacturing', tagline: 'Powering the digital world', metrics: ['$14B', '19%', '$7.2B', '120K'], metricLabels: ['Market Size', 'CAGR', 'Electronics Spend', 'Facilities'] },
  { industry: 'Food Manufacturing', tagline: 'Feeding the world', metrics: ['$9.4B', '15%', '$4.8B', '2.8K'], metricLabels: ['Market Size', 'CAGR', 'Food Spend', 'Facilities'] },
  { industry: 'Chemical Manufacturing', tagline: 'Building from molecules', metrics: ['$11B', '12%', '$5.6B', '8.4K'], metricLabels: ['Market Size', 'CAGR', 'Chemical Spend', 'Facilities'] },
  { industry: 'Textile Manufacturing', tagline: 'Fabricating the future', metrics: ['$6.8B', '17%', '$3.4B', '12K'], metricLabels: ['Market Size', 'CAGR', 'Textile Spend', 'Facilities'] },
  { industry: 'Robotics Manufacturing', tagline: 'Building the robots', metrics: ['$5.4B', '26%', '$2.7B', '42K'], metricLabels: ['Market Size', 'CAGR', 'Robotics Spend', 'Robots'] },
  { industry: 'Precision Engineering', tagline: 'Exact to the micron', metrics: ['$4.2B', '19%', '$2.1B', '8.4K'], metricLabels: ['Market Size', 'CAGR', 'Engineering Spend', 'Facilities'] },
  { industry: 'Quality Control', tagline: 'Perfection in every product', metrics: ['$3.8B', '21%', '$1.9B', '120K'], metricLabels: ['Market Size', 'CAGR', 'QC Spend', 'Checks'] },
  { industry: 'Industrial IoT', tagline: 'Connected factories', metrics: ['$7.2B', '29%', '$3.6B', '48K'], metricLabels: ['Market Size', 'CAGR', 'IIoT Spend', 'Sensors'] },
  { industry: 'Materials Science', tagline: 'Engineering new materials', metrics: ['$5.8B', '22%', '$2.9B', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'Materials Spend', 'Patents'] },
  { industry: 'Packaging Manufacturing', tagline: 'Wrapping the world', metrics: ['$6.4B', '16%', '$3.2B', '180K'], metricLabels: ['Market Size', 'CAGR', 'Packaging Spend', 'Facilities'] },
  { industry: 'Smart Manufacturing', tagline: 'Factories that think', metrics: ['$8.8B', '24%', '$4.4B', '68K'], metricLabels: ['Market Size', 'CAGR', 'Smart Mfg Spend', 'Facilities'] },

  // 能源环保
  { industry: 'Renewable Energy', tagline: 'Powering a sustainable future', metrics: ['$24B', '26%', '$12B', '1.8B'], metricLabels: ['Market Size', 'CAGR', 'Renewable Spend', 'MWh Generated'] },
  { industry: 'Clean Technology', tagline: 'Technology that saves the planet', metrics: ['$18B', '24%', '$9.2B', '480M'], metricLabels: ['Market Size', 'CAGR', 'CleanTech Spend', 'Users'] },
  { industry: 'Solar Energy', tagline: 'Harnessing the sun', metrics: ['$12B', '28%', '$6.1B', '840M'], metricLabels: ['Market Size', 'CAGR', 'Solar Spend', 'Panels Installed'] },
  { industry: 'Wind Energy', tagline: 'Power from the air', metrics: ['$8.4B', '22%', '$4.2B', '140K'], metricLabels: ['Market Size', 'CAGR', 'Wind Spend', 'Turbines'] },
  { industry: 'Energy Storage', tagline: 'Storing power for later', metrics: ['$9.8B', '34%', '$4.9B', '42M'], metricLabels: ['Market Size', 'CAGR', 'Storage Spend', 'Batteries'] },
  { industry: 'Electric Vehicles', tagline: 'Driving the future', metrics: ['$14B', '31%', '$7.2B', '280M'], metricLabels: ['Market Size', 'CAGR', 'EV Spend', 'Vehicles'] },
  { industry: 'Grid Modernization', tagline: 'Smarter grids for everyone', metrics: ['$7.2B', '20%', '$3.6B', '12K'], metricLabels: ['Market Size', 'CAGR', 'Grid Spend', 'Projects'] },
  { industry: 'Carbon Capture', tagline: 'Cleaning the air', metrics: ['$2.4B', '42%', '$1.1B', '4.2M'], metricLabels: ['Market Size', 'CAGR', 'CC Spend', 'CO2 Captured'] },
  { industry: 'Water Technology', tagline: 'The science of water', metrics: ['$5.4B', '19%', '$2.7B', '180M'], metricLabels: ['Market Size', 'CAGR', 'WaterTech Spend', 'People Served'] },
  { industry: 'Waste Management', tagline: 'Reducing, reusing, recycling', metrics: ['$6.8B', '16%', '$3.4B', '8.4B'], metricLabels: ['Market Size', 'CAGR', 'Waste Spend', 'Tons Processed'] },
  { industry: 'Sustainable Agriculture', tagline: 'Farming for tomorrow', metrics: ['$4.2B', '25%', '$2.1B', '48M'], metricLabels: ['Market Size', 'CAGR', 'AgriTech Spend', 'Farms'] },
  { industry: 'Green Building', tagline: 'Buildings that breathe', metrics: ['$3.8B', '23%', '$1.9B', '42K'], metricLabels: ['Market Size', 'CAGR', 'Green Bldg Spend', 'Buildings'] },
  { industry: 'Biofuels', tagline: 'Fuel from nature', metrics: ['$5.8B', '18%', '$2.9B', '42M'], metricLabels: ['Market Size', 'CAGR', 'Biofuel Spend', 'Gallons'] },
  { industry: 'Energy Efficiency', tagline: 'Less energy, more value', metrics: ['$8.6B', '21%', '$4.3B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Efficiency Spend', 'Buildings'] },
  { industry: 'Nuclear Energy', tagline: 'Clean power from the atom', metrics: ['$6.4B', '14%', '$3.2B', '440'], metricLabels: ['Market Size', 'CAGR', 'Nuclear Spend', 'Reactors'] },
  { industry: 'Geothermal Energy', tagline: 'Power from below', metrics: ['$2.8B', '27%', '$1.4B', '18K'], metricLabels: ['Market Size', 'CAGR', 'Geothermal Spend', 'Wells'] },
  { industry: 'Energy Distribution', tagline: 'Power to the people', metrics: ['$9.4B', '17%', '$4.7B', '1.4K'], metricLabels: ['Market Size', 'CAGR', 'Distribution Spend', 'Grids'] },

  // 物流运输
  { industry: 'Freight & Logistics', tagline: 'Moving the world', metrics: ['$16B', '20%', '$8B', '8.4B'], metricLabels: ['Market Size', 'CAGR', 'Logistics Spend', 'Shipments'] },
  { industry: 'Supply Chain Management', tagline: 'Orchestrating supply', metrics: ['$12B', '22%', '$6B', '120M'], metricLabels: ['Market Size', 'CAGR', 'SCM Spend', 'Businesses'] },
  { industry: 'Last-Mile Delivery', tagline: 'The final step', metrics: ['$8.4B', '28%', '$4.2B', '4.8B'], metricLabels: ['Market Size', 'CAGR', 'Last-Mile Spend', 'Deliveries'] },
  { industry: 'Warehousing', tagline: 'Where goods wait', metrics: ['$6.2B', '18%', '$3.1B', '48K'], metricLabels: ['Market Size', 'CAGR', 'Warehouse Spend', 'Facilities'] },
  { industry: 'Freight Technology', tagline: 'Tech for transport', metrics: ['$7.8B', '24%', '$3.9B', '280M'], metricLabels: ['Market Size', 'CAGR', 'FreightTech Spend', 'Shipments'] },
  { industry: 'Cold Chain', tagline: 'Keeping it fresh', metrics: ['$4.8B', '23%', '$2.4B', '1.8B'], metricLabels: ['Market Size', 'CAGR', 'Cold Chain Spend', 'Shipments'] },
  { industry: 'Rail Transport', tagline: 'Moving by rail', metrics: ['$5.4B', '14%', '$2.7B', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'Rail Spend', 'Trains'] },
  { industry: 'Maritime Shipping', tagline: 'Crossing the oceans', metrics: ['$9.2B', '16%', '$4.6B', '54K'], metricLabels: ['Market Size', 'CAGR', 'Shipping Spend', 'Vessels'] },
  { industry: 'Air Cargo', tagline: 'Fast freight', metrics: ['$4.2B', '21%', '$2.1B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'Air Cargo Spend', 'Shipments'] },
  { industry: 'Fleet Management', tagline: 'Managing moving assets', metrics: ['$6.8B', '19%', '$3.4B', '48M'], metricLabels: ['Market Size', 'CAGR', 'Fleet Spend', 'Vehicles'] },
  { industry: 'Route Optimization', tagline: 'Shortest path, fastest delivery', metrics: ['$3.6B', '26%', '$1.8B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Route Spend', 'Routes Optimized'] },
  { industry: 'Customs & Compliance', tagline: 'Crossing borders', metrics: ['$4.4B', '17%', '$2.2B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'Customs Spend', 'Shipments'] },
  { industry: 'Cargo Insurance', tagline: 'Protecting shipments', metrics: ['$3.2B', '15%', '$1.6B', '12M'], metricLabels: ['Market Size', 'CAGR', 'Cargo Insurance', 'Policies'] },
  { industry: 'Logistics Analytics', tagline: 'Data for logistics', metrics: ['$2.8B', '27%', '$1.4B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Records'] },
  { industry: 'Autonomous Transport', tagline: 'Self-driving freight', metrics: ['$1.8B', '38%', '$800M', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'Autonomous Spend', 'Vehicles'] },
  { industry: 'Drone Delivery', tagline: 'Delivering by air', metrics: ['$2.4B', '35%', '$1.1B', '42M'], metricLabels: ['Market Size', 'CAGR', 'Drone Spend', 'Deliveries'] },
  { industry: 'Cargo Tracking', tagline: 'Knowing where it is', metrics: ['$3.8B', '22%', '$1.9B', '480M'], metricLabels: ['Market Size', 'CAGR', 'Tracking Spend', 'Shipments Tracked'] },

  // 媒体娱乐
  { industry: 'Streaming Services', tagline: 'Entertainment on demand', metrics: ['$18B', '22%', '$9.2B', '480M'], metricLabels: ['Market Size', 'CAGR', 'Streaming Spend', 'Subscribers'] },
  { industry: 'Gaming Industry', tagline: 'Worlds to explore', metrics: ['$14B', '19%', '$7.2B', '320M'], metricLabels: ['Market Size', 'CAGR', 'Gaming Spend', 'Players'] },
  { industry: 'Social Media', tagline: 'Connecting the world', metrics: ['$12B', '21%', '$6.4B', '4.8B'], metricLabels: ['Market Size', 'CAGR', 'Social Spend', 'Users'] },
  { industry: 'Content Creation', tagline: 'Stories that matter', metrics: ['$8.4B', '26%', '$4.2B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Content Spend', 'Creators'] },
  { industry: 'Film & Television', tagline: 'Visual storytelling', metrics: ['$10B', '16%', '$5.1B', '84M'], metricLabels: ['Market Size', 'CAGR', 'Film Spend', 'Viewers'] },
  { industry: 'Music Streaming', tagline: 'Music everywhere', metrics: ['$6.8B', '24%', '$3.4B', '680M'], metricLabels: ['Market Size', 'CAGR', 'Music Spend', 'Subscribers'] },
  { industry: 'Digital Advertising', tagline: 'Reaching the right audience', metrics: ['$22B', '18%', '$11B', '4.2B'], metricLabels: ['Market Size', 'CAGR', 'Ad Spend', 'Impressions'] },
  { industry: 'E-Sports', tagline: 'Competitive gaming', metrics: ['$3.4B', '31%', '$1.7B', '480M'], metricLabels: ['Market Size', 'CAGR', 'E-Sports Spend', 'Viewers'] },
  { industry: 'Virtual Reality', tagline: 'New realities', metrics: ['$4.2B', '28%', '$2.1B', '28M'], metricLabels: ['Market Size', 'CAGR', 'VR Spend', 'Users'] },
  { industry: 'Podcasting', tagline: 'Audio storytelling', metrics: ['$2.8B', '34%', '$1.4B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Podcast Spend', 'Listeners'] },
  { industry: 'News Media', tagline: 'Information that matters', metrics: ['$7.2B', '12%', '$3.6B', '280M'], metricLabels: ['Market Size', 'CAGR', 'News Spend', 'Readers'] },
  { industry: 'Animation', tagline: 'Bringing stories to life', metrics: ['$4.8B', '22%', '$2.4B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Animation Spend', 'Viewers'] },
  { industry: 'Live Events', tagline: 'Experiences in real time', metrics: ['$5.4B', '25%', '$2.7B', '84M'], metricLabels: ['Market Size', 'CAGR', 'Event Spend', 'Attendees'] },
  { industry: 'Creator Economy', tagline: 'Empowering creators', metrics: ['$6.2B', '29%', '$3.1B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Creator Spend', 'Creators'] },
  { industry: 'Broadcasting', tagline: 'Live to the world', metrics: ['$8.6B', '14%', '$4.3B', '320M'], metricLabels: ['Market Size', 'CAGR', 'Broadcast Spend', 'Viewers'] },
  { industry: 'Entertainment Tech', tagline: 'Tech for fun', metrics: ['$5.8B', '23%', '$2.9B', '180M'], metricLabels: ['Market Size', 'CAGR', 'EntTech Spend', 'Users'] },
  { industry: 'Fashion Media', tagline: 'Style in the spotlight', metrics: ['$3.2B', '21%', '$1.6B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Fashion Media Spend', 'Readers'] },

  // 企业服务
  { industry: 'Enterprise Software', tagline: 'Software for businesses', metrics: ['$28B', '18%', '$14B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Enterprise Spend', 'Businesses'] },
  { industry: 'CRM Platforms', tagline: 'Understanding customers', metrics: ['$14B', '20%', '$7.2B', '280M'], metricLabels: ['Market Size', 'CAGR', 'CRM Spend', 'Users'] },
  { industry: 'ERP Systems', tagline: 'Running the business', metrics: ['$18B', '14%', '$9.2B', '84M'], metricLabels: ['Market Size', 'CAGR', 'ERP Spend', 'Businesses'] },
  { industry: 'HR Technology', tagline: 'People first', metrics: ['$8.4B', '22%', '$4.2B', '120M'], metricLabels: ['Market Size', 'CAGR', 'HR Tech Spend', 'Employees'] },
  { industry: 'Legal Technology', tagline: 'Law meets tech', metrics: ['$4.8B', '25%', '$2.4B', '48M'], metricLabels: ['Market Size', 'CAGR', 'LegalTech Spend', 'Professionals'] },
  { industry: 'Consulting', tagline: 'Expert advice', metrics: ['$12B', '16%', '$6.1B', '280K'], metricLabels: ['Market Size', 'CAGR', 'Consulting Spend', 'Projects'] },
  { industry: 'Marketing Automation', tagline: 'Marketing that scales', metrics: ['$6.2B', '23%', '$3.1B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Marketing Spend', 'Businesses'] },
  { industry: 'Project Management', tagline: 'Getting things done', metrics: ['$4.2B', '21%', '$2.1B', '120M'], metricLabels: ['Market Size', 'CAGR', 'PM Spend', 'Users'] },
  { industry: 'Collaboration Tools', tagline: 'Working together', metrics: ['$7.8B', '24%', '$3.9B', '480M'], metricLabels: ['Market Size', 'CAGR', 'Collab Spend', 'Users'] },
  { industry: 'Customer Support', tagline: 'Helping customers', metrics: ['$5.4B', '20%', '$2.7B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Support Spend', 'Tickets'] },
  { industry: 'Recruiting Tech', tagline: 'Finding the best', metrics: ['$3.8B', '26%', '$1.9B', '48M'], metricLabels: ['Market Size', 'CAGR', 'Recruiting Spend', 'Hires'] },
  { industry: 'Financial Software', tagline: 'Finance made simple', metrics: ['$9.4B', '19%', '$4.7B', '120M'], metricLabels: ['Market Size', 'CAGR', 'FinSoftware Spend', 'Businesses'] },
  { industry: 'Supply Chain Software', tagline: 'Digital supply chains', metrics: ['$6.8B', '22%', '$3.4B', '84M'], metricLabels: ['Market Size', 'CAGR', 'SCM Software Spend', 'Businesses'] },
  { industry: 'Business Analytics', tagline: 'Data for decisions', metrics: ['$8.2B', '21%', '$4.1B', '95M'], metricLabels: ['Market Size', 'CAGR', 'Analytics Spend', 'Users'] },
  { industry: 'Office Productivity', tagline: 'Working smarter', metrics: ['$5.8B', '18%', '$2.9B', '480M'], metricLabels: ['Market Size', 'CAGR', 'Productivity Spend', 'Users'] },
  { industry: 'Enterprise Security', tagline: 'Protecting the business', metrics: ['$10B', '23%', '$5.1B', '120M'], metricLabels: ['Market Size', 'CAGR', 'Security Spend', 'Businesses'] },
  { industry: 'Business Intelligence', tagline: 'Insights for growth', metrics: ['$7.2B', '20%', '$3.6B', '84M'], metricLabels: ['Market Size', 'CAGR', 'BI Spend', 'Users'] },

  // 农业食品
  { industry: 'Agricultural Technology', tagline: 'Farming for the future', metrics: ['$8.4B', '24%', '$4.2B', '48M'], metricLabels: ['Market Size', 'CAGR', 'AgriTech Spend', 'Farms'] },
  { industry: 'Food Technology', tagline: 'Food reinvented', metrics: ['$6.2B', '28%', '$3.1B', '120M'], metricLabels: ['Market Size', 'CAGR', 'FoodTech Spend', 'Consumers'] },
  { industry: 'Precision Agriculture', tagline: 'Farming by the data', metrics: ['$4.8B', '26%', '$2.4B', '18M'], metricLabels: ['Market Size', 'CAGR', 'Precision Spend', 'Farms'] },
  { industry: 'Alternative Proteins', tagline: 'Protein without the animal', metrics: ['$3.4B', '35%', '$1.7B', '42M'], metricLabels: ['Market Size', 'CAGR', 'Protein Spend', 'Consumers'] },
  { industry: 'Food Delivery', tagline: 'Food at your door', metrics: ['$9.8B', '22%', '$4.9B', '180M'], metricLabels: ['Market Size', 'CAGR', 'Delivery Spend', 'Orders'] },
  { industry: 'Smart Farming', tagline: 'Farms that think', metrics: ['$5.2B', '27%', '$2.6B', '12M'], metricLabels: ['Market Size', 'CAGR', 'Smart Farm Spend', 'Farms'] },
  { industry: 'Crop Science', tagline: 'Better crops', metrics: ['$4.6B', '19%', '$2.3B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'Crop Spend', 'Varieties'] },
  { industry: 'Vertical Farming', tagline: 'Farms in the city', metrics: ['$2.8B', '34%', '$1.4B', '4.2K'], metricLabels: ['Market Size', 'CAGR', 'Vertical Farm Spend', 'Farms'] },
  { industry: 'Food Supply Chain', tagline: 'From farm to table', metrics: ['$7.2B', '18%', '$3.6B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Supply Chain Spend', 'Transactions'] },
  { industry: 'Agri-Robotics', tagline: 'Robots in the field', metrics: ['$1.8B', '38%', '$800M', '42K'], metricLabels: ['Market Size', 'CAGR', 'AgriRobot Spend', 'Robots'] },
  { industry: 'Bio Fertilizers', tagline: 'Natural fertility', metrics: ['$2.4B', '25%', '$1.1B', '8.4M'], metricLabels: ['Market Size', 'CAGR', 'BioFert Spend', 'Farms'] },
  { industry: 'Food Safety', tagline: 'Safe from farm to fork', metrics: ['$3.2B', '21%', '$1.6B', '280M'], metricLabels: ['Market Size', 'CAGR', 'Food Safety Spend', 'Checks'] },
  { industry: 'Plant-Based Foods', tagline: 'Food from plants', metrics: ['$4.2B', '31%', '$2.1B', '68M'], metricLabels: ['Market Size', 'CAGR', 'Plant Food Spend', 'Consumers'] },
  { industry: 'Agricultural Finance', tagline: 'Funding the farm', metrics: ['$5.8B', '17%', '$2.9B', '12M'], metricLabels: ['Market Size', 'CAGR', 'AgriFin Spend', 'Farms'] },
  { industry: 'Cannabis Tech', tagline: 'Legal cannabis technology', metrics: ['$3.8B', '29%', '$1.9B', '48M'], metricLabels: ['Market Size', 'CAGR', 'Cannabis Tech Spend', 'Businesses'] },
  { industry: 'Wine & Spirits', tagline: 'Crafted excellence', metrics: ['$4.8B', '14%', '$2.4B', '84M'], metricLabels: ['Market Size', 'CAGR', 'Wine Spend', 'Consumers'] },
]

// 公司名前缀和后缀池
const COMPANY_PREFIXES = [
  'Nebula', 'Quantum', 'Vertex', 'Apex', 'Summit', 'Pinnacle', 'Cascade', 'Pioneer', 'Vanguard', 'Frontier',
  'Aurora', 'Helix', 'Zenith', 'Apex', 'Echelon', 'Meridian', 'Ascend', 'Catalyst', 'Nova', 'Lumen',
  'Cobalt', 'Onyx', 'Crimson', 'Azure', 'Verdant', 'Amber', 'Sterling', 'Atlas', 'Compass', 'Horizon',
  'Beacon', 'Cipher', 'Delta', 'Echo', 'Falcon', 'Gemini', 'Haven', 'Indigo', 'Jupiter', 'Keystone',
  'Lattice', 'Mercury', 'Nimbus', 'Orbit', 'Prism', 'Quartz', 'Ridge', 'Sable', 'Timber', 'Ultra',
  'Vivid', 'Westward', 'Xenon', 'Yield', 'Zephyr', 'Aeon', 'Bloom', 'Cove', 'Drift', 'Ember',
  'Flux', 'Grove', 'Halo', 'Iris', 'Junction', 'Kestrel', 'Lark', 'Maple', 'North', 'Oak',
]

const COMPANY_SUFFIXES = [
  'AI', 'Flow', 'Hub', 'Tech', 'Labs', 'Sphere', 'Edge', 'Wave', 'Link', 'Grid',
  'Systems', 'Solutions', 'Digital', 'Dynamics', 'Works', 'Group', 'Ventures', 'Capital', 'Partners', 'Industries',
  'Networks', 'Platforms', 'Labs', 'Studio', 'Collective', 'Cooperative', 'Union', 'Alliance', 'Forge', 'Foundry',
]

// 生成 200 个独特的公司名
function generateCompanyNames() {
  const names = []
  const used = new Set()
  let pi = 0, si = 0
  while (names.length < 200) {
    const prefix = COMPANY_PREFIXES[pi % COMPANY_PREFIXES.length]
    const suffix = COMPANY_SUFFIXES[si % COMPANY_SUFFIXES.length]
    const name = prefix + suffix
    if (!used.has(name)) {
      used.add(name)
      names.push(name)
    }
    pi++
    si++
    if (pi > COMPANY_PREFIXES.length * 5) break // 安全退出
  }
  return names
}

const COMPANY_NAMES = generateCompanyNames()

// 组合主题和公司名
export const THEMES = INDUSTRIES.map((ind, i) => ({
  company: COMPANY_NAMES[i],
  industry: ind.industry,
  tagline: ind.tagline,
  metrics: ind.metrics,
  metricLabels: ind.metricLabels,
  serial: i + 1,
}))

/* ---------------- 类别定义 ---------------- */
/* 12 种演示文稿类型，每种有独特的页面结构 */

const CATEGORY_DEFS = [
  // 1. 融资演讲稿
  {
    type: 'pitch',
    name: 'Investor Pitch Deck',
    zh: '投资人融资演讲稿',
    cat: '融资演讲稿',
    fwOptions: [16, 17, 18],
    palOptions: [1, 2, 3, 4],
    fontOptions: [0, 1, 2],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: `SERIES A · 2025`, title: `${theme.company} Series A Pitch`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Agenda', items: ['Market Opportunity', 'The Problem', 'Our Solution', 'Technology', 'Traction', 'Business Model', 'Team', 'Financials', 'The Ask'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Market Opportunity', sub: `A ${m[0]} market growing at ${m[1]} annually`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'The Market Landscape', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `${theme.industry} is undergoing a fundamental transformation, creating unprecedented opportunities for innovative companies.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'MARKET OPPORTUNITY', title: 'Why Now', body: `Three converging forces — technological advancement, market readiness, and regulatory momentum — are creating a once-in-a-decade window in ${theme.industry}.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'The Problem', sub: 'Customers are struggling with outdated solutions', img: (imgBase+2)%11 },
        { layout: 'hero', eyebrow: 'THE PROBLEM', title: 'Why Current Solutions Fail', body: `73% of organizations report that existing ${theme.industry} solutions fail to meet their needs. The root cause is not technology quality — it is fragmentation and lack of integration.`, img: (imgBase+2)%11 },
        { layout: 'split', eyebrow: 'Pain Points', title: 'Three Structural Barriers', body0: `Fragmented tooling: 15+ separate tools for core workflows — each with its own dashboard and learning curve.`, body1: `Hidden costs: unpredictable pricing models, with 40% of budgets wasted on underutilized capacity and redundant systems.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Our Solution', sub: `The unified ${theme.industry} platform`, img: (imgBase+3)%11 },
        { layout: 'hero', eyebrow: 'OUR SOLUTION', title: `One Platform. Complete Integration.`, body: `${theme.company} provides a single, unified platform for ${theme.industry} — with predictable costs, enterprise-grade reliability, and seamless integration.`, img: (imgBase+3)%11 },
        { layout: 'split', eyebrow: 'How It Works', title: 'Deploy in Minutes, Not Months', body0: `Connect your systems — any framework, any cloud, any region. ${theme.company} handles the rest.`, body1: `Auto-scaling, load balancing, cost optimization, and observability — all in one dashboard.`, img: (imgBase+4)%11 },
        { layout: 'timeline', title: 'Development Journey', steps: ['MVP (2024 Q1)', 'Private Beta (2024 Q2)', 'Public Launch (2024 Q3)', 'Series A (2025 Q1)', 'Enterprise Scale (2025 Q3)', 'Global Expansion (2026 Q1)'], img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Technology', sub: 'Built for scale, designed for reliability', img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: 'TECH EDGE', stat: '99.99%', sub: 'Uptime SLA', body: `Our globally distributed architecture delivers four-nines uptime with automatic failover across regions.`, img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Technology Comparison', leftTitle: 'Legacy Approach', rightTitle: theme.company, left: ['Manual processes', 'Fragmented systems', 'High operational cost', 'Limited scalability'], right: ['Automated workflows', 'Unified platform', 'Predictable cost', 'Elastic scaling'], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Traction', sub: 'Momentum that speaks for itself', img: (imgBase+5)%11 },
        { layout: 'stats', title: 'Key Growth Metrics', stats: [{val:'$2.8M',lab:'ARR'},{val:'+280%',lab:'YoY Growth'},{val:'94%',lab:'Net Retention'},{val:'48',lab:'Enterprise Customers'}], body: `From $0 to $2.8M ARR in 18 months, with 94% net revenue retention — best-in-class for B2B SaaS at our stage.`, img: imgBase },
        { layout: 'table', title: 'Milestone Timeline', head: ['Quarter', 'MRR', 'Customers', 'Key Milestone'], rows: [['Q1 2024','$80K','3','MVP Launch'],['Q2 2024','$280K','12','Private Beta'],['Q3 2024','$720K','28','Public Launch'],['Q4 2024','$1.4M','42','Enterprise First'],['Q1 2025','$2.8M','48','Series A']], img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'Business Model', sub: 'A scalable, repeatable revenue engine', img: (imgBase+1)%11 },
        { layout: 'timeline', title: 'Monetization Path', steps: ['Usage-based pricing', 'Enterprise contracts', 'Platform licensing', 'Marketplace revenue', 'API monetization', 'Data services'], img: (imgBase+2)%11 },
        { layout: 'big-stat', eyebrow: 'UNIT ECONOMICS', stat: '$48K', sub: 'Average Annual Contract Value', body: `With 94% gross margins and a 14-month payback period, our unit economics are best-in-class for B2B infrastructure.`, img: (imgBase+2)%11 },
        { layout: 'comparison', title: 'Competitive Analysis', leftTitle: 'Competitors', rightTitle: theme.company, left: ['Limited integration', 'High pricing', 'Slow support', 'Proprietary lock-in'], right: ['Universal integration', 'Transparent pricing', '24/7 support', 'Open architecture'], img: (imgBase+3)%11 },
        { layout: 'divider', no: 7, title: 'Team', sub: 'Operators who have done it before', img: (imgBase+3)%11 },
        { layout: 'hero', eyebrow: 'THE TEAM', title: 'Built by Operators, for Operators', body: `Our founding team has shipped ${theme.industry} solutions at scale — from early-stage startups to Fortune 500 enterprises.`, img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Team Composition', stats: [{val:'4',lab:'Founders'},{val:'22',lab:'Team Members'},{val:'8',lab:'Senior (ex-FAANG)'},{val:'3',lab:'Industry Veterans'}], body: `A lean, senior team with deep expertise in ${theme.industry}, distributed systems, and enterprise sales.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 8, title: 'Financials', sub: 'Three-year projection', img: (imgBase+4)%11 },
        { layout: 'table', title: 'Financial Projection', head: ['Metric', 'Year 1', 'Year 2', 'Year 3'], rows: [['Revenue','$5M','$18M','$52M'],['Gross Margin','72%','82%','88%'],['Net Burn','$4M','$6M','$4M'],['Customers','120','480','1,200']], img: (imgBase+4)%11 },
        { layout: 'stats', title: 'Key Financial Metrics', stats: [{val:'$52M',lab:'Year 3 ARR'},{val:'88%',lab:'Gross Margin'},{val:'1,200',lab:'Customers'},{val:'$0',lab:'Break-even'}], body: `Conservative projections with clear paths to $52M ARR by Year 3 and profitability by Year 4.`, img: (imgBase+5)%11 },
        { layout: 'divider', no: 9, title: 'The Ask', sub: 'Join us in building the future', img: (imgBase+5)%11 },
        { layout: 'big-stat', eyebrow: 'THE ASK', stat: '$15M', sub: 'Series A Round', body: `Raising $15M to accelerate product development, expand sales capacity, and scale ${theme.industry} solutions globally.`, img: (imgBase+5)%11 },
        { layout: 'closing', eyebrow: 'Thank You', title: 'Let\'s Build the Future', sub: theme.tagline, img: imgBase },
      ]
    },
  },

  // 2. 季度报告
  {
    type: 'qbr',
    name: 'Quarterly Business Review',
    zh: '季度业务复盘报告',
    cat: '报告',
    fwOptions: [11, 12, 13],
    palOptions: [5, 6, 7, 8],
    fontOptions: [0, 1, 2],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'QBR · Q4 2025', title: `${theme.company} Quarterly Review`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Contents', items: ['Executive Summary', 'Financial Performance', 'Key Initiatives', 'Customer Metrics', 'Market Analysis', 'Operational Excellence', 'Q1 2026 Outlook', 'Strategic Priorities'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'A quarter of exceeding expectations', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Q4 Headline Numbers', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `${theme.company} delivered record quarterly performance, expanding into new markets and achieving the highest customer satisfaction score in company history.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: 'Above Plan on Every Metric', body: `We exceeded our Q4 revenue target by 12%, grew net new logos by 34%, and reduced churn to a record-low 1.8%.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Financial Performance', sub: 'Strong revenue growth with improving margins', img: (imgBase+2)%11 },
        { layout: 'table', title: 'Q4 Financial Summary', head: ['Metric', 'Q3 2025', 'Q4 2025', 'Change'], rows: [['Revenue','$10.2M','$12.4M','+22%'],['Gross Margin','78%','81%','+3pp'],['Operating Cost','$6.8M','$7.1M','+4%'],['EBITDA','$2.8M','$3.9M','+39%']], img: (imgBase+2)%11 },
        { layout: 'big-stat', eyebrow: 'REVENUE GROWTH', stat: '+28%', sub: 'vs Q3 2025', body: `Q4 revenue of $12.4M represents a 28% increase over Q3, driven by enterprise expansion and new market entries.`, img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Revenue Breakdown', stats: [{val:'$5.2M',lab:'Enterprise'},{val:'$4.1M',lab:'Mid-Market'},{val:'$2.1M',lab:'SMB'},{val:'$1.0M',lab:'Strategic'}], body: `Enterprise revenue grew 34% quarter-over-quarter, now representing 42% of total revenue.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Key Initiatives', sub: 'Strategic projects advancing on schedule', img: (imgBase+3)%11 },
        { layout: 'triple-grid', eyebrow: 'INITIATIVES', title: 'Three Strategic Bets', items: [{title:'Platform Expansion',body:`Launched ${theme.industry} v3.0 with 15 new features and 3x performance improvement.`},{title:'Market Entry',body:`Expanded into European market with 3 enterprise customers signed in Q4.`},{title:'AI Integration',body:`Deployed AI-powered workflows reducing operational overhead by 40%.`}], img: (imgBase+4)%11 },
        { layout: 'timeline', title: 'Initiative Timeline', steps: ['Q4: Platform v3.0 Launch', 'Q4: EU Market Entry', 'Q1: AI Feature Rollout', 'Q2: APAC Expansion', 'Q3: Enterprise Scale', 'Q4: Global Platform'], img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Customer Metrics', sub: 'Customer success is our success', img: (imgBase+4)%11 },
        { layout: 'stats', title: 'Customer Health', stats: [{val:'1,847',lab:'Active Customers'},{val:'94.2%',lab:'NPS'},{val:'1.8%',lab:'Churn Rate'},{val:'94%',lab:'Net Retention'}], body: `Customer satisfaction reached an all-time high with NPS of 94.2, while churn dropped to a record-low 1.8%.`, img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Customer Satisfaction Trends', leftTitle: 'Q3 2025', rightTitle: 'Q4 2025', left: ['NPS: 89.1', 'Churn: 2.4%', 'Retention: 91%', 'CSAT: 4.3/5'], right: ['NPS: 94.2', 'Churn: 1.8%', 'Retention: 94%', 'CSAT: 4.7/5'], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Market Analysis', sub: 'Understanding our competitive position', img: (imgBase+5)%11 },
        { layout: 'hero', eyebrow: 'MARKET POSITION', title: 'Industry Leader', body: `${theme.company} is now recognized as a top-3 player in ${theme.industry}, with the fastest growth rate and highest customer satisfaction in the category.`, img: imgBase },
        { layout: 'table', title: 'Competitive Landscape', head: ['Company', 'Market Share', 'Growth', 'NPS'], rows: [['Acme Corp','22%','8%','78'],[theme.company,'18%','28%','94'],['GlobalTech','15%','12%','82'],['Innovate Inc','12%','19%','88']], img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'Operational Excellence', sub: 'Running lean and efficient', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Operational Metrics', stats: [{val:'40%',lab:'Cost Efficiency'},{val:'2.4x',lab:'Revenue/Employee'},{val:'14 Days',lab:'Deploy Time'},{val:'99.99%',lab:'Uptime'}], body: `Achieved 40% improvement in operational efficiency through AI automation and process optimization.`, img: (imgBase+1)%11 },
        { layout: 'split', eyebrow: 'Operational Wins', title: 'Two Breakthroughs', body0: `AI automation: Deployed AI-powered workflows reducing manual operational overhead by 40%.`, body1: `Infrastructure: Migrated to multi-region architecture achieving 99.99% uptime with 30% lower infrastructure costs.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 7, title: 'Q1 2026 Outlook', sub: 'Building on momentum', img: (imgBase+2)%11 },
        { layout: 'timeline', title: 'Q1 2026 Roadmap', steps: ['January: Enterprise Platform v4', 'February: APAC Market Launch', 'March: AI Feature Suite', 'April: Partner Ecosystem', 'May: Developer Platform', 'June: Annual Conference'], img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'Q1 TARGET', stat: '$15M', sub: 'Revenue Target', body: `Q1 2026 revenue target of $15M represents 21% growth over Q4, driven by enterprise expansion and new market entries.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 8, title: 'Strategic Priorities', sub: 'Focus for the coming year', img: (imgBase+3)%11 },
        { layout: 'triple-grid', eyebrow: 'PRIORITIES', title: 'Three Strategic Focus Areas', items: [{title:'Enterprise First',body:`Double down on enterprise customers with dedicated success teams and custom integrations.`},{title:'Global Expansion',body:`Expand into APAC and LATAM markets with localized products and partnerships.`},{title:'AI-Native',body:`Make AI a core capability across all products, not just a feature.`}], img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Thank You', title: 'Stronger Than Ever', sub: theme.tagline, img: (imgBase+4)%11 },
      ]
    },
  },

  // 3. 品牌故事
  {
    type: 'brand',
    name: 'Brand Heritage Story',
    zh: '品牌传承故事',
    cat: '品牌设计',
    fwOptions: [29, 30, 31],
    palOptions: [2, 3, 9, 10],
    fontOptions: [0],
    build: (theme, imgBase) => {
      return [
        { layout: 'cover', eyebrow: 'HERITAGE · 1928—2025', title: theme.company, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Our Story', items: ['The Origin', 'The Craft', 'The Vision', 'The Collections', 'The Atelier', 'The Legacy'], img: imgBase },
        { layout: 'divider', no: 1, title: 'The Origin', sub: 'Where it all began', img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: '1928 · PARIS', title: 'A Workshop on Rue de Rivoli', body: `In a small workshop on Rue de Rivoli, ${theme.company} was born — a vision to create ${theme.industry} that would last for generations.`, img: (imgBase+1)%11 },
        { layout: 'quote', quote: `Quality is not an act, it is a habit.`, source: `${theme.company} Founding Principle`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'The Early Years', stats: [{val:'1928',lab:'Founded'},{val:'47',lab:'First Collection'},{val:'3',lab:'Artisans'},{val:'12',lab:'First Patrons'}], body: `Those first years established the principles that would guide ${theme.company} for the next century — craftsmanship, innovation, and uncompromising quality.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'The Craft', sub: 'Mastery honed over generations', img: (imgBase+2)%11 },
        { layout: 'hero', eyebrow: 'THE CRAFT', title: 'Where Art Meets Technique', body: `Every piece from ${theme.company} passes through the hands of master artisans who have trained for decades. Their expertise is the soul of our ${theme.industry}.`, img: (imgBase+2)%11 },
        { layout: 'timeline', title: 'Craft Evolution', steps: ['1928: Traditional Techniques', '1952: Mechanized Precision', '1978: Digital Integration', '2001: Hybrid Mastery', '2020: AI-Enhanced Craft', '2025: Sustainable Innovation'], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'The Vision', sub: 'A century of forward thinking', img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'VISION', stat: '100+', sub: 'Years of Innovation', body: `From a small workshop to a global ${theme.industry} leader — our vision has always been to create things that endure.`, img: (imgBase+3)%11 },
        { layout: 'split', eyebrow: 'The Philosophy', title: 'Two Pillars', body0: `Innovation: We embrace new technologies while honoring traditional techniques — because progress and heritage are not opposites.`, body1: `Sustainability: Every creation is designed to last, to be repaired, and to be passed down — because the best products are the ones that never need replacing.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'The Collections', sub: 'Iconic works across generations', img: (imgBase+4)%11 },
        { layout: 'triple-grid', eyebrow: 'COLLECTIONS', title: 'Three Defining Series', items: [{title:'The Originals (1928)',body:'The founding collection — simple, functional, built to last. Still in production today.'},{title:'The Modernist (1965)',body:'A bold departure into contemporary design that redefined the industry.'},{title:'The Future Line (2025)',body:'Sustainable materials, AI-designed, hand-finished — the next century begins.'}], img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Collection Evolution', leftTitle: 'Then', rightTitle: 'Now', left: ['Hand-built only', 'Local materials', 'Made to order', 'Crafted over months'], right: ['Hybrid techniques', 'Global materials', 'Made to scale', 'Crafted with precision'], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'The Atelier', sub: 'Where magic happens', img: (imgBase+5)%11 },
        { layout: 'hero', eyebrow: 'THE ATELIER', title: 'A Sanctuary of Craft', body: `Our atelier is more than a workshop — it is a living museum where techniques are preserved, taught, and evolved. Every artisan spends five years in apprenticeship before creating their first piece.`, img: imgBase },
        { layout: 'stats', title: 'Atelier by the Numbers', stats: [{val:'120+',lab:'Master Artisans'},{val:'5yr',lab:'Apprenticeship'},{val:'47',lab:'Techniques'},{val:'100%',lab:'Hand-Finished'}], body: `Our atelier is a living institution — where 120+ master artisans practice 47 distinct techniques, all hand-finished.`, img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'The Legacy', sub: 'What we leave behind', img: (imgBase+1)%11 },
        { layout: 'quote', quote: `We do not inherit the earth from our ancestors, we borrow it from our children.`, source: `${theme.company} Sustainability Manifesto`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'THE LEGACY', title: 'Built for the Next Century', body: `${theme.company} was founded on a simple belief: that ${theme.industry} should be beautiful, durable, and meaningful. That belief endures — as does our commitment to the craftsmanship that made us who we are.`, img: (imgBase+2)%11 },
        { layout: 'closing', eyebrow: 'Since 1928', title: 'A Century of Craft', sub: theme.tagline, img: (imgBase+2)%11 },
      ]
    },
  },

  // 4. 市场战略
  {
    type: 'strategy',
    name: 'Market Expansion Strategy',
    zh: '市场拓展战略',
    cat: '商业规划',
    fwOptions: [2, 3, 4],
    palOptions: [5, 6, 7, 8],
    fontOptions: [1, 2],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'STRATEGY · 2025—2026', title: `${theme.company} Expansion Blueprint`, sub: 'ENTERING 5 NEW MARKETS IN 18 MONTHS', img: imgBase },
        { layout: 'agenda', title: 'Strategic Plan', items: ['Current State', 'Market Selection', 'Go-to-Market', 'Operational Plan', 'Financial Model', 'Risk Assessment', 'Timeline & Milestones'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Current State', sub: 'Where we are today', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Current Market Position', stats: [{val:m[0],lab:ml[0]},{val:m[2],lab:ml[2]},{val:'3',lab:'Current Markets'},{val:'82%',lab:'Gross Margin'}], body: `Currently operating in three markets with strong revenue and 82% gross margins. We have proven our model and are ready to scale.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'CURRENT STATE', title: 'Strong Foundation, Global Ambitions', body: `We have proven our model in three mature markets. Now we replicate that success in five high-growth regions.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Market Selection', sub: 'Where we will expand', img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'TARGET MARKETS', title: 'Five Priority Regions', items: [{title:'North America',body:'$48B market, 22% CAGR, mature infrastructure, low regulatory risk.'},{title:'European Union',body:'$38B market, 19% CAGR, high willingness to pay, complex regulations.'},{title:'Japan',body:'$22B market, 16% CAGR, premium pricing, quality-first buyers.'},{title:'Southeast Asia',body:'$18B market, 34% CAGR, fast growth, price-sensitive market.'},{title:'Latin America',body:'$12B market, 28% CAGR, emerging middle class, growing adoption.'}], img: (imgBase+3)%11 },
        { layout: 'table', title: 'Market Comparison', head: ['Market', 'Size', 'CAGR', 'Entry Difficulty', 'Priority'], rows: [['North America','$48B','22%','Low','1'],['EU','$38B','19%','Medium','2'],['Japan','$22B','16%','Medium','3'],['SEA','$18B','34%','High','4'],['LATAM','$12B','28%','High','5']], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Go-to-Market', sub: 'How we will enter each market', img: (imgBase+3)%11 },
        { layout: 'timeline', title: 'Go-to-Market Sequencing', steps: ['Q1: NA Enterprise Push', 'Q2: EU Partner Launch', 'Q3: Japan Direct Office', 'Q4: SEA Localization', 'Q1: LATAM Partnership', 'Q2: Global Scale'], img: (imgBase+4)%11 },
        { layout: 'split', eyebrow: 'Two Approaches', title: 'Direct vs Partner', body0: `Direct entry: For high-value markets (NA, EU, Japan) — establish local teams, direct sales, full control.`, body1: `Partner entry: For emerging markets (SEA, LATAM) — leverage local partners, faster market access, shared risk.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Operational Plan', sub: 'Building for scale', img: (imgBase+4)%11 },
        { layout: 'stats', title: 'Operational Investment', stats: [{val:'$8M',lab:'Infrastructure'},{val:'$6M',lab:'Talent'},{val:'$4M',lab:'Localization'},{val:'$3M',lab:'Marketing'}], body: `Total operational investment of $21M to support five new market entries over 18 months.`, img: (imgBase+5)%11 },
        { layout: 'triple-grid', eyebrow: 'OPERATIONAL PILLARS', title: 'Three Foundations', items: [{title:'Infrastructure',body:'Multi-region cloud architecture, localized data centers, 99.99% uptime.'},{title:'Talent',body:'Local hiring, cultural training, 200 new positions across 5 markets.'},{title:'Localization',body:'Product adaptation, language support, cultural customization for each market.'}], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Financial Model', sub: 'The economics of expansion', img: (imgBase+5)%11 },
        { layout: 'table', title: 'Expansion Financials', head: ['Metric', 'Year 1', 'Year 2', 'Year 3'], rows: [['Revenue','$48M','$92M','$148M'],['Markets','5','8','12'],['Customers','480','1,200','2,400'],['EBITDA','$8M','$18M','$32M']], img: imgBase },
        { layout: 'big-stat', eyebrow: 'REVENUE TARGET', stat: '$148M', sub: 'Year 3 ARR', body: `Three-year projection shows $148M ARR with 12 active markets and 31% EBITDA margins.`, img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'Risk Assessment', sub: 'Preparing for challenges', img: (imgBase+1)%11 },
        { layout: 'comparison', title: 'Risk Mitigation', leftTitle: 'Risks', rightTitle: 'Mitigation', left: ['Regulatory complexity', 'Cultural differences', 'Talent acquisition', 'Currency fluctuation', 'Competitive response'], right: ['Local counsel teams', 'Cultural training', 'Partner hiring', 'Hedging strategy', 'Differentiation plan'], img: (imgBase+2)%11 },
        { layout: 'divider', no: 7, title: 'Timeline & Milestones', sub: '18-month execution plan', img: (imgBase+2)%11 },
        { layout: 'timeline', title: 'Expansion Roadmap', steps: ['Month 1-3: NA Push', 'Month 4-6: EU Launch', 'Month 7-9: Japan Office', 'Month 10-12: SEA Localize', 'Month 13-15: LATAM Partner', 'Month 16-18: Scale Up'], img: (imgBase+3)%11 },
        { layout: 'closing', eyebrow: 'Next Steps', title: 'Ready to Expand', sub: theme.tagline, img: (imgBase+3)%11 },
      ]
    },
  },

  // 5. 产品发布
  {
    type: 'launch',
    name: 'Product Launch Keynote',
    zh: '产品发布主题演讲',
    cat: '营销材料',
    fwOptions: [44, 45, 46],
    palOptions: [4, 5, 6, 7],
    fontOptions: [1, 2],
    build: (theme, imgBase) => {
      return [
        { layout: 'cover', eyebrow: 'LAUNCH · 2025', title: `${theme.company} Platform 3.0`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Keynote Agenda', items: ['The Journey', 'The Problem', 'The Vision', 'The Platform', 'The Features', 'The Demo', 'The Pricing', 'The Future'], img: imgBase },
        { layout: 'divider', no: 1, title: 'The Journey', sub: 'How we got here', img: (imgBase+1)%11 },
        { layout: 'timeline', title: 'Our Journey', steps: ['2023 — Founded', '2024 — Platform 1.0', '2024 — Platform 2.0', '2025 — Platform 3.0', '2026 — AI-Native', '2027 — Global'], img: (imgBase+1)%11 },
        { layout: 'stats', title: 'The Journey in Numbers', stats: [{val:'24mo',lab:'Since Founding'},{val:'3',lab:'Platform Versions'},{val:'180+',lab:'Enterprise Customers'},{val:'$2.8M',lab:'ARR'}], body: `In 24 months, we have shipped 3 platform versions, acquired 180+ enterprise customers, and reached $2.8M ARR.`, img: (imgBase+1)%11 },
        { layout: 'divider', no: 2, title: 'The Problem', sub: 'What customers are facing', img: (imgBase+2)%11 },
        { layout: 'hero', eyebrow: 'THE PROBLEM', title: 'The World Has Changed', body: `${theme.industry} is undergoing a fundamental shift. Traditional solutions were built for yesterday\'s world — they cannot handle today\'s scale, complexity, and speed.`, img: (imgBase+2)%11 },
        { layout: 'split', eyebrow: 'Pain Points', title: 'What Customers Tell Us', body0: `"We need to deploy faster, but our current tools are too slow." — CTO, Fortune 500`, body1: `"We are spending more on infrastructure but getting less value." — VP Engineering, SaaS Company`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'The Vision', sub: 'Where we are going', img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'VISION', stat: '3x', sub: 'Faster, Smarter, Better', body: `${theme.company} Platform 3.0 delivers 3x faster deployment, 3x lower costs, and 3x better outcomes.`, img: (imgBase+3)%11 },
        { layout: 'quote', quote: `The best platform is the one that disappears — leaving only the results.`, source: `${theme.company} Product Philosophy`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 4, title: 'The Platform', sub: 'Introducing Platform 3.0', img: (imgBase+4)%11 },
        { layout: 'hero', eyebrow: 'THE PLATFORM', title: 'Built for the AI Era', body: `${theme.company} Platform 3.0 is a complete reimagining of ${theme.industry} — built natively for AI, designed for scale, and optimized for outcomes.`, img: (imgBase+4)%11 },
        { layout: 'triple-grid', eyebrow: 'CORE CAPABILITIES', title: 'Three Pillars of Platform 3.0', items: [{title:'AI-Native Architecture',body:'Every layer of the platform is AI-powered — from deployment to optimization to scaling.'},{title:'Unified Experience',body:'One platform for all workflows — no more switching between 15 different tools.'},{title:'Elastic Scale',body:'Auto-scaling from 1 to 1 million users without manual intervention.'}], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'The Features', sub: 'What\'s new in 3.0', img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Before vs After', leftTitle: 'Platform 2.0', rightTitle: 'Platform 3.0', left: ['Manual scaling', 'Hours to deploy', 'Fixed pricing', 'Limited integrations', 'Basic analytics'], right: ['AI auto-scaling', 'Minutes to deploy', 'Usage-based pricing', '200+ integrations', 'Predictive analytics'], img: (imgBase+5)%11 },
        { layout: 'stats', title: 'Performance Improvements', stats: [{val:'3x',lab:'Faster Deployment'},{val:'60%',lab:'Lower Cost'},{val:'99.99%',lab:'Uptime'},{val:'200+',lab:'Integrations'}], body: `Platform 3.0 delivers 3x faster deployment, 60% lower costs, and 200+ integrations — a quantum leap in ${theme.industry}.`, img: imgBase },
        { layout: 'divider', no: 6, title: 'The Demo', sub: 'See it in action', img: (imgBase+1)%11 },
        { layout: 'timeline', title: 'Live Demo Flow', steps: ['1. Deploy in 60 seconds', '2. Scale to 1M users', '3. AI-powered optimization', '4. Real-time analytics', '5. Integration showcase', '6. Cost comparison'], img: (imgBase+1)%11 },
        { layout: 'divider', no: 7, title: 'The Pricing', sub: 'Simple, transparent, fair', img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'PRICING TIERS', title: 'Three Plans for Every Stage', items: [{title:'Starter — $0/mo',body:'For individuals and small teams. 1 project, 1K users, community support.'},{title:'Pro — $99/mo',body:'For growing companies. 10 projects, 100K users, priority support, advanced analytics.'},{title:'Enterprise — Custom',body:'For large organizations. Unlimited projects, custom SLA, dedicated support, SSO.'}], img: (imgBase+2)%11 },
        { layout: 'divider', no: 8, title: 'The Future', sub: 'What\'s next', img: (imgBase+3)%11 },
        { layout: 'hero', eyebrow: 'THE FUTURE', title: 'Platform 4.0 — Coming 2026', body: `Next year, we are launching Platform 4.0 — with autonomous AI agents, predictive scaling, and a completely new experience. This is just the beginning.`, img: (imgBase+3)%11 },
        { layout: 'closing', eyebrow: 'Available Today', title: 'Start Building Now', sub: theme.tagline, img: (imgBase+3)%11 },
      ]
    },
  },

  // 6. 年度回顾
  {
    type: 'annual',
    name: 'Annual Business Review',
    zh: '年度业务回顾',
    cat: '报告',
    fwOptions: [11, 12, 13],
    palOptions: [5, 6, 7, 8],
    fontOptions: [0, 1],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'ANNUAL REVIEW · 2025', title: `${theme.company} Year in Review`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Contents', items: ['Executive Summary', 'Year Highlights', 'Financial Performance', 'Customer Success', 'Product Milestones', 'Team Growth', 'Looking Ahead', 'Thank You'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'A year of transformation', img: (imgBase+1)%11 },
        { layout: 'stats', title: '2025 Headline Numbers', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `2025 was a transformative year for ${theme.company} — record growth, major product launches, and expansion into new markets.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: 'A Year of Breaking Records', body: `We exceeded all our 2025 targets: revenue grew 68%, customers doubled, and we launched 3 major product versions.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Year Highlights', sub: 'The moments that defined 2025', img: (imgBase+2)%11 },
        { layout: 'timeline', title: '2025 Timeline', steps: ['Jan: Platform 2.0 Launch', 'Mar: $15M Series B', 'May: EU Market Entry', 'Jul: 100th Customer', 'Sep: AI Integration', 'Dec: 1,000+ Customers'], img: (imgBase+3)%11 },
        { layout: 'triple-grid', eyebrow: 'HIGHLIGHTS', title: 'Three Defining Moments', items: [{title:'Series B — $15M',body:'Raised $15M from top investors to accelerate growth and expansion.'},{title:'100th Enterprise Customer',body:'Reached 100 enterprise customers — a milestone that validated our market fit.'},{title:'EU Market Entry',body:'Expanded into European markets with 12 enterprise customers in the first year.'}], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Financial Performance', sub: 'Strong growth, healthy margins', img: (imgBase+3)%11 },
        { layout: 'table', title: 'Annual Financial Summary', head: ['Metric', '2023', '2024', '2025'], rows: [['Revenue','$2.1M','$6.8M','$18.4M'],['Customers','42','180','480'],['Employees','12','35','78'],['Markets','1','2','5']], img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: 'REVENUE GROWTH', stat: '+170%', sub: 'vs 2024', body: `2025 revenue of $18.4M represents a 170% increase over 2024, driven by enterprise expansion and new market entries.`, img: (imgBase+4)%11 },
        { layout: 'stats', title: 'Revenue Breakdown', stats: [{val:'$7.8M',lab:'Enterprise'},{val:'$5.2M',lab:'Mid-Market'},{val:'$3.4M',lab:'SMB'},{val:'$2.0M',lab:'Strategic'}], body: `Enterprise revenue grew 240% year-over-year, now representing 43% of total revenue.`, img: (imgBase+5)%11 },
        { layout: 'divider', no: 4, title: 'Customer Success', sub: 'Our customers are winning', img: (imgBase+5)%11 },
        { layout: 'stats', title: 'Customer Health', stats: [{val:'480',lab:'Total Customers'},{val:'96.4',lab:'NPS'},{val:'1.2%',lab:'Churn Rate'},{val:'96%',lab:'Net Retention'}], body: `Customer satisfaction reached an all-time high with NPS of 96.4, while churn dropped to a record-low 1.2%.`, img: imgBase },
        { layout: 'comparison', title: 'Customer Growth', leftTitle: '2024', rightTitle: '2025', left: ['180 customers', 'NPS: 89.1', 'Churn: 2.4%', '9 markets'], right: ['480 customers', 'NPS: 96.4', 'Churn: 1.2%', '15 markets'], img: (imgBase+1)%11 },
        { layout: 'divider', no: 5, title: 'Product Milestones', sub: 'Innovation at scale', img: (imgBase+1)%11 },
        { layout: 'timeline', title: 'Product Roadmap 2025', steps: ['Q1: Platform 2.0', 'Q2: AI Integration', 'Q3: Mobile Experience', 'Q4: Platform 3.0', 'Q4: Developer API', 'Q4: Analytics Suite'], img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'PRODUCT ACHIEVEMENTS', title: 'Three Product Wins', items: [{title:'Platform 2.0',body:'Launched with 50+ new features, 3x performance, and 200+ integrations.'},{title:'AI Integration',body:'Deployed AI-powered features reducing customer effort by 40%.'},{title:'Developer API',body:'Opened platform with 120+ API endpoints and comprehensive documentation.'}], img: (imgBase+2)%11 },
        { layout: 'divider', no: 6, title: 'Team Growth', sub: 'The people behind the success', img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Team Metrics', stats: [{val:'78',lab:'Employees'},{val:'12',lab:'Countries'},{val:'42%',lab:'Female'},{val:'94%',lab:'Retention'}], body: `Team grew from 35 to 78 employees across 12 countries, with 94% retention and 42% female representation.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 7, title: 'Looking Ahead', sub: '2026 and beyond', img: (imgBase+3)%11 },
        { layout: 'timeline', title: '2026 Roadmap', steps: ['Q1: Platform 3.0 GA', 'Q2: APAC Expansion', 'Q3: AI-Native Features', 'Q4: Public Platform', 'Q1: Enterprise Scale', 'Q2: Global Dominance'], img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: '2026 TARGET', stat: '$45M', sub: 'ARR Target', body: `2026 revenue target of $45M represents 145% growth, driven by enterprise expansion and new market entries.`, img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Thank You', title: 'An Incredible Year', sub: theme.tagline, img: (imgBase+4)%11 },
      ]
    },
  },

  // 7. 商业计划
  {
    type: 'business-plan',
    name: 'Business Plan',
    zh: '商业计划书',
    cat: '商业规划',
    fwOptions: [2, 3, 4],
    palOptions: [5, 6, 7, 8],
    fontOptions: [1, 2],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'BUSINESS PLAN · 2025—2028', title: `${theme.company} Business Plan`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Table of Contents', items: ['Executive Summary', 'Company Overview', 'Market Analysis', 'Products & Services', 'Go-to-Market', 'Operations', 'Management', 'Financial Plan'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'The opportunity and our plan', img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: `Building the Future of ${theme.industry}`, body: `${theme.company} is positioned to capture a $${m[0]} market growing at ${m[1]} annually. Our plan outlines how we will become a category leader by 2028.`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'The Opportunity', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `The ${theme.industry} market is undergoing a fundamental transformation, creating unprecedented opportunities for innovative companies.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Company Overview', sub: 'Who we are and what we do', img: (imgBase+2)%11 },
        { layout: 'hero', eyebrow: 'COMPANY', title: theme.company, body: theme.tagline, img: (imgBase+2)%11 },
        { layout: 'split', eyebrow: 'Our Mission', title: 'Two Key Objectives', body0: `Mission: To transform ${theme.industry} through innovative technology and customer-centric design.`, body1: `Vision: To be the most trusted and innovative ${theme.industry} platform by 2028.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Market Analysis', sub: 'Understanding the landscape', img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Market Landscape', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:'$8.4B',lab:'TAM'},{val:'$2.1B',lab:'SAM'}], body: `The total addressable market is $${m[0]}, with a serviceable market of $2.1B and initial target of $800M.`, img: (imgBase+3)%11 },
        { layout: 'comparison', title: 'Competitive Landscape', leftTitle: 'Traditional Solutions', rightTitle: theme.company, left: ['Manual processes', 'High cost', 'Limited scalability', 'Poor UX'], right: ['Automated', 'Cost-effective', 'Elastic scale', 'Best-in-class UX'], img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Products & Services', sub: 'What we offer', img: (imgBase+4)%11 },
        { layout: 'triple-grid', eyebrow: 'PRODUCT PORTFOLIO', title: 'Three Core Offerings', items: [{title:'Core Platform',body:`${theme.industry} platform with 50+ features, 200+ integrations, and 99.99% uptime.`},{title:'AI Suite',body:'AI-powered workflows, predictive analytics, and intelligent automation.'},{title:'Enterprise Edition',body:'Custom integrations, dedicated support, SSO, and SLA guarantees.'}], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Go-to-Market', sub: 'How we will reach customers', img: (imgBase+5)%11 },
        { layout: 'timeline', title: 'GTM Strategy', steps: ['Q1: Direct Sales', 'Q2: Partner Channels', 'Q3: Content Marketing', 'Q4: Enterprise Push', 'Q1: Developer Ecosystem', 'Q2: Global Expansion'], img: (imgBase+5)%11 },
        { layout: 'split', eyebrow: 'Two Channels', title: 'Direct and Partner', body0: `Direct Sales: 20 sales reps targeting enterprise accounts in NA and EU.`, body1: `Partner Channels: 50+ partners in emerging markets for faster coverage.`, img: imgBase },
        { layout: 'divider', no: 6, title: 'Operations', sub: 'Building the engine', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Operational Plan', stats: [{val:'$8M',lab:'Infrastructure'},{val:'$6M',lab:'R&D'},{val:'$5M',lab:'Sales & Marketing'},{val:'$3M',lab:'G&A'}], body: `Total operational investment of $22M in Year 1, scaling to $45M by Year 3.`, img: (imgBase+1)%11 },
        { layout: 'divider', no: 7, title: 'Management', sub: 'The team behind the plan', img: (imgBase+2)%11 },
        { layout: 'stats', title: 'Leadership Team', stats: [{val:'4',lab:'Founders'},{val:'25+',lab:'Years Experience'},{val:'3',lab:'FAANG Alumni'},{val:'2',lab:'Exits'}], body: `Experienced team with 25+ years of combined experience, 3 FAANG alumni, and 2 successful exits.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 8, title: 'Financial Plan', sub: 'The numbers behind the vision', img: (imgBase+3)%11 },
        { layout: 'table', title: '3-Year Financial Projection', head: ['Metric', 'Year 1', 'Year 2', 'Year 3'], rows: [['Revenue','$5M','$18M','$52M'],['Gross Margin','72%','82%','88%'],['Customers','120','480','1,200'],['EBITDA','-$4M','$2M','$12M']], img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'FUNDING REQUIRED', stat: '$22M', sub: 'Total Investment', body: `$22M total investment over 3 years to achieve $52M ARR and profitability by Year 4.`, img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Next Steps', title: 'Let\'s Build Together', sub: theme.tagline, img: (imgBase+4)%11 },
      ]
    },
  },

  // 8. 研究报告
  {
    type: 'research',
    name: 'Research Report',
    zh: '研究报告',
    cat: '报告',
    fwOptions: [11, 12, 13],
    palOptions: [5, 6, 7, 8],
    fontOptions: [0, 1],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'RESEARCH REPORT · 2025', title: `${theme.industry} Industry Analysis`, sub: `A COMPREHENSIVE STUDY BY ${theme.company.toUpperCase()}`, img: imgBase },
        { layout: 'agenda', title: 'Table of Contents', items: ['Executive Summary', 'Methodology', 'Market Overview', 'Industry Trends', 'Competitive Analysis', 'Consumer Insights', 'Technology Assessment', 'Forecast & Recommendations'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'Key findings and recommendations', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Market Snapshot', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `The ${theme.industry} market is experiencing transformative growth, with ${theme.company} at the forefront of innovation and market leadership.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'KEY FINDINGS', title: 'Five Transformative Insights', body: `This report identifies five key trends reshaping ${theme.industry}: AI integration, market consolidation, consumer shifts, regulatory evolution, and geographic expansion.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Methodology', sub: 'How we conducted this research', img: (imgBase+2)%11 },
        { layout: 'stats', title: 'Research Scope', stats: [{val:'1,200',lab:'Survey Respondents'},{val:'48',lab:'Expert Interviews'},{val:'12',lab:'Countries'},{val:'2.4M',lab:'Data Points'}], body: `This study combined quantitative surveys, qualitative interviews, and secondary data analysis across 12 countries.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 3, title: 'Market Overview', sub: 'Understanding the landscape', img: (imgBase+3)%11 },
        { layout: 'table', title: 'Market Segmentation', head: ['Segment', 'Size', 'Share', 'Growth'], rows: [['Enterprise','$12B','42%','22%'],['Mid-Market','$6B','21%','28%'],['SMB','$8B','28%','31%'],['Strategic','$2.4B','9%','18%']], img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'MARKET SIZE', stat: m[0], sub: ml[0], body: `The total ${theme.industry} market is valued at ${m[0]}, growing at ${m[1]} annually, with significant untapped potential in emerging segments.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Industry Trends', sub: 'What\'s shaping the future', img: (imgBase+4)%11 },
        { layout: 'timeline', title: 'Trend Evolution', steps: ['2020: Digital Transformation', '2021: Cloud Adoption', '2022: AI Integration', '2023: Data-Driven Decisions', '2024: Automation Wave', '2025: AI-Native Era'], img: (imgBase+4)%11 },
        { layout: 'triple-grid', eyebrow: 'TOP TRENDS', title: 'Three Defining Trends', items: [{title:'AI Integration',body:'78% of companies plan to increase AI investment in ${theme.industry} over the next 3 years.'},{title:'Market Consolidation',body:'M&A activity up 60% as larger players acquire niche capabilities.'},{title:'Consumer Shifts',body:'65% of consumers now prioritize sustainability and ethics in purchasing decisions.'}], img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Competitive Analysis', sub: 'Landscape and positioning', img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Competitive Positioning', leftTitle: 'Traditional Players', rightTitle: 'Innovators', left: ['Market share: 60%', 'Growth: 12%', 'Innovation: Low', 'Customer Focus: Medium'], right: ['Market share: 25%', 'Growth: 35%', 'Innovation: High', 'Customer Focus: High'], img: (imgBase+5)%11 },
        { layout: 'table', title: 'Top 5 Companies', head: ['Rank', 'Company', 'Market Share', 'Revenue', 'Growth'], rows: [['1',theme.company,'18%','$8.4B','28%'],['2','GlobalTech','15%','$7.2B','19%'],['3','Innovate Inc','12%','$5.6B','31%'],['4','Apex Systems','10%','$4.8B','16%'],['5','Vertex Solutions','8%','$3.8B','24%']], img: imgBase },
        { layout: 'divider', no: 6, title: 'Consumer Insights', sub: 'Understanding the customer', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Consumer Behavior', stats: [{val:'68%',lab:'Research Online'},{val:'42%',lab:'Buy Within 1 Month'},{val:'85%',lab:'Value Quality'},{val:'55%',lab:'Willing to Pay More'}], body: `Consumer behavior analysis reveals strong demand for quality, transparency, and innovation in ${theme.industry}.`, img: (imgBase+1)%11 },
        { layout: 'split', eyebrow: 'Buyer Personas', title: 'Two Key Personas', body0: `Enterprise Buyer: 35-55, C-level, values ROI, security, and scalability. Decision cycle: 3-6 months.`, body1: `SMB Owner: 28-45, values simplicity, price, and speed. Decision cycle: 1-4 weeks.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 7, title: 'Technology Assessment', sub: 'The tech landscape', img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'TECH STACK', title: 'Three Technology Pillars', items: [{title:'Cloud Infrastructure',body:'92% of ${theme.industry} companies use cloud, with multi-cloud becoming the norm.'},{title:'AI & ML',body:'68% have deployed AI, with 42% planning to increase investment.'},{title:'Data Platforms',body:'Data infrastructure spending up 40% as companies compete on insights.'}], img: (imgBase+3)%11 },
        { layout: 'divider', no: 8, title: 'Forecast & Recommendations', sub: 'Looking ahead', img: (imgBase+3)%11 },
        { layout: 'timeline', title: '5-Year Forecast', steps: ['2025: AI-Native Shift', '2026: Market Consolidation', '2027: Global Expansion', '2028: Industry Leadership', '2029: Ecosystem Maturity', '2030: Next-Gen Evolution'], img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: 'FORECAST', stat: '2x', sub: 'Market Size by 2030', body: `The ${theme.industry} market is projected to double to ${m[0]} by 2030, driven by AI, globalization, and digital transformation.`, img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Conclusion', title: 'A Transformative Era', sub: theme.tagline, img: (imgBase+4)%11 },
      ]
    },
  },

  // 9. 咨询提案
  {
    type: 'consulting',
    name: 'Consulting Proposal',
    zh: '咨询提案',
    cat: '商业规划',
    fwOptions: [2, 3, 4],
    palOptions: [1, 2, 3, 4],
    fontOptions: [0, 1],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'PROPOSAL · 2025', title: `${theme.company} Consulting Proposal`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Proposal Contents', items: ['Executive Summary', 'Understanding Your Needs', 'Our Approach', 'Solution Design', 'Implementation Plan', 'Expected Outcomes', 'Team & Credentials', 'Timeline & Investment'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'Understanding your challenge', img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: `Transforming ${theme.industry} for ${theme.company}`, body: `We have analyzed your current situation and developed a comprehensive strategy to address your key challenges and accelerate growth.`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Key Challenges', stats: [{val:'34%',lab:'Revenue Gap'},{val:'2.4x',lab:'Efficiency Target'},{val:'$12M',lab:'Cost Savings'},{val:'18 Months',lab:'Timeline'}], body: `Our analysis identifies three critical areas for improvement: revenue growth, operational efficiency, and cost optimization.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Understanding Your Needs', sub: 'Deep dive into your situation', img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'KEY CHALLENGES', title: 'Three Critical Issues', items: [{title:'Revenue Growth',body:'Current growth rate of 12% is below industry average of 22%. Need to accelerate.'},{title:'Operational Efficiency',body:'Operational costs are 40% higher than benchmark. Need to optimize processes.'},{title:'Market Position',body:'Brand awareness is low in key segments. Need to strengthen market presence.'}], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Our Approach', sub: 'How we will work together', img: (imgBase+3)%11 },
        { layout: 'timeline', title: 'Consulting Methodology', steps: ['Discovery: Weeks 1-2', 'Analysis: Weeks 3-4', 'Strategy: Weeks 5-6', 'Design: Weeks 7-8', 'Implementation: Months 3-9', 'Optimization: Months 10-18'], img: (imgBase+4)%11 },
        { layout: 'split', eyebrow: 'Two Phases', title: 'Strategy and Execution', body0: `Phase 1 — Strategy (Months 1-2): Deep analysis, strategy development, and roadmap creation.`, body1: `Phase 2 — Execution (Months 3-18): Implementation support, change management, and continuous optimization.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Solution Design', sub: 'Our recommended approach', img: (imgBase+5)%11 },
        { layout: 'comparison', title: 'Recommended Solution', leftTitle: 'Current State', rightTitle: 'Proposed State', left: ['Manual processes', 'Fragmented systems', 'Limited data usage', 'Reactive strategy'], right: ['Automated workflows', 'Unified platform', 'Data-driven decisions', 'Proactive strategy'], img: (imgBase+5)%11 },
        { layout: 'triple-grid', eyebrow: 'SOLUTION PILLARS', title: 'Three Strategic Initiatives', items: [{title:'Revenue Acceleration',body:'New market entry, pricing optimization, and sales enablement.'},{title:'Operational Excellence',body:'Process automation, cost optimization, and technology modernization.'},{title:'Market Positioning',body:'Brand strategy, digital presence, and thought leadership.'}], img: imgBase },
        { layout: 'divider', no: 5, title: 'Implementation Plan', sub: 'How we will execute', img: (imgBase+1)%11 },
        { layout: 'table', title: 'Implementation Roadmap', head: ['Phase', 'Timeline', 'Key Deliverables', 'Owner'], rows: [['Discovery','Weeks 1-2','Current state analysis','Consulting Team'],['Strategy','Weeks 3-6','Strategy & roadmap','Consulting + Client'],['Design','Weeks 7-8','Solution design','Consulting Team'],['Implementation','Months 3-9','Execution & support','Joint Team'],['Optimization','Months 10-18','Continuous improvement','Joint Team']], img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'Expected Outcomes', sub: 'What you can expect', img: (imgBase+2)%11 },
        { layout: 'stats', title: 'Projected Impact', stats: [{val:'+34%',lab:'Revenue Growth'},{val:'2.4x',lab:'Efficiency Gain'},{val:'$12M',lab:'Cost Savings'},{val:'18mo',lab:'Timeline'}], body: `Expected outcomes include 34% revenue growth, 2.4x operational efficiency, and $12M in cost savings over 18 months.`, img: (imgBase+2)%11 },
        { layout: 'big-stat', eyebrow: 'ROI', stat: '5.2x', sub: 'Return on Investment', body: `The projected return on investment is 5.2x, with a payback period of 8 months.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 7, title: 'Team & Credentials', sub: 'The people behind the proposal', img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Consulting Team', stats: [{val:'5',lab:'Senior Consultants'},{val:'15+',lab:'Years Experience'},{val:'40+',lab:'Projects Delivered'},{val:'98%',lab:'Client Satisfaction'}], body: `Our team includes 5 senior consultants with 15+ years of experience and a 98% client satisfaction rate.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 8, title: 'Timeline & Investment', sub: 'Proposed engagement terms', img: (imgBase+4)%11 },
        { layout: 'table', title: 'Engagement Terms', head: ['Phase', 'Duration', 'Investment', 'Deliverables'], rows: [['Discovery','2 weeks','$50K','Current state report'],['Strategy','4 weeks','$120K','Strategy & roadmap'],['Implementation','7 months','$600K','Execution & support'],['Optimization','9 months','$350K','Continuous improvement'],['Total','18 months','$1.12M','Full transformation']], img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Next Steps', title: 'Ready to Begin', sub: theme.tagline, img: (imgBase+5)%11 },
      ]
    },
  },

  // 10. 营销方案
  {
    type: 'marketing',
    name: 'Marketing Plan',
    zh: '营销方案',
    cat: '营销材料',
    fwOptions: [44, 45, 46],
    palOptions: [4, 5, 6, 7],
    fontOptions: [1, 2],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'MARKETING PLAN · 2025—2026', title: `${theme.company} Marketing Strategy`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Marketing Plan Contents', items: ['Executive Summary', 'Market Analysis', 'Target Audience', 'Positioning & Messaging', 'Channel Strategy', 'Content Plan', 'Campaign Calendar', 'Budget & KPIs'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'Our marketing vision', img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: `Marketing ${theme.industry} Like Never Before`, body: `Our marketing plan is designed to position ${theme.company} as the undisputed leader in ${theme.industry}, with a focus on brand awareness, lead generation, and customer engagement.`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Marketing Goals', stats: [{val:'2.4x',lab:'Brand Awareness'},{val:'50K',lab:'Leads/Year'},{val:'$12M',lab:'Pipeline'},{val:'4.8',lab:'Customer Score'}], body: `Our goals include doubling brand awareness, generating 50K leads, and building a $12M sales pipeline.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Market Analysis', sub: 'Understanding the landscape', img: (imgBase+2)%11 },
        { layout: 'stats', title: 'Market Overview', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `The ${theme.industry} market is dynamic and growing, with increasing demand for innovative solutions and changing consumer behaviors.`, img: (imgBase+2)%11 },
        { layout: 'comparison', title: 'Competitive Marketing', leftTitle: 'Competitor Approach', rightTitle: `${theme.company} Approach`, left: ['Product-focused messaging', 'Broad targeting', 'Traditional channels', 'Tactical campaigns'], right: ['Value-focused messaging', 'Segmented targeting', 'Digital-first channels', 'Strategic campaigns'], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Target Audience', sub: 'Who we are marketing to', img: (imgBase+3)%11 },
        { layout: 'triple-grid', eyebrow: 'AUDIENCE SEGMENTS', title: 'Three Key Segments', items: [{title:'Enterprise Decision Makers',body:'C-level executives, 35-55, focused on ROI, scalability, and security.'},{title:'Technical Buyers',body:'IT Directors, 30-50, focused on integration, reliability, and technical fit.'},{title:'End Users',body:'Operations teams, 25-45, focused on usability, efficiency, and support.'}], img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Positioning & Messaging', sub: 'How we stand out', img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: 'POSITIONING', stat: `#1`, sub: 'in ' + theme.industry, body: `${theme.company} is positioned as the most innovative, customer-centric ${theme.industry} platform — the only one built for the AI era.`, img: (imgBase+4)%11 },
        { layout: 'split', eyebrow: 'Messaging Framework', title: 'Two Key Messages', body0: `Core Message: ${theme.company} transforms ${theme.industry} through AI-native innovation and unmatched customer experience.`, body1: `Supporting Message: From startups to Fortune 500, ${theme.company} powers the world\'s most innovative companies.`, img: (imgBase+5)%11 },
        { layout: 'divider', no: 5, title: 'Channel Strategy', sub: 'Where we will be seen', img: (imgBase+5)%11 },
        { layout: 'triple-grid', eyebrow: 'MARKETING CHANNELS', title: 'Three Channel Pillars', items: [{title:'Digital & Content',body:'SEO, content marketing, social media, and email — the core of our inbound strategy.'},{title:'Events & PR',body:'Industry events, thought leadership, and media relations — building brand authority.'},{title:'Partner & Referral',body:'Channel partners, referral programs, and co-marketing — scaling through partnerships.'}], img: imgBase },
        { layout: 'divider', no: 6, title: 'Content Plan', sub: 'What we will create', img: (imgBase+1)%11 },
        { layout: 'table', title: 'Content Calendar', head: ['Content Type', 'Frequency', 'Owner', 'Purpose'], rows: [['Blog Posts','2/week','Content Team','SEO & Education'],['Videos','1/week','Video Team','Engagement'],['Whitepapers','1/quarter','Content Team','Lead Gen'],['Case Studies','1/month','Marketing','Social Proof'],['Webinars','1/month','Marketing','Lead Gen'],['Social','Daily','Social Team','Brand Building']], img: (imgBase+1)%11 },
        { layout: 'divider', no: 7, title: 'Campaign Calendar', sub: 'Planned campaigns for 2026', img: (imgBase+2)%11 },
        { layout: 'timeline', title: 'Annual Campaign Plan', steps: ['Q1: Brand Launch', 'Q2: Product Spotlight', 'Q3: Customer Success', 'Q4: Year-End Push', 'Q1: New Market', 'Q2: Ecosystem'], img: (imgBase+2)%11 },
        { layout: 'stats', title: 'Campaign Metrics', stats: [{val:'50K',lab:'Total Leads'},{val:'$12M',lab:'Pipeline'},{val:'3.2M',lab:'Website Visits'},{val:'4.8M',lab:'Social Reach'}], body: `Expected campaign results include 50K leads, $12M pipeline, and 3.2M website visits.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 8, title: 'Budget & KPIs', sub: 'Investment and measurement', img: (imgBase+3)%11 },
        { layout: 'table', title: 'Marketing Budget', head: ['Category', 'Annual Budget', '% of Total', 'Key KPI'], rows: [['Content & SEO','$600K','25%','Organic Traffic'],['Paid Media','$720K','30%','Leads & Conversions'],['Events & PR','$480K','20%','Brand Awareness'],['Technology','$360K','15%','Marketing ROI'],['Team','$240K','10%','Productivity'],['Total','$2.4M','100%','Revenue Impact']], img: (imgBase+4)%11 },
        { layout: 'big-stat', eyebrow: 'MARKETING ROI', stat: '5.2x', sub: 'Return on Investment', body: `Marketing investment of $2.4M is projected to generate $12M in pipeline and $4.8M in revenue — a 5.2x ROI.`, img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Let\'s Win', title: 'Marketing for Impact', sub: theme.tagline, img: (imgBase+4)%11 },
      ]
    },
  },

  // 11. 行业分析
  {
    type: 'industry',
    name: 'Industry Analysis',
    zh: '行业分析',
    cat: '商业规划',
    fwOptions: [11, 12, 13],
    palOptions: [5, 6, 7, 8],
    fontOptions: [0, 1],
    build: (theme, imgBase) => {
      const m = theme.metrics
      const ml = theme.metricLabels
      return [
        { layout: 'cover', eyebrow: 'INDUSTRY ANALYSIS · 2025', title: `${theme.industry} Deep Dive`, sub: `A COMPREHENSIVE MARKET STUDY`, img: imgBase },
        { layout: 'agenda', title: 'Analysis Contents', items: ['Executive Summary', 'Market Overview', 'Segment Analysis', 'Competitive Landscape', 'Technology Trends', 'Regulatory Environment', 'Risk Assessment', 'Opportunities & Outlook'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Executive Summary', sub: 'The state of the industry', img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Market Snapshot', stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}], body: `The ${theme.industry} industry is undergoing a period of rapid transformation, with ${theme.company} among the leaders driving innovation and growth.`, img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'EXECUTIVE SUMMARY', title: 'A Dynamic, Transforming Industry', body: `${theme.industry} is experiencing unprecedented change driven by AI, digital transformation, and shifting consumer expectations. This report provides a comprehensive analysis of the current state and future direction.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Market Overview', sub: 'Size, growth, and structure', img: (imgBase+2)%11 },
        { layout: 'table', title: 'Market Structure', head: ['Segment', 'Size', 'Growth', 'Key Players'], rows: [['Enterprise','$12B','22%','5 players'],['Mid-Market','$6B','28%','12 players'],['SMB','$8B','31%','48 players'],['Emerging','$2.4B','42%','20 players']], img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'MARKET SIZE', stat: m[0], sub: ml[0], body: `Total market size of ${m[0]} growing at ${m[1]} annually, with emerging segments showing even higher growth rates.`, img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Segment Analysis', sub: 'Deep dive into segments', img: (imgBase+4)%11 },
        { layout: 'triple-grid', eyebrow: 'KEY SEGMENTS', title: 'Three Priority Segments', items: [{title:'Enterprise',body:'Largest segment, highest ARPU, longest sales cycles, strong retention.'},{title:'Mid-Market',body:'Fastest-growing segment, balanced ARPU, moderate sales cycles, good fit.'},{title:'Emerging',body:'Smallest but fastest-growing, lower ARPU, high potential, early stage.'}], img: (imgBase+4)%11 },
        { layout: 'comparison', title: 'Segment Comparison', leftTitle: 'Current', rightTitle: '5-Year Projection', left: [`Revenue: ${m[0]}`, `Growth: ${m[1]}`, 'Customers: 480M', 'Markets: 15'], right: ['Revenue: $2x', 'Growth: 28%', 'Customers: 920M', 'Markets: 28'], img: (imgBase+5)%11 },
        { layout: 'divider', no: 4, title: 'Competitive Landscape', sub: 'Who is winning', img: (imgBase+5)%11 },
        { layout: 'table', title: 'Market Share Analysis', head: ['Rank', 'Company', 'Share', 'Revenue', 'Trend'], rows: [['1',theme.company,'18%','$8.4B','Up'],['2','GlobalTech','15%','$7.2B','Stable'],['3','Innovate Inc','12%','$5.6B','Up'],['4','Apex Systems','10%','$4.8B','Down'],['5','Vertex Solutions','8%','$3.8B','Up']], img: imgBase },
        { layout: 'stats', title: 'Competitive Metrics', stats: [{val:'18%',lab:'Top Player Share'},{val:'42',lab:'Total Players'},{val:'$28B',lab:'Total Revenue'},{val:'5.2x',lab:'M&A Activity'}], body: `Market is moderately concentrated with the top 5 players holding 63% share, but M&A activity is accelerating consolidation.`, img: (imgBase+1)%11 },
        { layout: 'divider', no: 5, title: 'Technology Trends', sub: 'What\'s driving change', img: (imgBase+1)%11 },
        { layout: 'timeline', title: 'Tech Evolution', steps: ['2020: Cloud Migration', '2021: API Economy', '2022: Data Platforms', '2023: AI Integration', '2024: Automation', '2025: AI-Native'], img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'TECH TRENDS', title: 'Three Transformative Trends', items: [{title:'AI-Native Architecture',body:'78% of companies are redesigning products for AI-first experiences.'},{title:'Data-Driven Decisions',body:'62% report data platforms as their top investment priority.'},{title:'Automation at Scale',body:'55% are automating workflows to reduce costs and improve speed.'}], img: (imgBase+2)%11 },
        { layout: 'divider', no: 6, title: 'Regulatory Environment', sub: 'Compliance and regulation', img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Regulatory Landscape', stats: [{val:'34',lab:'Key Regulations'},{val:'12',lab:'Jurisdictions'},{val:'68%',lab:'Compliance Cost'},{val:'$4.2B',lab:'Compliance Spend'}], body: `The regulatory environment is complex and evolving, with 34 key regulations across 12 major jurisdictions.`, img: (imgBase+3)%11 },
        { layout: 'split', eyebrow: 'Two Regulatory Forces', title: 'Compliance and Innovation', body0: `Compliance Pressure: 68% of companies report increasing compliance costs, with GDPR, CCPA, and industry-specific regulations driving complexity.`, body1: `Innovation Opportunity: Regulatory pressure is also driving innovation — 45% of companies are developing compliance-as-a-feature.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 7, title: 'Risk Assessment', sub: 'What could go wrong', img: (imgBase+4)%11 },
        { layout: 'comparison', title: 'Risk Matrix', leftTitle: 'Key Risks', rightTitle: 'Mitigation', left: ['Technology disruption', 'Regulatory changes', 'Competitive consolidation', 'Economic downturn', 'Talent shortage'], right: ['Continuous innovation', 'Regulatory monitoring', 'Strategic positioning', 'Diversified model', 'Talent investment'], img: (imgBase+4)%11 },
        { layout: 'divider', no: 8, title: 'Opportunities & Outlook', sub: 'The future of the industry', img: (imgBase+5)%11 },
        { layout: 'timeline', title: 'Industry Outlook', steps: ['2025: AI-Native Shift', '2026: Market Consolidation', '2027: Global Standardization', '2028: Ecosystem Maturity', '2029: Industry Leadership', '2030: Next-Gen Evolution'], img: (imgBase+5)%11 },
        { layout: 'big-stat', eyebrow: 'OUTLOOK', stat: '2.1x', sub: 'Growth by 2030', body: `The ${theme.industry} market is projected to grow 2.1x to ${m[0]} by 2030, driven by AI, globalization, and digital transformation.`, img: (imgBase+5)%11 },
        { layout: 'closing', eyebrow: 'Conclusion', title: 'A Bright Future', sub: theme.tagline, img: (imgBase+5)%11 },
      ]
    },
  },

  // 12. 培训材料
  {
    type: 'training',
    name: 'Training Program',
    zh: '培训方案',
    cat: '教育',
    fwOptions: [29, 30, 31],
    palOptions: [2, 3, 9, 10],
    fontOptions: [0, 1],
    build: (theme, imgBase) => {
      return [
        { layout: 'cover', eyebrow: 'TRAINING PROGRAM · 2025', title: `${theme.company} Training Program`, sub: theme.tagline.toUpperCase(), img: imgBase },
        { layout: 'agenda', title: 'Program Contents', items: ['Program Overview', 'Learning Objectives', 'Course Structure', 'Module 1: Foundations', 'Module 2: Core Skills', 'Module 3: Advanced Topics', 'Assessment & Certification', 'Next Steps'], img: imgBase },
        { layout: 'divider', no: 1, title: 'Program Overview', sub: 'Welcome to the journey', img: (imgBase+1)%11 },
        { layout: 'hero', eyebrow: 'PROGRAM OVERVIEW', title: `Mastering ${theme.industry}`, body: `This comprehensive training program is designed to take you from foundational knowledge to advanced mastery of ${theme.industry}, with hands-on exercises and real-world projects.`, img: (imgBase+1)%11 },
        { layout: 'stats', title: 'Program Stats', stats: [{val:'8',lab:'Weeks'},{val:'24',lab:'Hours of Content'},{val:'6',lab:'Modules'},{val:'3',lab:'Projects'}], body: `An 8-week intensive program with 24 hours of video content, 6 interactive modules, and 3 hands-on projects.`, img: (imgBase+2)%11 },
        { layout: 'divider', no: 2, title: 'Learning Objectives', sub: 'What you will achieve', img: (imgBase+2)%11 },
        { layout: 'triple-grid', eyebrow: 'OBJECTIVES', title: 'Three Learning Goals', items: [{title:'Foundational Knowledge',body:'Understand core concepts, terminology, and principles of ${theme.industry}.'},{title:'Practical Skills',body:'Develop hands-on skills to apply ${theme.industry} in real-world scenarios.'},{title:'Strategic Thinking',body:'Learn to think strategically about ${theme.industry} implementation and optimization.'}], img: (imgBase+3)%11 },
        { layout: 'divider', no: 3, title: 'Course Structure', sub: 'How the program is organized', img: (imgBase+3)%11 },
        { layout: 'timeline', title: '8-Week Roadmap', steps: ['Week 1: Introduction', 'Week 2: Foundations', 'Week 3: Core Concepts', 'Week 4: Hands-On Lab', 'Week 5: Advanced Topics', 'Week 6: Real-World Project', 'Week 7: Optimization', 'Week 8: Capstone'], img: (imgBase+4)%11 },
        { layout: 'table', title: 'Course Schedule', head: ['Week', 'Topic', 'Duration', 'Assessment'], rows: [['1','Introduction','3h','Quiz'],['2','Foundations','4h','Quiz'],['3','Core Concepts','4h','Quiz'],['4','Hands-On Lab','5h','Lab'],['5','Advanced','4h','Quiz'],['6','Project','6h','Project'],['7','Optimization','3h','Quiz'],['8','Capstone','3h','Final Project']], img: (imgBase+4)%11 },
        { layout: 'divider', no: 4, title: 'Module 1: Foundations', sub: 'Building the base', img: (imgBase+5)%11 },
        { layout: 'hero', eyebrow: 'MODULE 1', title: '${theme.industry} Fundamentals', body: `This module covers the history, current state, and future direction of ${theme.industry}, providing the context you need to understand the field.`, img: (imgBase+5)%11 },
        { layout: 'split', eyebrow: 'Key Topics', title: 'Two Core Areas', body0: `History & Evolution: Trace the development of ${theme.industry} from its origins to today\'s cutting-edge innovations.`, body1: `Industry Landscape: Understand the key players, market segments, and competitive dynamics shaping ${theme.industry}.`, img: imgBase },
        { layout: 'divider', no: 5, title: 'Module 2: Core Skills', sub: 'Developing practical abilities', img: (imgBase+1)%11 },
        { layout: 'triple-grid', eyebrow: 'CORE SKILLS', title: 'Three Essential Skills', items: [{title:'Technical Fundamentals',body:'Master the core technical concepts and tools used in ${theme.industry}.'},{title:'Analytical Thinking',body:'Learn to analyze problems, evaluate solutions, and make data-driven decisions.'},{title:'Practical Application',body:'Apply your knowledge through hands-on exercises and real-world scenarios.'}], img: (imgBase+1)%11 },
        { layout: 'divider', no: 6, title: 'Module 3: Advanced Topics', sub: 'Going beyond the basics', img: (imgBase+2)%11 },
        { layout: 'comparison', title: 'Advanced vs Foundation', leftTitle: 'Foundation', rightTitle: 'Advanced', left: ['Basic concepts', 'Standard tools', 'Simple scenarios', 'Entry-level tasks'], right: ['Complex systems', 'Advanced tools', 'Real-world scenarios', 'Expert-level tasks'], img: (imgBase+2)%11 },
        { layout: 'divider', no: 7, title: 'Assessment & Certification', sub: 'Measuring your progress', img: (imgBase+3)%11 },
        { layout: 'stats', title: 'Assessment Framework', stats: [{val:'6',lab:'Quizzes'},{val:'3',lab:'Projects'},{val:'1',lab:'Capstone'},{val:'85%',lab:'Pass Rate'}], body: `The program includes 6 quizzes, 3 hands-on projects, and 1 capstone project, with an 85% pass rate for certification.`, img: (imgBase+3)%11 },
        { layout: 'big-stat', eyebrow: 'CERTIFICATION', stat: 'Pro', sub: '${theme.company} Certified', body: `Upon completion, you will receive a ${theme.company} Professional Certification, recognized across the ${theme.industry} industry.`, img: (imgBase+4)%11 },
        { layout: 'divider', no: 8, title: 'Next Steps', sub: 'Your journey begins here', img: (imgBase+4)%11 },
        { layout: 'hero', eyebrow: 'NEXT STEPS', title: 'Enroll Today', body: `Space in this program is limited to ensure quality. Enroll now to secure your spot in the next cohort.`, img: (imgBase+4)%11 },
        { layout: 'closing', eyebrow: 'Thank You', title: 'Your Journey Starts Now', sub: theme.tagline, img: (imgBase+5)%11 },
      ]
    },
  },
]

/* ---------------- 模板生成函数 ---------------- */

/* ---------------- 页面扩展函数 ---------------- */
/* 为每个模板添加更多内容丰富的页面，确保 30+ 页 */

function extraPages(theme, imgBase, catType) {
  const m = theme.metrics
  const ml = theme.metricLabels
  const pages = []
  const ib = (n) => (imgBase + n) % 11

  // 通用扩展页面 1：深入分析 stats
  pages.push({
    layout: 'stats',
    title: `Deep Dive: ${theme.industry} Metrics`,
    stats: [{val:m[0],lab:ml[0]},{val:m[1],lab:ml[1]},{val:m[2],lab:ml[2]},{val:m[3],lab:ml[3]}],
    body: `Detailed analysis of ${theme.industry} market dynamics, growth drivers, and competitive forces shaping the industry landscape.`,
    img: ib(6),
  })

  // 通用扩展页面 2：时间线
  pages.push({
    layout: 'timeline',
    title: 'Industry Evolution Timeline',
    steps: ['2020: Digital Transformation', '2021: Cloud Adoption', '2022: AI Integration', '2023: Data-Driven Decisions', '2024: Automation Wave', '2025: AI-Native Era', '2026: Quantum Leap'],
    img: ib(7),
  })

  // 通用扩展页面 3：对比
  pages.push({
    layout: 'comparison',
    title: `${theme.company} vs Industry Standard`,
    leftTitle: 'Industry Standard',
    rightTitle: theme.company,
    left: ['Legacy approaches', 'Fragmented solutions', 'Limited scalability', 'Manual processes', 'Reactive support'],
    right: ['Modern architecture', 'Unified platform', 'Elastic scaling', 'Automated workflows', 'Proactive support'],
    img: ib(8),
  })

  // 通用扩展页面 4：大数字
  pages.push({
    layout: 'big-stat',
    eyebrow: 'MARKET POTENTIAL',
    stat: m[0],
    sub: ml[0],
    body: `The total addressable market for ${theme.industry} is ${m[0]}, with a serviceable market of $2.1B and a realistic capture target of $800M over five years.`,
    img: ib(9),
  })

  // 通用扩展页面 5：引用
  pages.push({
    layout: 'quote',
    quote: `The best companies don't just adapt to change — they define it. ${theme.company} is built for the era ahead.`,
    source: `${theme.company} Vision Statement`,
    img: ib(10),
  })

  // 通用扩展页面 6：三栏
  pages.push({
    layout: 'triple-grid',
    eyebrow: 'STRATEGIC ADVANTAGES',
    title: 'Three Competitive Edges',
    items: [
      {title:'Technology Leadership', body:`Cutting-edge ${theme.industry} technology with 50+ patents and continuous innovation.`},
      {title:'Customer Obsession', body:'98% customer satisfaction rate with dedicated success teams and 24/7 support.'},
      {title:'Scalable Architecture', body:'Proven at scale with 1M+ users, 99.99% uptime, and global infrastructure.'},
    ],
    img: ib(6),
  })

  // 通用扩展页面 7：分割
  pages.push({
    layout: 'split',
    eyebrow: 'TWO PILLARS',
    title: 'Strategy & Execution',
    body0: `Strategy: A clear vision for ${theme.industry} leadership, backed by market data, competitive analysis, and customer insights.`,
    body1: `Execution: A proven implementation framework with 90-day milestones, dedicated teams, and measurable outcomes.`,
    img: ib(7),
  })

  // 通用扩展页面 8：分割2
  pages.push({
    layout: 'split',
    eyebrow: 'VALUE PROPOSITION',
    title: 'What Sets Us Apart',
    body0: `Innovation: We invest 30% of revenue in R&D, ensuring we stay ahead of market trends and technological shifts.`,
    body1: `Trust: 480+ enterprise customers trust ${theme.company} with their most critical ${theme.industry} workflows.`,
    img: ib(8),
  })

  // 类别特定扩展
  if (catType === 'brand') {
    pages.push({ layout: 'hero', eyebrow: 'CRAFTSMANSHIP', title: 'The Art of Making', body: `Every ${theme.company} product is a testament to our commitment to ${theme.industry} excellence — where tradition meets innovation.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Craft Legacy', stats: [{val:'97yr',lab:'Average Experience'},{val:'47',lab:'Techniques'},{val:'120+',lab:'Artisans'},{val:'100%',lab:'Hand-Finished'}], body: `Our artisans平均拥有97年的技艺传承，每一件作品都凝聚着几个世纪的工艺智慧。`, img: ib(10) })
  } else if (catType === 'pitch') {
    pages.push({ layout: 'hero', eyebrow: 'COMPETITIVE MOAT', title: 'Our Defensibility', body: `${theme.company} has built multiple layers of competitive advantage — from technology to network effects to brand — that make us difficult to replicate.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Moat Factors', stats: [{val:'50+',lab:'Patents'},{val:'480+',lab:'Customers'},{val:'94%',lab:'Retention'},{val:'3.2x',lab:'Switching Cost'}], body: `Multiple layers of defensibility including technology patents, customer lock-in, data network effects, and brand equity.`, img: ib(10) })
  } else if (catType === 'qbr') {
    pages.push({ layout: 'hero', eyebrow: 'STRATEGIC INITIATIVE', title: 'Q1 2026 Focus Areas', body: `Three strategic priorities for Q1: accelerate enterprise growth, optimize operational efficiency, and expand into new markets.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Q1 Targets', stats: [{val:'$15M',lab:'Revenue'},{val:'+22%',lab:'Growth'},{val:'1,200',lab:'Customers'},{val:'96',lab:'NPS'}], body: `Q1 2026 targets include $15M revenue, 22% growth, and 1,200 active customers with NPS above 96.`, img: ib(10) })
  } else if (catType === 'strategy') {
    pages.push({ layout: 'hero', eyebrow: 'EXECUTION PLAN', title: '18-Month Roadmap', body: `A detailed execution plan covering market entry, operational build-out, talent acquisition, and technology infrastructure.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Investment Summary', stats: [{val:'$21M',lab:'Total Investment'},{val:'5',lab:'New Markets'},{val:'200',lab:'New Hires'},{val:'18mo',lab:'Timeline'}], body: `Total investment of $21M over 18 months to enter 5 new markets with 200 new hires.`, img: ib(10) })
  } else if (catType === 'launch') {
    pages.push({ layout: 'hero', eyebrow: 'EARLY RESULTS', title: 'Already Making Waves', body: `Since launch, ${theme.company} Platform 3.0 has been adopted by 48 enterprise customers, processing over 12M daily transactions.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Launch Momentum', stats: [{val:'48',lab:'Enterprise Customers'},{val:'12M',lab:'Daily Transactions'},{val:'3.2x',lab:'Faster Deployment'},{val:'60%',lab:'Cost Reduction'}], body: `Early adopters report 3.2x faster deployment and 60% cost reduction with Platform 3.0.`, img: ib(10) })
  } else if (catType === 'annual') {
    pages.push({ layout: 'hero', eyebrow: 'TEAM CULTURE', title: 'Our Culture & Values', body: `${theme.company} is built on a culture of excellence, innovation, and customer obsession — values that guide every decision we make.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Culture Metrics', stats: [{val:'4.8',lab:'Employee NPS'},{val:'94%',lab:'Retention'},{val:'42%',lab:'Female'},{val:'12',lab:'Countries'}], body: `Strong culture metrics including 4.8 employee NPS, 94% retention, and diverse team across 12 countries.`, img: ib(10) })
  } else if (catType === 'business-plan') {
    pages.push({ layout: 'hero', eyebrow: 'COMPETITIVE STRATEGY', title: 'Winning in the Market', body: `Our competitive strategy combines technology leadership, customer intimacy, and operational excellence to build a sustainable advantage.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Strategic Initiatives', stats: [{val:'30%',lab:'R&D Investment'},{val:'480+',lab:'Customers'},{val:'50+',lab:'Patents'},{val:'98%',lab:'Satisfaction'}], body: `Three pillars of competitive strategy: invest in R&D, build customer relationships, optimize operations.`, img: ib(10) })
  } else if (catType === 'research') {
    pages.push({ layout: 'hero', eyebrow: 'KEY INSIGHT', title: 'The $80B Opportunity', body: `Our research identifies an $80B opportunity in ${theme.industry} over the next five years, with ${theme.company} positioned to capture 15% of it.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Research Findings', stats: [{val:'$80B',lab:'5-Year Opportunity'},{val:'15%',lab:'Capture Target'},{val:'2.4M',lab:'Data Points'},{val:'48',lab:'Expert Interviews'}], body: `Comprehensive research across 12 countries, 1,200 survey respondents, and 48 expert interviews.`, img: ib(10) })
  } else if (catType === 'consulting') {
    pages.push({ layout: 'hero', eyebrow: 'VALUE CREATION', title: 'Transforming Your Business', body: `Our consulting engagement will deliver $12M in cost savings, 34% revenue growth, and 2.4x operational efficiency over 18 months.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Expected Value', stats: [{val:'$12M',lab:'Cost Savings'},{val:'+34%',lab:'Revenue Growth'},{val:'2.4x',lab:'Efficiency'},{val:'5.2x',lab:'ROI'}], body: `Expected value creation of $12M cost savings, 34% revenue growth, and 5.2x return on investment.`, img: ib(10) })
  } else if (catType === 'marketing') {
    pages.push({ layout: 'hero', eyebrow: 'BRAND VISION', title: `Becoming the ${theme.industry} Leader`, body: `Our marketing vision is to position ${theme.company} as the undisputed thought leader in ${theme.industry}, driving awareness, engagement, and conversion.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Marketing Impact', stats: [{val:'2.4x',lab:'Awareness'},{val:'50K',lab:'Leads'},{val:'$12M',lab:'Pipeline'},{val:'5.2x',lab:'ROI'}], body: `Expected marketing impact: 2.4x brand awareness, 50K leads, $12M pipeline, and 5.2x ROI.`, img: ib(10) })
  } else if (catType === 'industry') {
    pages.push({ layout: 'hero', eyebrow: 'FUTURE OUTLOOK', title: 'The Next Decade', body: `The next decade will bring even more transformation to ${theme.industry} — with AI, quantum computing, and new business models reshaping the landscape.`, img: ib(9) })
    pages.push({ layout: 'stats', title: '10-Year Forecast', stats: [{val:'2.1x',lab:'Market Growth'},{val:'$2x',lab:'Revenue'},{val:'920M',lab:'Customers'},{val:'28',lab:'Markets'}], body: `10-year forecast: 2.1x market growth, doubling revenue, 920M customers across 28 markets.`, img: ib(10) })
  } else if (catType === 'training') {
    pages.push({ layout: 'hero', eyebrow: 'LEARNING OUTCOMES', title: 'What You Will Master', body: `By completing this program, you will master the core concepts, practical skills, and strategic thinking needed to excel in ${theme.industry}.`, img: ib(9) })
    pages.push({ layout: 'stats', title: 'Program Value', stats: [{val:'24h',lab:'Content'},{val:'85%',lab:'Pass Rate'},{val:'Pro',lab:'Certification'},{val:'8wk',lab:'Duration'}], body: `Program value: 24 hours of content, 85% pass rate, professional certification, and 8-week duration.`, img: ib(10) })
  }

  return pages
}

/* ---------------- 变体构建器 ---------------- */
/* 为每个类别创建 4 种不同的页面结构变体 */

const VARIANT_ORDERS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [1, 2, 0, 4, 3, 5, 6, 7, 8],
  [2, 0, 1, 5, 3, 4, 7, 6, 8],
  [0, 2, 1, 3, 5, 4, 6, 8, 7],
]

function makeVariants(basePages, theme, imgBase, variant) {
  const cover = basePages[0]
  const agenda = basePages[1]
  const closing = basePages[basePages.length - 1]
  const middle = basePages.slice(2, -1)

  // 按 divider 分段
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

  // 按变体顺序重排段落
  const order = VARIANT_ORDERS[variant % VARIANT_ORDERS.length]
  const reordered = order.map((i) => sections[i]).filter(Boolean)

  // 为每个变体添加独特的内容页面
  const m = theme.metrics
  const ml = theme.metricLabels
  const ib = (n) => (imgBase + n) % 11
  const extra = []

  if (variant === 1) {
    extra.push({ layout: 'quote', quote: `The future belongs to those who believe in the beauty of their dreams.`, source: `${theme.company} Manifesto`, img: ib(6) })
    extra.push({ layout: 'stats', title: `${theme.industry} at a Glance`, stats: [{ val: m[0], lab: ml[0] }, { val: m[1], lab: ml[1] }, { val: m[2], lab: ml[2] }, { val: m[3], lab: ml[3] }], body: `Comprehensive overview of key ${theme.industry} metrics and trends.`, img: ib(7) })
  } else if (variant === 2) {
    extra.push({ layout: 'comparison', title: `Before ${theme.company}`, leftTitle: 'Before', rightTitle: 'After', left: ['Manual processes', 'High costs', 'Limited reach', 'Slow delivery'], right: ['Automated', 'Reduced costs', 'Global reach', 'Instant delivery'], img: ib(6) })
    extra.push({ layout: 'big-stat', eyebrow: 'IMPACT', stat: m[0], sub: ml[0], body: `${theme.company} has transformed ${theme.industry} with innovative solutions.`, img: ib(7) })
  } else if (variant === 3) {
    extra.push({ layout: 'timeline', title: `${theme.company} Journey`, steps: ['Founded (2020)', 'First Product (2021)', 'Series A (2022)', 'Global Expansion (2023)', 'Industry Leader (2024)', 'Future Vision (2025+)'], img: ib(6) })
    extra.push({ layout: 'split', eyebrow: 'VISION', title: 'Two Pillars', body0: `Innovation: We constantly push boundaries in ${theme.industry}.`, body1: `Impact: We create lasting value for customers and communities.`, img: ib(7) })
  }

  return [cover, agenda, ...reordered.flat(), ...extra, closing]
}

export function generatePresentationTemplates() {
  const templates = []
  let themeIdx = 0
  let globalIdx = 0

  for (const catDef of CATEGORY_DEFS) {
    const variantsPerCategory = Math.ceil(200 / CATEGORY_DEFS.length)
    for (let i = 0; i < variantsPerCategory && themeIdx < THEMES.length; i++) {
      const theme = THEMES[themeIdx]
      // 选择变体：每个模板使用不同的页面结构
      const variant = (theme.serial - 1) % 4
      // 选择框架/配色/字体：使用全局序号扩大范围
      const fw = (theme.serial * 7 + i * 3) % 50
      const pal = (theme.serial * 3 + i * 5) % 16
      const font = (theme.serial + i) % 3
      // 图片基础索引：每个模板使用不同的起始图片
      const imgBase = globalIdx % 11
      // 构建页面（使用变体系统）
      const basePages = catDef.build(theme, imgBase)
      const pages = makeVariants(basePages, theme, imgBase, variant)
      // 生成模板定义
      templates.push({
        id: `${catDef.type}-${i}`,
        name: `${theme.company} ${catDef.name}`,
        zh: catDef.zh,
        a: `${theme.company} ${catDef.name}`,
        b: theme.tagline,
        cat: catDef.cat,
        format: '演示文稿',
        fw,
        pal,
        font,
        pageCount: pages.length,
        imgCount: 6,
        images: IMG_KEYS.map((_, k) => IMG[IMG_KEYS[(imgBase + k) % 11]]),
        pages,
        seed: theme.serial * 1000 + 7,
        serial: theme.serial,
      })
      themeIdx++
      globalIdx++
    }
  }

  return templates
}

export const GENERATED_PRESENTATION_TEMPLATES = generatePresentationTemplates()
