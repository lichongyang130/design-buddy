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

  /* ---------- 设置侧栏分组 / 搜索 / 占位视图 ---------- */
  'group.settings': { zh: '设置', 'zh-TW': '設定', en: 'Settings', ja: '設定' },
  'group.features': { zh: '功能', 'zh-TW': '功能', en: 'Features', ja: '機能' },
  'group.data': { zh: '数据与安全', 'zh-TW': '資料與安全', en: 'Data & security', ja: 'データとセキュリティ' },
  'set.searchPh': { zh: '搜索设置项', 'zh-TW': '搜尋設定項', en: 'Search settings', ja: '設定を検索' },
  'ph.viewTitle': { zh: '「{label}」设置组', 'zh-TW': '「{label}」設定組', en: '{label} settings', ja: '{label}設定' },
  'ph.viewCopy': {
    zh: '该设置组正在建设中，稍后将在正式版本中开放。',
    'zh-TW': '該設定組正在建設中，稍後將在正式版本中開放。',
    en: 'This settings group is being built and will open in a future release.',
    ja: 'この設定グループは準備中です。今後のバージョンで利用可能になります。',
  },
  'ph.empty': {
    zh: '「{label}」暂无可配置项。', 'zh-TW': '「{label}」暫無可配置項。',
    en: 'No configurable items in {label} yet.', ja: '「{label}」には現在設定項目がありません。',
  },
  'ph.viewTitleStatic': { zh: '「外观」设置组', 'zh-TW': '「外觀」設定組', en: 'Appearance settings', ja: '外観設定' },
  'page.settings': { zh: '设置 — Design Buddy', 'zh-TW': '設定 — Design Buddy', en: 'Settings — Design Buddy', ja: '設定 — Design Buddy' },
  'aria.moduleNav': { zh: '模块导航', 'zh-TW': '模組導航', en: 'Main navigation', ja: 'モジュールナビ' },
  'aria.moreMenu': { zh: '更多功能', 'zh-TW': '更多功能', en: 'More menu', ja: 'その他メニュー' },
  'aria.settingsNav': { zh: '设置导航', 'zh-TW': '設定導航', en: 'Settings navigation', ja: '設定ナビ' },

  /* ---------- 常规视图：测试入口 / 字体 ---------- */
  'set.testLink': { zh: '测试链接 ↗', 'zh-TW': '測試連結 ↗', en: 'Test link ↗', ja: 'テストリンク ↗' },
  'set.fontPreview': {
    zh: 'Design Buddy 字体预览 Aa 字号', 'zh-TW': 'Design Buddy 字級預覽 Aa 字級',
    en: 'Design Buddy font preview Aa', ja: 'Design Buddy フォントプレビュー Aa',
  },
  'set.fontSlider': { zh: '字体大小', 'zh-TW': '字級大小', en: 'Font size', ja: '文字サイズ' },
  'font.tiny': { zh: '很小', 'zh-TW': '很小', en: 'XS', ja: '最小' },
  'font.small': { zh: '小', 'zh-TW': '小', en: 'S', ja: '小' },
  'font.normal': { zh: '默认', 'zh-TW': '預設', en: 'Default', ja: '標準' },
  'font.large': { zh: '大', 'zh-TW': '大', en: 'L', ja: '大' },
  'font.huge': { zh: '很大', 'zh-TW': '很大', en: 'XL', ja: '最大' },

  /* ---------- 三个枚举下拉的选项（存储值仍为中文枚举） ---------- */
  'opt.smartOpen': { zh: '智能打开', 'zh-TW': '智慧開啟', en: 'Smart open', ja: 'スマート' },
  'opt.inApp': { zh: '始终在应用内打开', 'zh-TW': '始終在應用內開啟', en: 'Always in-app', ja: '常にアプリ内' },
  'opt.browser': { zh: '始终在浏览器打开', 'zh-TW': '始終在瀏覽器開啟', en: 'Always in browser', ja: '常にブラウザ' },
  'opt.off': { zh: '关闭', 'zh-TW': '關閉', en: 'Off', ja: 'オフ' },
  'opt.alwaysAllow': { zh: '始终允许', 'zh-TW': '始終允許', en: 'Always allow', ja: '常に許可' },
  'opt.chargingOnly': { zh: '仅充电时允许', 'zh-TW': '僅充電時允許', en: 'While charging', ja: '充電中のみ許可' },
  'opt.direct': { zh: '直接连接', 'zh-TW': '直接連線', en: 'Direct connection', ja: '直接接続' },
  'opt.systemProxy': { zh: '系统代理', 'zh-TW': '系統代理', en: 'System proxy', ja: 'システムプロキシ' },
  'opt.customProxy': { zh: '自定义代理', 'zh-TW': '自訂代理', en: 'Custom proxy', ja: 'カスタムプロキシ' },

  /* ---------- 权限视图：测试按钮 / 状态 / 诚实提示 ---------- */
  'set.tryLock': { zh: '立即体验锁屏', 'zh-TW': '立即體驗鎖屏', en: 'Try the lock screen', ja: 'ロック画面を試す' },
  'set.testWakeLock': { zh: '测试唤醒锁', 'zh-TW': '測試喚醒鎖', en: 'Test wake lock', ja: '起動ロックをテスト' },
  'set.installPwa': { zh: '安装为桌面应用', 'zh-TW': '安裝為桌面應用', en: 'Install as desktop app', ja: 'デスクトップアプリをインストール' },
  'set.pwaInstalled': {
    zh: '已安装，打开桌面应用', 'zh-TW': '已安裝，開啟桌面應用',
    en: 'Installed — open desktop app', ja: 'インストール済み（アプリを開く）',
  },
  'set.testProxy': { zh: '测试连接', 'zh-TW': '測試連線', en: 'Test connection', ja: '接続テスト' },
  'state.untested': { zh: '未测试', 'zh-TW': '未測試', en: 'Untested', ja: '未テスト' },
  'state.detecting': { zh: '检测中…', 'zh-TW': '偵測中…', en: 'Detecting…', ja: '確認中…' },
  'state.testing': { zh: '测试中…', 'zh-TW': '測試中…', en: 'Testing…', ja: 'テスト中…' },
  'set.pwaHint': {
    zh: '浏览器无法直接修改系统登录项；安装为桌面应用后，可在系统设置中把它加入登录项，即获得等价的开机自启。',
    'zh-TW': '瀏覽器無法直接修改系統登入項；安裝為桌面應用後，可在系統設定中把它加入登入項，即獲得等價的開機自啟。',
    en: 'Browsers cannot change system login items directly. Install the desktop app, then add it to your login items in system settings for the same launch-at-login effect.',
    ja: 'ブラウザからシステムのログイン項目は直接変更できません。デスクトップアプリをインストールし、システム設定でログイン項目に追加すると、同等の自動起動が実現できます。',
  },

  /* ---------- 唤醒锁 / PWA / 代理 的运行状态 ---------- */
  'wake.unsupported': { zh: '当前浏览器不支持', 'zh-TW': '目前瀏覽器不支援', en: 'Not supported by this browser', ja: 'このブラウザは非対応' },
  'wake.disabled': { zh: '开关已关闭', 'zh-TW': '開關已關閉', en: 'Switch is off', ja: 'スイッチがオフ' },
  'wake.idle': { zh: '未激活', 'zh-TW': '未啟用', en: 'Inactive', ja: '未有効' },
  'wake.active': { zh: '已激活 · 屏幕保持唤醒', 'zh-TW': '已啟用 · 螢幕保持喚醒', en: 'Active · screen stays awake', ja: '有効 · スリープを防止中' },
  'wake.failed': { zh: '激活被拒绝', 'zh-TW': '啟用被拒絕', en: 'Activation denied', ja: '有効化が拒否されました' },
  'pwa.installed': { zh: '已安装为桌面应用', 'zh-TW': '已安裝為桌面應用', en: 'Installed as desktop app', ja: 'デスクトップアプリとしてインストール済み' },
  'pwa.installable': { zh: '可安装', 'zh-TW': '可安裝', en: 'Installable', ja: 'インストール可能' },
  'pwa.unsupported': { zh: '当前环境不可安装', 'zh-TW': '目前環境無法安裝', en: 'Cannot install in this environment', ja: 'この環境ではインストール不可' },
  'proxy.reason.empty': { zh: '请先填写代理地址', 'zh-TW': '請先填寫代理位址', en: 'Enter a proxy URL first', ja: 'プロキシ URL を先に入力してください' },
  'proxy.reason.bad-url': { zh: '代理地址格式不正确', 'zh-TW': '代理位址格式不正確', en: 'Invalid proxy URL format', ja: 'プロキシ URL の形式が正しくありません' },
  'proxy.reason.timeout': { zh: '连接超时（6 秒）', 'zh-TW': '連線逾時（6 秒）', en: 'Connection timed out (6s)', ja: '接続がタイムアウトしました（6秒）' },
  'proxy.reason.network': { zh: '无法连接到代理', 'zh-TW': '無法連線到代理', en: 'Cannot reach the proxy', ja: 'プロキシに接続できません' },
  'proxy.reason.fail': { zh: '连接失败', 'zh-TW': '連線失敗', en: 'Connection failed', ja: '接続に失敗しました' },
  'proxy.success': { zh: '连接成功 · {ms}ms · HTTP {status}', 'zh-TW': '連線成功 · {ms}ms · HTTP {status}', en: 'Connected · {ms}ms · HTTP {status}', ja: '接続成功 · {ms}ms · HTTP {status}' },

  /* ---------- 通用视图反馈 toast ---------- */
  'toast.saved': { zh: '已保存：{label} → {value}', 'zh-TW': '已儲存：{label} → {value}', en: 'Saved: {label} → {value}', ja: '保存しました：{label} → {value}' },
  'toast.font': { zh: '字体大小：{level}', 'zh-TW': '字級大小：{level}', en: 'Font size: {level}', ja: '文字サイズ：{level}' },
  'toast.settingSaved': { zh: '设置已保存', 'zh-TW': '設定已儲存', en: 'Setting saved', ja: '設定を保存しました' },
  'toast.wakeActive': { zh: '唤醒锁已激活，任务运行期间屏幕不会休眠', 'zh-TW': '喚醒鎖已啟用，任務執行期間螢幕不會休眠', en: 'Wake lock active — the screen stays on while tasks run', ja: '起動ロックが有効です。タスク実行中はスリープしません' },
  'toast.wakeUnsupported': { zh: '当前浏览器不支持 Screen Wake Lock API', 'zh-TW': '目前瀏覽器不支援 Screen Wake Lock API', en: 'This browser does not support the Screen Wake Lock API', ja: 'このブラウザは Screen Wake Lock API に非対応です' },
  'toast.wakeDisabled': { zh: '请先开启「运行时防止系统休眠」开关', 'zh-TW': '請先開啟「執行時防止系統休眠」開關', en: 'Turn on “Keep system awake” first', ja: '先に「システムのスリープを防止」をオンにしてください' },
  'toast.wakeFail': { zh: '唤醒锁激活失败：{detail}', 'zh-TW': '喚醒鎖啟用失敗：{detail}', en: 'Wake lock failed: {detail}', ja: '起動ロックの有効化に失敗：{detail}' },
  'toast.pwaDone': { zh: '已安装，可在系统设置中把 Design Buddy 加入登录项', 'zh-TW': '已安裝，可在系統設定中把 Design Buddy 加入登入項', en: 'Installed. Add Design Buddy to your login items in system settings.', ja: 'インストールしました。システム設定で Design Buddy をログイン項目に追加できます' },
  'toast.pwaAlready': { zh: '应用已安装，请从桌面或启动台打开', 'zh-TW': '應用已安裝，請從桌面或啟動台開啟', en: 'The app is already installed — open it from your desktop or launcher', ja: 'アプリはインストール済みです。デスクトップまたはランチャーから開いてください' },
  'toast.pwaNoEntry': { zh: '当前浏览器未提供安装入口，请使用浏览器菜单中的「安装应用」', 'zh-TW': '目前瀏覽器未提供安裝入口，請使用瀏覽器選單中的「安裝應用」', en: 'No install entry here — use “Install app” in the browser menu', ja: 'このブラウザにはインストール入口がありません。ブラウザメニューの「アプリをインストール」をご利用ください' },
  'toast.proxyOk': { zh: '代理连接正常（{ms}ms）', 'zh-TW': '代理連線正常（{ms}ms）', en: 'Proxy connection OK ({ms}ms)', ja: 'プロキシ接続正常（{ms}ms）' },
  'toast.switchOn': { zh: '{label}：开启', 'zh-TW': '{label}：開啟', en: '{label}: on', ja: '{label}：オン' },
  'toast.switchOff': { zh: '{label}：关闭', 'zh-TW': '{label}：關閉', en: '{label}: off', ja: '{label}：オフ' },

  /* ---------- 13 个动态设置组：通用词 / 个人主页 ---------- */
  'dy.common.delete': { zh: '删除', 'zh-TW': '刪除', en: 'Delete', ja: '削除' },
  'dy.common.added': { zh: '已添加', 'zh-TW': '已新增', en: 'Added', ja: '追加しました' },
  'dy.profile.nameTitle': { zh: '显示名称', 'zh-TW': '顯示名稱', en: 'Display name', ja: '表示名' },
  'dy.profile.nameDesc': { zh: '侧栏与头像旁展示的名字', 'zh-TW': '側欄與頭像旁展示的名字', en: 'Name shown in the sidebar and next to your avatar', ja: 'サイドバーとアバター横に表示する名前' },
  'dy.profile.initialsTitle': { zh: '头像缩写', 'zh-TW': '頭像縮寫', en: 'Avatar initials', ja: 'アバターのイニシャル' },
  'dy.profile.initialsDesc': { zh: '两字符以内', 'zh-TW': '兩字元以內', en: 'Up to two characters', ja: '2文字以内' },
  'dy.profile.bioTitle': { zh: '个人简介', 'zh-TW': '個人簡介', en: 'Bio', ja: '自己紹介' },

  /* ---------- 套餐与积分 ---------- */
  'dy.bill.planTitle': { zh: '当前套餐', 'zh-TW': '目前方案', en: 'Current plan', ja: '現在のプラン' },
  'dy.bill.planPro': { zh: 'Pro 已解锁全部模式', 'zh-TW': 'Pro 已解鎖全部模式', en: 'Pro — all modes unlocked', ja: 'Pro — 全モード解放済み' },
  'dy.bill.planFree': { zh: 'Free 计划，可随时升级', 'zh-TW': 'Free 計畫，可隨時升級', en: 'Free plan — upgrade anytime', ja: 'Freeプラン（いつでもアップグレード可）' },
  'dy.bill.creditsTitle': { zh: '剩余积分', 'zh-TW': '剩餘點數', en: 'Credits remaining', ja: '残クレジット' },
  'dy.bill.creditsDesc': { zh: '每次创作按模式消耗 1 / 3 / 8 积分', 'zh-TW': '每次創作按模式消耗 1 / 3 / 8 點數', en: 'Each creation costs 1 / 3 / 8 credits by mode', ja: '制作時はモードに応じて 1 / 3 / 8 クレジットを消費' },
  'dy.bill.gammaTitle': { zh: '已创建 Design Buddy', 'zh-TW': '已建立 Design Buddy', en: 'Design Buddy items created', ja: '作成した Design Buddy' },
  'dy.bill.gammaDesc': { zh: '共 {total} 个，垃圾箱 {trash} 个', 'zh-TW': '共 {total} 個，垃圾桶 {trash} 個', en: '{total} total, {trash} in trash', ja: '合計 {total} 件、ゴミ箱 {trash} 件' },
  'dy.bill.upgrade': { zh: '升级 / 充值', 'zh-TW': '升級 / 儲值', en: 'Upgrade / top up', ja: 'アップグレード / チャージ' },

  /* ---------- 外观 ---------- */
  'dy.app.themeTitle': { zh: '主题', 'zh-TW': '主題', en: 'Theme', ja: 'テーマ' },
  'dy.app.themeDesc': { zh: '与主题页的应用操作实时同步', 'zh-TW': '與主題頁的應用操作即時同步', en: 'Synced live with the Themes page', ja: 'テーマページの適用操作とリアルタイム同期' },
  'dy.app.densityTitle': { zh: '界面密度', 'zh-TW': '介面密度', en: 'Interface density', ja: 'UIの密度' },
  'dy.app.fontTitle': { zh: '字体', 'zh-TW': '字體', en: 'Font', ja: 'フォント' },
  'dy.app.imageModeTitle': { zh: '模板配图模式', 'zh-TW': '模板配圖模式', en: 'Template image mode', ja: 'テンプレート画像モード' },
  'dy.app.imageModeDesc': { zh: '绘本插画为默认；素材未就绪的页面自动回退经典 SVG，不会白屏', 'zh-TW': '繪本插畫為預設；素材未就緒的頁面自動回退經典 SVG，不會白屏', en: 'Illustration is default; pages without ready assets fall back to classic SVG, never a blank screen', ja: 'デフォルトは絵本イラスト。素材未準備のページはクラシック SVG に自動フォールバックし、白画面になりません' },
  'dy.app.reduceMotionTitle': { zh: '减弱动效', 'zh-TW': '減弱動效', en: 'Reduce motion', ja: 'モーションを減らす' },
  'dy.app.reduceMotionDesc': { zh: '降低弹窗与过渡动画强度', 'zh-TW': '降低彈窗與過渡動畫強度', en: 'Soften modals and transition animations', ja: 'モーダルと遷移アニメーションを抑えます' },
  'dy.app.themeSystem': { zh: '跟随系统默认', 'zh-TW': '跟隨系統預設', en: 'System default', ja: 'システム既定に従う' },
  'dy.app.customTheme': { zh: '自定义 · {name}', 'zh-TW': '自訂 · {name}', en: 'Custom · {name}', ja: 'カスタム · {name}' },
  'dy.opt.comfortable': { zh: '舒适', 'zh-TW': '舒適', en: 'Comfortable', ja: 'ゆったり' },
  'dy.opt.compact': { zh: '紧凑', 'zh-TW': '緊湊', en: 'Compact', ja: 'コンパクト' },
  'dy.opt.fontSystem': { zh: '系统默认', 'zh-TW': '系統預設', en: 'System default', ja: 'システム既定' },
  'dy.opt.fontSong': { zh: '宋体', 'zh-TW': '宋體', en: 'Song serif', ja: '明朝体' },
  'dy.opt.fontHei': { zh: '黑体', 'zh-TW': '黑體', en: 'Hei sans', ja: 'ゴシック体' },
  'dy.opt.fontGeorgia': { zh: 'Georgia 衬线', 'zh-TW': 'Georgia 襯線', en: 'Georgia serif', ja: 'Georgia セリフ' },
  'dy.opt.fontMono': { zh: '等宽字体', 'zh-TW': '等寬字體', en: 'Monospace', ja: '等幅フォント' },
  'dy.opt.illustration': { zh: '绘本插画', 'zh-TW': '繪本插畫', en: 'Illustration', ja: 'イラスト' },
  'dy.opt.photo': { zh: '真实照片', 'zh-TW': '真實照片', en: 'Photo', ja: '写真' },
  'dy.opt.svg': { zh: '经典 SVG', 'zh-TW': '經典 SVG', en: 'Classic SVG', ja: 'クラシック SVG' },

  /* ---------- 快捷键 ---------- */
  'dy.sk.search': { zh: '全局搜索', 'zh-TW': '全域搜尋', en: 'Global search', ja: '全体検索' },
  'dy.sk.newGamma': { zh: '新建 Design Buddy', 'zh-TW': '新建 Design Buddy', en: 'New Design Buddy', ja: '新規 Design Buddy' },
  'dy.sk.send': { zh: '发送提示词', 'zh-TW': '發送提示詞', en: 'Send prompt', ja: 'プロンプトを送信' },
  'dy.sk.upload': { zh: '上传媒体', 'zh-TW': '上傳媒體', en: 'Upload media', ja: 'メディアをアップロード' },
  'dy.sk.desc': { zh: '点击右侧按钮后按下新的组合键', 'zh-TW': '點擊右側按鈕後按下新的組合鍵', en: 'Click the button, then press the new key combination', ja: '右のボタンをクリックし、新しいショートカットキーを押してください' },
  'dy.sk.press': { zh: '请按下组合键…', 'zh-TW': '請按下組合鍵…', en: 'Press a key combination…', ja: 'キー組み合わせを押してください…' },
  'dy.sk.updated': { zh: '快捷键已更新', 'zh-TW': '快捷鍵已更新', en: 'Shortcut updated', ja: 'ショートカットを更新しました' },

  /* ---------- 个性化 ---------- */
  'dy.pers.smartTitle': { zh: '智能建议', 'zh-TW': '智慧建議', en: 'Smart suggestions', ja: 'スマート提案' },
  'dy.pers.smartDesc': { zh: '根据上下文主动给出创作建议', 'zh-TW': '根據上下文主動給出創作建議', en: 'Proactive suggestions based on context', ja: 'コンテキストに応じた作成提案' },
  'dy.pers.autoTitle': { zh: '自动命名', 'zh-TW': '自動命名', en: 'Auto naming', ja: '自動命名' },
  'dy.pers.autoDesc': { zh: '为新 Design Buddy 自动生成标题', 'zh-TW': '為新 Design Buddy 自動生成標題', en: 'Generate titles for new Design Buddy items automatically', ja: '新規 Design Buddy のタイトルを自動生成' },
  'dy.pers.weeklyTitle': { zh: '每周报告', 'zh-TW': '每週報告', en: 'Weekly report', ja: '週次レポート' },
  'dy.pers.weeklyDesc': { zh: '每周一汇总创作数据', 'zh-TW': '每週一彙總創作資料', en: 'Weekly summary of your creation data every Monday', ja: '毎週月曜に作成データを集計' },

  /* ---------- 记忆与进化 ---------- */
  'dy.mem.itemsTitle': { zh: '记忆条目', 'zh-TW': '記憶條目', en: 'Memory notes', ja: 'メモリー項目' },
  'dy.mem.itemsDesc': { zh: 'Buddy 在每次创作中遵循的长期偏好，可随时增删。', 'zh-TW': 'Buddy 在每次創作中遵循的長期偏好，可隨時增刪。', en: 'Long-term preferences Buddy follows in every creation. Add or remove anytime.', ja: 'Buddy が毎回の作成で従う長期的な偏好。いつでも追加・削除できます。' },
  'dy.mem.inputPh': { zh: '添加一条记忆，例如：输出避免使用 emoji', 'zh-TW': '新增一條記憶，例如：輸出避免使用 emoji', en: 'Add a note, e.g. avoid emoji in output', ja: 'メモリーを追加（例：出力で emoji を使わない）' },
  'dy.mem.add': { zh: '添加', 'zh-TW': '新增', en: 'Add', ja: '追加' },
  'dy.mem.emptyToast': { zh: '请输入记忆内容', 'zh-TW': '請輸入記憶內容', en: 'Enter a memory note first', ja: 'メモリー内容を入力してください' },
  'dy.mem.instTitle': { zh: '自定义指令', 'zh-TW': '自訂指令', en: 'Custom instructions', ja: 'カスタム指示' },

  /* ---------- 智能体 ---------- */
  'dy.ag.desc': { zh: '可在创作菜单中召唤的智能体', 'zh-TW': '可在創作選單中召喚的智能體', en: 'Agents you can summon from the creation menu', ja: '作成メニューから呼び出せるエージェント' },
  'dy.ag.add': { zh: '＋ 添加智能体', 'zh-TW': '＋ 新增智能體', en: '＋ Add agent', ja: '＋ エージェントを追加' },
  'dy.ag.confirmTitle': { zh: '删除智能体', 'zh-TW': '刪除智能體', en: 'Delete agent', ja: 'エージェントを削除' },
  'dy.ag.confirmMsg': { zh: '确定删除该智能体吗？', 'zh-TW': '確定刪除該智能體嗎？', en: 'Delete this agent?', ja: 'このエージェントを削除しますか？' },
  'dy.ag.promptName': { zh: '智能体名称', 'zh-TW': '智能體名稱', en: 'Agent name', ja: 'エージェント名' },

  /* ---------- 模型：白名单由 discover-models 脚本实测后写死 ---------- */
  'dy.mdl.availableDesc': {
    zh: '连通性实测通过，可用于创作', 'zh-TW': '連通性實測通過，可用於創作',
    en: 'Passed live connectivity test, ready for creation', ja: '接続テスト合格、創作に使用できます',
  },
  'dy.mdl.empty': {
    zh: '尚未发现可用模型。请在有网络的环境运行 npm run discover-models，系统会自动探测并写死可用模型列表。',
    'zh-TW': '尚未發現可用模型。請在有網路的環境執行 npm run discover-models，系統會自動探測並寫死可用模型列表。',
    en: 'No available models yet. Run npm run discover-models in a networked environment to probe and hardcode the model list automatically.',
    ja: '利用可能なモデルがまだありません。ネットワーク接続のある環境で npm run discover-models を実行すると、自動で検出して固定リストに書き出します。',
  },
  'dy.mdl.switched': { zh: '已切换到{model}', 'zh-TW': '已切換到{model}', en: 'Switched to {model}', ja: '{model} に切り替えました' },

  /* ---------- 助理（语音存储值仍为中文枚举） ---------- */
  'dy.asst.nameTitle': { zh: '助理名称', 'zh-TW': '助理名稱', en: 'Assistant name', ja: 'アシスタント名' },
  'dy.asst.voiceTitle': { zh: '语音', 'zh-TW': '語音', en: 'Voice', ja: '音声' },
  'dy.asst.voiceDesc': { zh: '用于语音播报与朗读', 'zh-TW': '用於語音播報與朗讀', en: 'Used for announcements and read-aloud', ja: '音声案内と読み上げに使用' },
  'dy.voice.warm': { zh: '温暖女声', 'zh-TW': '溫暖女聲', en: 'Warm female', ja: '温かい女性音声' },
  'dy.voice.calm': { zh: '沉稳男声', 'zh-TW': '沉穩男聲', en: 'Calm male', ja: '落ち着いた男性音声' },
  'dy.voice.clear': { zh: '清亮女声', 'zh-TW': '清亮女聲', en: 'Bright female', ja: '明るい女性音声' },
  'dy.voice.neutral': { zh: '中性合成音', 'zh-TW': '中性合成音', en: 'Neutral synth', ja: '中性的な合成音声' },

  /* ---------- 设备连接 ---------- */
  'dy.dev.current': { zh: '当前设备', 'zh-TW': '目前裝置', en: 'This device', ja: 'このデバイス' },
  'dy.dev.recent': { zh: '最近登录设备', 'zh-TW': '最近登入裝置', en: 'Recent device', ja: '最近ログインしたデバイス' },
  'dy.dev.local': { zh: '本机', 'zh-TW': '本機', en: 'Here', ja: 'この端末' },
  'dy.dev.remove': { zh: '移除', 'zh-TW': '移除', en: 'Remove', ja: '削除' },
  'dy.dev.removed': { zh: '设备已移除', 'zh-TW': '裝置已移除', en: 'Device removed', ja: 'デバイスを削除しました' },

  /* ---------- 数据管理 ---------- */
  'dy.data.exportTitle': { zh: '导出数据', 'zh-TW': '匯出資料', en: 'Export data', ja: 'データを書き出す' },
  'dy.data.exportDesc': { zh: '把全部工作区、Design Buddy、主题与设置下载为 JSON 文件', 'zh-TW': '把全部工作區、Design Buddy、主題與設定下載為 JSON 檔案', en: 'Download all workspaces, Design Buddy items, themes and settings as a JSON file', ja: 'すべてのワークスペース・Design Buddy・テーマ・設定を JSON ファイルとしてダウンロード' },
  'dy.data.exportBtn': { zh: '导出 JSON', 'zh-TW': '匯出 JSON', en: 'Export JSON', ja: 'JSONを書き出す' },
  'dy.data.importTitle': { zh: '导入数据', 'zh-TW': '匯入資料', en: 'Import data', ja: 'データを取り込む' },
  'dy.data.importDesc': { zh: '从之前导出的 JSON 恢复，将覆盖当前本地数据', 'zh-TW': '從之前匯出的 JSON 還原，將覆蓋目前本機資料', en: 'Restore from an exported JSON file; current local data will be overwritten', ja: '書き出した JSON から復元。現在のローカルデータは上書きされます' },
  'dy.data.importBtn': { zh: '选择文件导入', 'zh-TW': '選擇檔案匯入', en: 'Choose file to import', ja: '取り込むファイルを選択' },
  'dy.data.resetTitle': { zh: '重置应用', 'zh-TW': '重置應用', en: 'Reset app', ja: 'アプリをリセット' },
  'dy.data.resetDesc': { zh: '清空本地全部数据并恢复初始演示状态', 'zh-TW': '清空本機全部資料並還原初始示範狀態', en: 'Erase all local data and restore the initial demo state', ja: 'ローカルデータをすべて消去し、初期デモ状態に戻します' },
  'dy.data.resetBtn': { zh: '重置', 'zh-TW': '重置', en: 'Reset', ja: 'リセット' },
  'dy.data.exported': { zh: '数据已导出', 'zh-TW': '資料已匯出', en: 'Data exported', ja: 'データを書き出しました' },
  'dy.data.importOk': { zh: '导入成功，本地数据已恢复', 'zh-TW': '匯入成功，本機資料已還原', en: 'Import successful — local data restored', ja: '取り込み成功。ローカルデータを復元しました' },
  'dy.data.importFail': { zh: '导入失败：文件格式不正确', 'zh-TW': '匯入失敗：檔案格式不正確', en: 'Import failed: invalid file format', ja: '取り込み失敗：ファイル形式が正しくありません' },
  'dy.data.resetConfirmMsg': { zh: '将清空全部本地数据并恢复初始状态，确定继续吗？', 'zh-TW': '將清空全部本機資料並還原初始狀態，確定繼續嗎？', en: 'All local data will be erased and the initial state restored. Continue?', ja: 'すべてのローカルデータが消去され初期状態に戻ります。続けますか？' },
  'dy.data.resetConfirmBtn': { zh: '全部重置', 'zh-TW': '全部重置', en: 'Reset all', ja: 'すべてリセット' },

  /* ---------- 应用管理 ---------- */
  'dy.apps.desc': { zh: '在创作类型中显示该应用', 'zh-TW': '在創作類型中顯示該應用', en: 'Show this app in creation types', ja: '作成タイプにこのアプリを表示' },
  'dy.apps.add': { zh: '＋ 添加应用', 'zh-TW': '＋ 新增應用', en: '＋ Add app', ja: '＋ アプリを追加' },
  'dy.apps.promptName': { zh: '应用名称', 'zh-TW': '應用名稱', en: 'App name', ja: 'アプリ名' },

  /* ---------- 安全中心（会话超时存储值仍为中文枚举） ---------- */
  'dy.sec.twoFaTitle': { zh: '两步验证', 'zh-TW': '兩步驗證', en: 'Two-factor authentication', ja: '2要素認証' },
  'dy.sec.twoFaDesc': { zh: '登录新设备时要求额外验证码', 'zh-TW': '登入新裝置時要求額外驗證碼', en: 'Require an extra code when signing in on a new device', ja: '新しいデバイスでのログイン時に追加コードを要求' },
  'dy.sec.timeoutTitle': { zh: '会话超时', 'zh-TW': '會話逾時', en: 'Session timeout', ja: 'セッションタイムアウト' },
  'dy.sec.timeoutDesc': { zh: '无操作多久后自动锁定', 'zh-TW': '無操作多久後自動鎖定', en: 'Auto-lock after inactivity', ja: '操作しない状態が続くと自動ロック' },
  'dy.to.m15': { zh: '15 分钟', 'zh-TW': '15 分鐘', en: '15 minutes', ja: '15分' },
  'dy.to.m30': { zh: '30 分钟', 'zh-TW': '30 分鐘', en: '30 minutes', ja: '30分' },
  'dy.to.h1': { zh: '1 小时', 'zh-TW': '1 小時', en: '1 hour', ja: '1時間' },
  'dy.to.never': { zh: '永不', 'zh-TW': '永不', en: 'Never', ja: 'しない' },
}

/* 枚举下拉：存储值（中文枚举）→ 显示文案 token，保证逻辑与旧数据契约不变 */
export const SELECT_I18N = {
  linkOpen: { '智能打开': 'opt.smartOpen', '始终在应用内打开': 'opt.inApp', '始终在浏览器打开': 'opt.browser' },
  lockScreen: { '关闭': 'opt.off', '始终允许': 'opt.alwaysAllow', '仅充电时允许': 'opt.chargingOnly' },
  proxy: { '直接连接': 'opt.direct', '系统代理': 'opt.systemProxy', '自定义代理': 'opt.customProxy' },
}

export function optionLabel(kind, canonical, lang) {
  const token = SELECT_I18N[kind]?.[canonical]
  return token ? t(token, lang) : canonical
}

/* 动态设置组内的原生 select：按存储路径映射选项显示文案，存储值一律不动 */
export const DYN_SELECT_I18N = {
  'settings.appearance.density': { comfortable: 'dy.opt.comfortable', compact: 'dy.opt.compact' },
  'settings.fontFamily': {
    system: 'dy.opt.fontSystem', song: 'dy.opt.fontSong', hei: 'dy.opt.fontHei',
    georgia: 'dy.opt.fontGeorgia', mono: 'dy.opt.fontMono',
  },
  imageMode: { illustration: 'dy.opt.illustration', photo: 'dy.opt.photo', svg: 'dy.opt.svg' },
  'settings.assistant.voice': {
    温暖女声: 'dy.voice.warm', 沉稳男声: 'dy.voice.calm',
    清亮女声: 'dy.voice.clear', 中性合成音: 'dy.voice.neutral',
  },
  'settings.security.sessionTimeout': {
    '15 分钟': 'dy.to.m15', '30 分钟': 'dy.to.m30', '1 小时': 'dy.to.h1', 永不: 'dy.to.never',
  },
}

// 动态 select 选项翻译；无映射（如主题名等专有名称）时回退原始标签
export function dynOptionLabel(path, value, fallbackLabel, lang) {
  const token = DYN_SELECT_I18N[path]?.[value]
  return token ? t(token, lang) : fallbackLabel
}

export function t(token, lang) {
  const entry = DICT[token]
  if (!entry) return token
  const key = LANG_HTML[lang] ?? 'zh'
  return entry[key] ?? entry.zh ?? token
}

// 带变量的翻译：tt('ph.viewTitle', lang, { label: '外观' }) → 「外观」设置组
export function tt(token, lang, vars = {}) {
  return t(token, lang).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export function applyI18n(lang = '简体中文', root = document) {
  const htmlLang = LANG_HTML[lang] ?? 'zh-CN'
  if (root.documentElement) root.documentElement.lang = htmlLang
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    // 含子元素（如图标 + 文字）的节点不整体覆盖，翻译应挂在内部纯文本节点上
    if (el.children.length) return
    el.textContent = t(el.dataset.i18n, lang)
  })
  // 占位符与无障碍标签单独走属性，不覆盖文本
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh, lang)
  })
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria, lang))
  })
}
