import type { IconProps } from './icons/props.ts'

/** Compact Design Buddy app mark: a friendly D monogram with a spark. */
export function DesignBuddyMark({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="4" width="120" height="120" rx="34" fill="#1e2b4d" />
      <path d="M38 30h20c23 0 38 14 38 34S81 98 58 98H38V30Zm19 15v38h2c13 0 21-7 21-19s-8-19-21-19h-2Z" fill="#20c8b9" />
      <path d="m96 19 3.5 9.5L109 32l-9.5 3.5L96 45l-3.5-9.5L83 32l9.5-3.5L96 19Z" fill="#ffd166" />
    </svg>
  )
}

/** Text wordmark used in branded client surfaces. */
export function DesignBuddyWordmark({ size = 24, className }: IconProps) {
  return (
    <svg width={(size * 156) / 24} height={size} viewBox="0 0 156 24" className={className} aria-hidden="true">
      <text x="0" y="19" fill="currentColor" fontFamily="Inter, system-ui, sans-serif" fontSize="19" fontWeight="700" letterSpacing="-.5">Design Buddy</text>
    </svg>
  )
}
