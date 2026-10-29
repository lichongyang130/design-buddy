# Reference-led collection rebuild

## New user-authorised scope

On 2026-10-29 the user requested a new rebuild, not recovery of the missing prior binaries. Each case must now contain **28–35 pages and 15–20 independently generated main illustrations**. This replaces the earlier 28–40-page allowance. The attached kitchen image initially guided the first two cases: warm ivory, pale sage, delicate ink and soft watercolour. The subsequent latest instruction explicitly requires varied backgrounds, not this same pale palette throughout. From case three onward, vary environment, time of day, light and colour by theme while retaining fine-line watercolour quality. Preserve the first two cases unchanged. Each case must have a genuinely distinct framework. Preserve native gallery rail/sidebar/filter/workspace behaviour and existing user work storage.

Target remains 56 cases. Legacy bulk sources are retained, not used to populate the rebuilt gallery. Prior MEASURE/CORNER LIBRARY/FOOTFALL/AFTER HOURS originals remain unrecovered; this batch must not be described as recovery of those files.

## Actual progress

**Published: 2 / 56. Drafts: 1. Not started: 53. Authored pages including draft: 96. Actual independent main illustrations: 42 / 48 planned across these three cases. Missing primary art: 6, all in the third draft.**

PANTRY NOTES is a new 32-page kitchen-measurement learning journal. All 16 genuine primary illustrations are present. The final six show equal-group planning, comparison of observation notes, provenance review, method handoff, careful revision and a closing notebook still life. All 32 pages show their assigned primary illustration; no pending-art diagram remains. Repeated placements do not increase the independent primary-art count. The case is published after browser, offline, cache, export and real Office checks passed.

The framework is a specimen window, observation/method margin and reflection strip. Mobile uses full-width stacked art and readable prose, not a tiny desktop screenshot. Text and a private note save under a separate local key. Current HTML and JSON exports preserve edits; original PDF/PPTX do not change with browser edits. All numerical examples are fictional arithmetic, not readings from the illustrated scale/jug, cooking instructions, calibration, nutrition or safety advice.

Final PDF has 32 pages. Final PPTX has 32 slides with native editable text and all 16 primary raster illustrations. Historical `pantry-notes-preview.pdf` and `.pptx` URLs remain compatible; download filenames are `pantry-notes.pdf` and `.pptx`. Source ZIP opens directly with `file://`, includes all 16 illustrations and a bundled viewer, and can generate self-contained current HTML. Original PDF/PPTX are separate downloads, not duplicated in the source archive. File-origin storage can be unavailable; use exports to retain edits.

## OPEN SHELF — second case (published)

The second case contains 32 authored spatial concept boards, not a recoloured notebook. Its distinct structure combines a full-width proposal heading, responsibility strip, conceptual zoning map, watercolor scene, lower evidence/action columns and per-board local review marks. Native PPTX exports include editable zoning shapes and text; primary watercolor art remains raster. The diagram is not to scale and is not construction, accessibility, safety, privacy, procurement or operational approval.

All 16 independent warm-ivory/pale-sage illustrations are present. The final six show specialist-question review, unresolved planning notes, source review, private draft discussion, a bounded notebook handoff and a closing project still life. All 32 boards now use their assigned main illustration; no pending-art map remains. The case is published after all acceptance gates pass. Historical `open-shelf-preview.pdf`/`.pptx` paths remain compatible; download filenames omit `preview`. Local review values are open/revise/discuss/defer, not official approval, and are saved separately for each board under a separate case key. Edits, note and review marks survive current HTML/JSON export and direct-file offline use. Original PDF/PPTX remain unchanged by browser edits.

The resource model is fictional: 1,800 + 1,400 + 600 + 400 = 4,200 units; adding 800 gives 5,000. Staffing, venue costs, specialist review and other categories are explicitly not supplied. It is not a quote, real funding or a complete budget.

The gallery now reads the case registry rather than a hardcoded single case. Search, OR category filtering, name/date sort, recent views, collection, archive/restore and mobile sidebar operate across all three cases without modifying legacy personal-work storage. Production checks accept an honest draft but forbid publishing art-incomplete metadata.

## Reproduction and safeguards

Run from `design-buddy-home`:

- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 5174 --strictPort`
- `npm run build:pantry-notes` (uses `PANTRY_BASE_URL`, default `http://127.0.0.1:5174`)
- `npm run check:templates` verifies the new catalog, source counts, distinct actual JPEGs and SHA-256 asset manifest. Drafts may exist but cannot count as published. Missing/corrupt originals block production builds.
- `npm run build:open-shelf` and `npm run test:open-shelf` build and exercise the independent second case (`OPEN_SHELF_BASE_URL`, default port 5174).
- `npm run test:pantry-cache` verifies old-cache migration and all three actual offline case reloads.
- `npm run test:pantry-notes` exercises browser behaviour, per-page fit, editing, downloads, real touch and direct-file offline source.
- `npm run test:template-office` requires the optional LibreOffice kit at `.cache/office/node_modules/@deepseek-ai/libreoffice-kit/lib/index.js`, or `OFFICE_KIT_MODULE`; it runs real LibreOffice core, not Microsoft Office GUI.
- `npm run build` runs integrity checks before compiling.

The browser helper automatically extracts packaged Chromium runtime libraries into ignored `.cache/`. Source, primary JPEGs, export files and manifests must be in a verified Git checkpoint. Confirm the remote current-branch commit after pushing; do not rely only on a live process or the platform workspace snapshot. Old catalog and personal storage must not be deleted to make a clean-looking rebuild.

The service worker uses exact-request network-first caching, keeps unrelated caches, and never substitutes homepage HTML for a missing work/module. Versioned gallery and case modules prevent old unversioned caches from replacing new content.

## TIDELINE — third case (draft)

32 original portrait atlas pages use a masthead, live scoped metrics, full-colour coastal scene, abstract segment index, source chart and analyst question. This is neither the kitchen journal nor the landscape proposal board. Eight chapter palettes accompany ten independently generated scenes: blue sea, coral sunset, overcast harbour, forest green, red boats, sand-gold overlook, deep-teal interior, fog, coastal gardens and indigo night. Not all backgrounds are ivory or sage.

Only 10 of 16 primary illustrations exist. Pages 21–32 use explicit pending-art scope diagrams, which are not counted as primary illustrations. The case stays draft until the other six genuine artworks and full checks are completed. No extra art is claimed from repeated placements.

The deterministic source model has 240 invented entry-event rows: day totals 42/50/46/58/44, segment totals 70/80/90. These are not unique people, occupancy, weather, a real walking route or empirical evidence. Segment selection genuinely recalculates KPIs/charts, a 25-row paginated source ledger and selected CSV. Prose explicitly remains full-model teaching context. Scope, edits and a private note persist independently under `design-buddy-tideline-rebuild-v1`. Current HTML includes all 32 pages, actual selected charts and embedded artwork; JSON records scope/edits. Original full-model PDF/PPTX are unchanged by edits.

`npm run build:tideline` uses `TIDELINE_BASE_URL` (default port 5174), generates the 32-page PDF, native-text/shape 32-slide PPTX, full CSV/JSON, cover/inside, SHA manifest and offline source ZIP. `npm run test:tideline` exercises ten groups, including mobile, exact scoped CSV and direct-file offline exports. Source ZIP includes all ten actual JPEGs, not duplicate original PDF/PPTX.

## Verification and next steps

PANTRY NOTES passes eight browser groups, OPEN SHELF nine, TIDELINE ten and old-worker/offline regression six. Real LibreOffice renders each of the three native-text PPTX files to 32 pages. Registry v5/SW v5 bypass stale v4 gallery modules without deleting personal storage or unrelated caches. Production integrity accepts the honest third draft but does not count it as published.

Next: finish TIDELINE's six missing independent illustrations with varied environments and colours, then rebuild and rerun checks. There are 53 cases not started. Each case still needs 28–35 pages, 15–20 independent main illustrations and its own framework. Reused placements, diagrams and incomplete drafts must not be reported as completed cases. Preserve verified GitHub checkpoints with actual artwork, source and reproducible exports.

The existing history already on this same remote branch is merged without replacing the rebuilt template page with its legacy catalog. Those historical sources are retained; they are not counted as new completed cases.

Export PDFs/PPTX/source archives currently remain in Git as requested deliverables. Before broad expansion, plan artifact generation/storage rather than duplicating these binaries indefinitely; preserve primary art and reproducibility and respect the workspace snapshot size limit.
