# Reference-led collection rebuild

## New user-authorised scope

On 2026-10-29 the user requested a new rebuild, not recovery of the missing prior binaries. Each case must now contain **28–35 pages and 15–20 independently generated main illustrations**. This replaces the earlier 28–40-page allowance. The latest attached kitchen image is the background/style reference: warm ivory paper, pale sage surroundings, delicate ink contours and soft natural watercolour. It supersedes the prior dark-background direction for this new batch. Each case must have a genuinely distinct framework. Preserve native gallery rail/sidebar/filter/workspace behaviour and existing user work storage.

Target remains 56 cases. Legacy bulk sources are retained, not used to populate the rebuilt gallery. Prior MEASURE/CORNER LIBRARY/FOOTFALL/AFTER HOURS originals remain unrecovered; this batch must not be described as recovery of those files.

## Actual progress

**Published: 1 / 56. Drafts: 0. Not started: 55. Authored pages: 32. Independent primary illustrations: 16. Missing primary art: 0.**

PANTRY NOTES is a new 32-page kitchen-measurement learning journal. All 16 genuine primary illustrations are present. The final six show equal-group planning, comparison of observation notes, provenance review, method handoff, careful revision and a closing notebook still life. All 32 pages show their assigned primary illustration; no pending-art diagram remains. Repeated placements do not increase the independent primary-art count. The case is published after browser, offline, cache, export and real Office checks passed.

The framework is a specimen window, observation/method margin and reflection strip. Mobile uses full-width stacked art and readable prose, not a tiny desktop screenshot. Text and a private note save under a separate local key. Current HTML and JSON exports preserve edits; original PDF/PPTX do not change with browser edits. All numerical examples are fictional arithmetic, not readings from the illustrated scale/jug, cooking instructions, calibration, nutrition or safety advice.

Final PDF has 32 pages. Final PPTX has 32 slides with native editable text and all 16 primary raster illustrations. Historical `pantry-notes-preview.pdf` and `.pptx` URLs remain compatible; download filenames are `pantry-notes.pdf` and `.pptx`. Source ZIP opens directly with `file://`, includes all 16 illustrations and a bundled viewer, and can generate self-contained current HTML. Original PDF/PPTX are separate downloads, not duplicated in the source archive. File-origin storage can be unavailable; use exports to retain edits.

## Reproduction and safeguards

Run from `design-buddy-home`:

- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 5174 --strictPort`
- `npm run build:pantry-notes` (uses `PANTRY_BASE_URL`, default `http://127.0.0.1:5174`)
- `npm run check:templates` verifies the new catalog, source counts, distinct actual JPEGs and SHA-256 asset manifest. Drafts may exist but cannot count as published. Missing/corrupt originals block production builds.
- `npm run test:pantry-notes` exercises browser behaviour, per-page fit, editing, downloads, real touch and direct-file offline source.
- `npm run test:template-office` requires the optional LibreOffice kit at `.cache/office/node_modules/@deepseek-ai/libreoffice-kit/lib/index.js`, or `OFFICE_KIT_MODULE`; it runs real LibreOffice core, not Microsoft Office GUI.
- `npm run build` runs integrity checks before compiling.

The browser helper automatically extracts packaged Chromium runtime libraries into ignored `.cache/`. Source, primary JPEGs, export files and manifests must be in a verified Git checkpoint. Confirm the remote current-branch commit after pushing; do not rely only on a live process or the platform workspace snapshot. Old catalog and personal storage must not be deleted to make a clean-looking rebuild.

The service worker uses exact-request network-first caching, keeps unrelated caches, and never substitutes homepage HTML for a missing work/module. Versioned gallery and case modules prevent old unversioned caches from replacing new content.

## Next

Author a genuinely different second case, not a renamed copy of the notebook framework. Continue the latest reference-led ivory/sage fine-line watercolour backgrounds. Each case must contain 28–35 pages and 15–20 independent main illustrations before publication. The remaining 55 cases are not authored. Maintain a verified Git/remote checkpoint including original art and reproducible export sources.

## Published case verification

Eight browser acceptance groups pass; four old-worker/offline checks pass. Real LibreOffice renders the final native-text PPTX to 32 pages. Production build passes integrity checks, and all 28 files in the new `public/atelier` tree match their production copies byte-for-byte. All 16 primary illustrations meet the art gate. The v2 viewer/gallery bypass poisoned v1 draft modules, and the final illustration loads correctly on an offline reload. Regenerable Office/browser evidence is in ignored `.cache/pantry-notes/` and can be regenerated.

The existing history already on this same remote branch is merged without replacing the rebuilt template page with its legacy catalog. Those historical sources are retained; they are not counted as new completed cases.

Export PDFs/PPTX/source archives currently remain in Git as requested deliverables. Before broad expansion, plan artifact generation/storage rather than duplicating these binaries indefinitely; preserve primary art and reproducibility and respect the workspace snapshot size limit.
