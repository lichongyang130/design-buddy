# UI typography

## Boundaries

Application chrome shares Inter Variable for Latin text and Noto Sans SC / TC / JP Variable for locale-specific Chinese and Japanese glyphs. The default UI uses 14px text; functional labels have a 12px floor. Page, section and card headings use 24px, 18px and 16px tokens. The home headline uses 40px, while editorial collection headings retain their larger display hierarchy. Code and JSON retain monospace fonts.

The 12 application surfaces, login, dynamic dialogs, inputs and native detail chrome share the policy. Original slides, documents, theme previews, inline SVG artwork and App case contents are excluded. In particular, an `/atelier/.../index.html` viewer is **not** treated as the application's root `index.html`.

## Implementation

- `public/ui/typography.css`: locale-aware local font faces, semantic type tokens, chrome-only overrides and wrapping fixes.
- `public/ui/typography.js`: read-only preference consumer; applies saved UI fonts and size on entry, same-page preference events and cross-tab storage events. It never writes user data or edits canvas content.
- `scripts/ui-typography.mjs`: Vite HTML integration and allowlisted PostCSS normalization of UI font declarations, including versioned CSS URLs. Original case CSS and authored theme/document selectors are excluded.
- `src/global-ui.js`: keeps the existing five size levels and font choices, but removes whole-body `zoom`. Only font dimensions change, not navigation widths, artwork or document geometry.
- `src/ui-language-bootstrap.js`: dispatches live preference updates after store notifications.
- Native detail chrome loads the same assets independently; its header accommodates larger text, retaining the existing 278px sidebar. Print and export content are not restyled by the shared screen-only UI rules.
- `public/sw.js`: network-first, exact-request caching includes `/ui/` assets. It does not delete unrelated or personal caches.

Mobile inputs have a 16px minimum. Long translated toolbars and tabs wrap instead of widening the whole page. An explicit user-selected serif or monospace UI face is still honored; changing UI preferences never changes the authored work font.

## Local fonts and licensing

Fontsource packages: `@fontsource-variable/inter@5.3.0` and `@fontsource-variable/noto-sans-{sc,tc,jp}@5.3.1`, obtained from the npm registry. Only normal-style variable WOFF2 subsets referenced by their `index.css` are vendored. All original Unicode ranges, variable weights, `font-display: swap` and SIL Open Font License notices are retained. Files are served locally, with no third-party font request at runtime.

The 340 WOFF2 files total 14,469,540 bytes **on disk**, not a single-page download: the browser requests only faces/ranges needed for the current language and glyphs. `public/ui/fonts/manifest.json` records each file's byte length and SHA-256. `sources.json` pins package versions, URLs and archive integrity. Existing App Sans assets are left intact for original case renderers.

## Validation

Run the built site on port 5174, then:

```sh
npm run test:ui-typography
node tests/verify-ui-language.mjs
node tests/verify-settings-real.mjs
node tests/verify-template-detail-shell.mjs
node tests/verify-detail-offline.mjs
```

Typography checks inspect computed sizes on 12 application pages, font-subset hashes, **actual rendered custom font names through Chromium's CSS protocol** for all four languages, size persistence without layout zoom, unchanged authored canvas HTML/fonts/intrinsic geometry, and twelve narrow-screen layouts at the largest saved text size. The native detail regression visits all 65 cases and exercises editing, page navigation and DOCX export. The original 248 pinned artifacts must retain their byte lengths and SHA-256 values.

The automated browser verifies Chromium. Safari, Windows and physical-phone visual checks remain separate cross-device follow-up work; they are not implied by these tests.

Legacy Song, Hei, Georgia and monospace choices remain OS-dependent font stacks. When an optional OS face is unavailable, the local CJK/default fallback is used; only the default Inter and Noto faces are vendored.
