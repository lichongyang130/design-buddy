import { DesignBuddyMark, DesignBuddyWordmark } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/** Design Buddy mark rendered in the host sidebar slot. */
export function OfficialBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <DesignBuddyMark size={size} />
}

/** Design Buddy wordmark rendered independently from its mark. */
export function OfficialBrandName() {
  return <DesignBuddyWordmark size={20} />
}
