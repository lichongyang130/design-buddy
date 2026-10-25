/* ============================================================
   真实界面国际化（设置 → 通用 → 语言 消费层）
   - 四种语言：简体中文（默认）/ 繁體中文 / English / 日本語
   - 页面中带 data-i18n="token" 的元素文本由本模块统一替换
   - 字典按 token 维护，缺词回退简体中文，保证不会出现空白
   ============================================================ */

export const LANG_HTML = {
  简体中文: 'zh-CN',
  繁體中文: 'zh-TW',
  English: 'en',
  日本語: 'ja',
}

const DICT = {
  /* ---------- 五页共享导航 rail ---------- */
  'rail.home': { zh: '首页', 'zh-TW': '首頁', en: 'Home', ja: 'ホーム' },
  'rail.media': { zh: '媒体', 'zh-TW': '媒體', en: 'Media', ja: 'メディア' },
  'rail.templates': { zh: '模板', 'zh-TW': '範本', en: 'Templates', ja: 'テンプレート' },
  'rail.themes': { zh: '主题', 'zh-TW': '主題', en: 'Themes', ja: 'テーマ' },
  'rail.settings': { zh: '设置', 'zh-TW': '設定', en: 'Settings', ja: '設定' },
  'rail.more': { zh: '更多', 'zh-TW': '更多', en: 'More', ja: 'その他' },
  'menu.skills': { zh: '技能', 'zh-TW': '技能', en: 'Skills', ja: 'スキル' },
  'menu.experts': { zh: '专家', 'zh-TW': '專家', en: 'Experts', ja: 'エキスパート' },
  'menu.connectors': { zh: '连接器', 'zh-TW': '連接器', en: 'Connectors', ja: '連携サービス' },

  /* ---------- 设置页侧栏 14 组 ---------- */
  'nav.general': { zh: '通用', 'zh-TW': '通用', en: 'General', ja: '一般' },
  'nav.profile': { zh: '个人主页', 'zh-TW': '個人主頁', en: 'Profile', ja: 'プロフィール' },
  'nav.billing': { zh: '套餐与积分', 'zh-TW': '套餐與積分', en: 'Plan & credits', ja: 'プラン' },
  'nav.appearance': { zh: '外观', 'zh-TW': '外觀', en: 'Appearance', ja: '外観' },
  'nav.shortcuts': { zh: '快捷键', 'zh-TW': '快捷鍵', en: 'Shortcuts', ja: 'ショートカット' },
  'nav.personalize': { zh: '个性化', 'zh-TW': '個人化', en: 'Personalization', ja: '個人設定' },
  'nav.memory': { zh: '记忆与进化', 'zh-TW': '記憶與進化', en: 'Memory', ja: 'メモリー' },
  'nav.agents': { zh: '智能体', 'zh-TW': '智能體', en: 'Agents', ja: 'エージェント' },
  'nav.models': { zh: '模型', 'zh-TW': '模型', en: 'Models', ja: 'モデル' },
  'nav.assistant': { zh: '助理', 'zh-TW': '助理', en: 'Assistant', ja: 'アシスタント' },
  'nav.devices': { zh: '设备连接', 'zh-TW': '裝置連接', en: 'Devices', ja: 'デバイス' },
  'nav.data': { zh: '数据管理', 'zh-TW': '資料管理', en: 'Data', ja: 'データ' },
  'nav.apps': { zh: '应用管理', 'zh-TW': '應用管理', en: 'Apps', ja: 'アプリ' },
  'nav.security': { zh: '安全中心', 'zh-TW': '安全中心', en: 'Security', ja: 'セキュリティ' },

  /* ---------- 通用视图：分区标题 ---------- */
  'sec.regular': { zh: '常规', 'zh-TW': '常規', en: 'General', ja: '一般' },
  'sec.permission': { zh: '权限', 'zh-TW': '權限', en: 'Permissions', ja: '権限' },

  /* ---------- 通用视图：九行设置 ---------- */
  'set.language': { zh: '语言', 'zh-TW': '語言', en: 'Language', ja: '言語' },
  'set.linkOpen': { zh: '链接打开方式', 'zh-TW': '連結開啟方式', en: 'Link opening', ja: 'リンクの開き方' },
  'set.linkOpenDesc': {
    zh: '设置 Design Buddy 对话中链接的默认打开策略。',
    'zh-TW': '設定 Design Buddy 對話中連結的預設開啟策略。',
    en: 'Choose how links in Design Buddy conversations open.',
    ja: 'Design Buddy の会話内リンクの既定の開き方を設定します。',
  },
  'set.fontSize': { zh: '字体大小', 'zh-TW': '字級大小', en: 'Font size', ja: '文字サイズ' },
  'set.lockScreen': { zh: '允许锁屏运行', 'zh-TW': '允許鎖屏執行', en: 'Run while locked', ja: 'ロック画面での実行' },
  'set.lockScreenDesc': {
    zh: '选择锁屏后的运行方式，保障远程控制与后台 Agent 任务持续执行。',
    'zh-TW': '選擇鎖屏後的執行方式，保障遠端控制與背景 Agent 任務持續執行。',
    en: 'Control whether remote and background Agent jobs keep running after the screen locks.',
    ja: '画面ロック後のリモート操作とバックグラウンド Agent タスクの実行方法を選びます。',
  },
  'set.keepAwake': { zh: '运行时防止系统休眠', 'zh-TW': '執行時防止系統休眠', en: 'Keep system awake', ja: 'システムのスリープを防止' },
  'set.keepAwakeDesc': {
    zh: '在 Design Buddy 运行任务时，让电脑保持唤醒状态。',
    'zh-TW': '在 Design Buddy 執行任務時，讓電腦保持喚醒狀態。',
    en: 'Keep the computer awake while Design Buddy runs tasks.',
    ja: 'Design Buddy がタスクを実行中、PC をスリープさせません。',
  },
  'set.autoStart': { zh: '开机自动启动', 'zh-TW': '開機自動啟動', en: 'Launch at login', ja: 'ログイン時に自動起動' },
  'set.autoStartDesc': {
    zh: '开启后 Design Buddy 会在你登录电脑后自动启动。',
    'zh-TW': '開啟後 Design Buddy 會在你登入電腦後自動啟動。',
    en: 'Launch Design Buddy automatically after you sign in.',
    ja: 'サインイン後に Design Buddy を自動で起動します。',
  },
  'set.proxy': { zh: '网络代理', 'zh-TW': '網路代理', en: 'Network proxy', ja: 'ネットワークプロキシ' },
  'set.proxyDesc': {
    zh: '网络异常时可切换连接方式，修改后立即生效',
    'zh-TW': '網路異常時可切換連線方式，修改後立即生效',
    en: 'Switch connection mode when the network is unstable. Changes apply instantly.',
    ja: 'ネットワーク異常時に接続方法を切り替えられます。変更は即時反映されます。',
  },
  'set.trustedSkills': { zh: '自动安装可信技能', 'zh-TW': '自動安裝可信技能', en: 'Auto-install trusted skills', ja: '信頼スキルの自動インストール' },
  'set.trustedSkillsDesc': {
    zh: '安全检测通过后自动安装，高风险项始终要求手动确认。',
    'zh-TW': '安全檢測通過後自動安裝，高風險項目一律要求手動確認。',
    en: 'Trusted skills install automatically; high-risk items always require manual confirmation.',
    ja: '安全チェック通過後は自動インストール。高リスク項目は常に手動確認が必要です。',
  },
  'set.skillAutoUpdate': { zh: '技能自动更新', 'zh-TW': '技能自動更新', en: 'Skill auto-update', ja: 'スキルの自動更新' },
  'set.skillAutoUpdateDesc': {
    zh: '有新版本时在空闲时段自动更新已安装的技能。',
    'zh-TW': '有新版本時在空閒時段自動更新已安裝的技能。',
    en: 'Update installed skills automatically during idle time.',
    ja: '新バージョンをアイドル時間に自動更新します。',
  },
}

export function t(token, lang) {
  const entry = DICT[token]
  if (!entry) return token
  const key = LANG_HTML[lang] ?? 'zh'
  return entry[key] ?? entry.zh ?? token
}

export function applyI18n(lang = '简体中文', root = document) {
  const htmlLang = LANG_HTML[lang] ?? 'zh-CN'
  if (root.documentElement) root.documentElement.lang = htmlLang
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang)
  })
}
