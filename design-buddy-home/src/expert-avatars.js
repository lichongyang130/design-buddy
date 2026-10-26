/* ============================================================
   专家头像（西方动画电影式 3D 角色肖像，本地 webp，无外链）
   - 文件在 public/avatars/<专家 id>.webp，256×256，单张 < 10KB
   - 目录里还没有头像的专家返回空字符串，界面回退到「首字 + 渐变底」
   - 名字索引用于首页「+」菜单里的专家子列表（那里的数据按名字存）
   ============================================================ */

import { EXPERT_CATALOG } from './experts-catalog.js'

export const EXPERT_AVATARS = {
  'ec-mentor': '/avatars/ec-mentor.webp',
  'ec-senior-dev': '/avatars/ec-senior-dev.webp',
  'ec-miniprogram': '/avatars/ec-miniprogram.webp',
  'ec-fullstack': '/avatars/ec-fullstack.webp',
  'ec-opc': '/avatars/ec-opc.webp',
  'ec-news': '/avatars/ec-news.webp',
  'ec-firmware': '/avatars/ec-firmware.webp',
  'ec-python': '/avatars/ec-python.webp',
  'ec-partner': '/avatars/ec-partner.webp',
  'ec-workbench': '/avatars/ec-workbench.webp',
}

const BY_NAME = Object.fromEntries(
  EXPERT_CATALOG.filter((e) => EXPERT_AVATARS[e.id]).map((e) => [e.name, EXPERT_AVATARS[e.id]]),
)

/** 按目录条目取头像地址；没有头像返回 '' */
export const expertAvatar = (entry) => (entry?.id ? EXPERT_AVATARS[entry.id] ?? '' : '')

/** 按专家名取头像地址（首页子菜单用） */
export const expertAvatarByName = (name) => BY_NAME[name] ?? ''

/**
 * 头像 HTML：有肖像用 <img>，没有就保留原来的「首字 + 渐变底」。
 * className 里放尺寸/圆角等上下文样式，photo 标记交给 CSS 收掉渐变与首字。
 */
export const avatarHTML = (entry, { color = '', className = 'expert-avatar', alt = '' } = {}) => {
  const src = expertAvatar(entry)
  if (!src) return `<span class="${className} ${color}">${(entry?.name ?? '?')[0]}</span>`
  return `<span class="${className} has-photo ${color}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></span>`
}
