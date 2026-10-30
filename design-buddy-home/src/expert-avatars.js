/* ============================================================
   专家头像（西方动画电影式 3D 角色肖像，本地 webp，无外链）
   - 文件在 public/avatars/<专家 id>.webp，256×256，单张约 10KB 级
   - 目录里还没有头像的专家返回空字符串，界面回退到「首字 + 渐变底」
   - 名字索引用于首页「+」菜单里的专家子列表（那里的数据按名字存）
   ============================================================ */

import { EXPERT_CATALOG } from './experts-catalog.js'

export const EXPERT_AVATARS = {
  'ec-manager': '/avatars/ec-manager.webp',
  'ec-office-admin': '/avatars/ec-office-admin.webp',
  'ec-automation': '/avatars/ec-automation.webp',
  'ec-research': '/avatars/ec-research.webp',
  'ec-ppt': '/avatars/ec-ppt.webp',
  'ec-doc': '/avatars/ec-doc.webp',
  'ec-content': '/avatars/ec-content.webp',
  'ec-visual': '/avatars/ec-visual.webp',
  'ec-ai-image': '/avatars/ec-ai-image.webp',
  'ec-brand': '/avatars/ec-brand.webp',
  'ec-qa': '/avatars/ec-qa.webp',
  'ec-web-prototype': '/avatars/ec-web-prototype.webp',
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
