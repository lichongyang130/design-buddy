/* ============================================================
   DesignBuddy 演示文稿缩略图卡通人物
   8 种卡通角色 SVG，按类别分配
   ============================================================ */

function character(bodyColor, hairColor, backAccessory, frontAccessory) {
  return `<svg viewBox="0 0 100 120" class="tc-cartoon" xmlns="http://www.w3.org/2000/svg" fill="none">
    ${backAccessory || ''}
    <path d="M28 62 Q28 100 50 112 Q72 100 72 62 Z" fill="${bodyColor}"/>
    <circle cx="50" cy="36" r="18" fill="#F5D5B8"/>
    <path d="M32 32 Q32 14 50 14 Q68 14 68 32 Q64 20 50 18 Q36 20 32 32Z" fill="${hairColor}"/>
    <circle cx="43" cy="36" r="2.8" fill="#333"/>
    <circle cx="57" cy="36" r="2.8" fill="#333"/>
    <path d="M43 44 Q50 49 57 44" stroke="#333" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="38" cy="42" r="3" fill="#FFAB91" opacity="0.45"/>
    <circle cx="62" cy="42" r="3" fill="#FFAB91" opacity="0.45"/>
    ${frontAccessory || ''}
  </svg>`
}

const ACC = {
  // 麦克风
  mic: `<g>
    <path d="M70 70 Q76 64 79 54" stroke="#4A90D9" stroke-width="6" stroke-linecap="round" fill="none"/>
    <rect x="76" y="38" width="14" height="20" rx="3" fill="#666"/>
    <circle cx="83" cy="36" r="6" fill="#999"/>
  </g>`,
  // 笔记本电脑
  laptop: `<g>
    <rect x="26" y="68" width="40" height="24" rx="2" fill="#333"/>
    <rect x="29" y="71" width="34" height="17" rx="1" fill="#4FC3F7"/>
    <rect x="20" y="92" width="52" height="4" rx="2" fill="#555"/>
  </g>`,
  // 眼镜 + 图表
  glassesChart: `<g>
    <circle cx="43" cy="36" r="5" stroke="#333" stroke-width="1.5" fill="none"/>
    <circle cx="57" cy="36" r="5" stroke="#333" stroke-width="1.5" fill="none"/>
    <line x1="48" y1="36" x2="52" y2="36" stroke="#333" stroke-width="1.5"/>
    <rect x="28" y="68" width="38" height="22" rx="2" fill="#fff"/>
    <rect x="33" y="80" width="6" height="7" fill="#10B981"/>
    <rect x="42" y="76" width="6" height="11" fill="#10B981"/>
    <rect x="51" y="72" width="6" height="15" fill="#10B981"/>
  </g>`,
  // 灯泡 + 举手
  lightbulb: `<g>
    <circle cx="50" cy="6" r="7" fill="#FCD34D"/>
    <path d="M46 13 L54 13 L53 18 L47 18 Z" fill="#F59E0B"/>
    <line x1="48" y1="20" x2="48" y2="23" stroke="#999" stroke-width="2"/>
    <line x1="52" y1="20" x2="52" y2="23" stroke="#999" stroke-width="2"/>
    <line x1="50" y1="-1" x2="50" y2="-4" stroke="#FCD34D" stroke-width="2"/>
    <line x1="36" y1="6" x2="33" y2="6" stroke="#FCD34D" stroke-width="2"/>
    <line x1="64" y1="6" x2="67" y2="6" stroke="#FCD34D" stroke-width="2"/>
    <line x1="40" y1="0" x2="38" y2="-2" stroke="#FCD34D" stroke-width="2"/>
    <line x1="60" y1="0" x2="62" y2="-2" stroke="#FCD34D" stroke-width="2"/>
    <path d="M28 66 Q20 53 26 43" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M72 66 Q80 53 74 43" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" fill="none"/>
  </g>`,
  // 火箭 + 星星
  rocket: `<g>
    <path d="M62 22 Q76 22 79 38 L72 52 Q67 45 62 45 Z" fill="#fff"/>
    <circle cx="70" cy="29" r="4" fill="#4FC3F7"/>
    <path d="M65 45 L58 58 L65 50 Z" fill="#EF4444"/>
    <path d="M70 45 L77 55 L70 50 Z" fill="#F59E0B"/>
    <circle cx="22" cy="12" r="1.5" fill="#fff"/>
    <circle cx="86" cy="18" r="1.5" fill="#fff"/>
    <circle cx="18" cy="32" r="1" fill="#fff"/>
    <circle cx="90" cy="38" r="1" fill="#fff"/>
    <circle cx="30" cy="8" r="1" fill="#fff"/>
  </g>`,
  // 学士帽 + 书本
  gradCap: `<g>
    <path d="M28 20 L72 20 L56 31 L44 31 Z" fill="#333"/>
    <line x1="63" y1="25" x2="72" y2="33" stroke="#333" stroke-width="2"/>
    <circle cx="72" cy="34" r="3" fill="#FCD34D"/>
    <rect x="26" y="56" width="36" height="22" rx="2" fill="#8B4513"/>
    <rect x="28" y="58" width="16" height="18" fill="#FBF3E0"/>
    <line x1="31" y1="63" x2="42" y2="63" stroke="#8B4513" stroke-width="1"/>
    <line x1="31" y1="67" x2="42" y2="67" stroke="#8B4513" stroke-width="1"/>
    <line x1="44" y1="58" x2="54" y2="58" stroke="#8B4513" stroke-width="1"/>
    <line x1="44" y1="63" x2="54" y2="63" stroke="#8B4513" stroke-width="1"/>
  </g>`,
  // 星星徽章 + 领带
  starBadge: `<g>
    <path d="M50 62 L55 68 L55 78 L50 82 L45 78 L45 68 Z" fill="#FCD34D"/>
    <path d="M50 6 L53 14 L62 14 L55 20 L58 29 L50 23 L42 29 L45 20 L38 14 L47 14 Z" fill="#FCD34D"/>
  </g>`,
  // 调色板
  palette: `<g>
    <ellipse cx="50" cy="72" rx="18" ry="12" fill="#fff"/>
    <circle cx="40" cy="68" r="4" fill="#EF4444"/>
    <circle cx="50" cy="65" r="4" fill="#3B82F6"/>
    <circle cx="60" cy="68" r="4" fill="#10B981"/>
    <circle cx="45" cy="76" r="4" fill="#F59E0B"/>
    <circle cx="55" cy="76" r="4" fill="#EC4899"/>
    <circle cx="65" cy="80" r="3" fill="#EC4899"/>
  </g>`,
}

export const CARTOON_CHARACTERS = [
  { name: 'presenter', svg: character('#4A90D9', '#3D2817', null, ACC.mic) },
  { name: 'techie', svg: character('#8B5CF6', '#2D1B0E', null, ACC.laptop) },
  { name: 'analyst', svg: character('#10B981', '#3D2817', null, ACC.glassesChart) },
  { name: 'creator', svg: character('#F59E0B', '#8B4513', null, ACC.lightbulb) },
  { name: 'innovator', svg: character('#EF4444', '#3D2817', ACC.rocket, null) },
  { name: 'scholar', svg: character('#0D9488', '#3D2817', null, ACC.gradCap) },
  { name: 'leader', svg: character('#1E3A5F', '#3D2817', null, ACC.starBadge) },
  { name: 'designer', svg: character('#EC4899', '#3D2817', null, ACC.palette) },
]

const CAT_CHARACTERS = {
  '融资演讲稿': ['presenter', 'techie'],
  '报告': ['analyst'],
  '品牌设计': ['designer'],
  '商业规划': ['innovator', 'leader'],
  '营销材料': ['creator'],
  '教育': ['scholar'],
}

export function getCartoonForCategory(cat, serial) {
  const names = CAT_CHARACTERS[cat] || ['techie']
  const idx = (serial || 0) % names.length
  return CARTOON_CHARACTERS[names.indexOf(names[idx])] || CARTOON_CHARACTERS[0]
}
