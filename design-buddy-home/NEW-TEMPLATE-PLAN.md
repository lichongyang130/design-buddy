# Reference-led collection rebuild

## New user-authorised scope

On 2026-10-29 the user requested a new rebuild, not recovery of the missing prior binaries. Presentation cases must contain **28–35 pages and 15–20 independently generated main illustrations**. The subsequent document-specific instruction requires **at least 10 pages and at least 5 independent images per document case**; it does not lower the presentation requirements. This replaces the earlier 28–40-page allowance. The attached kitchen image initially guided the first two cases: warm ivory, pale sage, delicate ink and soft watercolour. The subsequent latest instruction explicitly requires varied backgrounds, not this same pale palette throughout. From case three onward, vary environment, time of day, light and colour by theme while retaining fine-line watercolour quality. Preserve the first two cases unchanged. Each case must have a genuinely distinct framework. Preserve native gallery rail/sidebar/filter/workspace behaviour and existing user work storage.

The original target was 56 cases. The latest request adds 50 documents to the existing 15 cases, so the current catalog target is 65 cases; do not fold the previous nine into the 50. Legacy bulk sources are retained, not used to populate the rebuilt gallery. Prior MEASURE/CORNER LIBRARY/FOOTFALL/AFTER HOURS originals remain unrecovered; this batch must not be described as recovery of those files.

## Actual progress

**Published: 32 / 65 (four presentations and twenty-eight documents). Drafts: 1 SWATCH presentation. Not started: 32. Authored pages including draft: 436. Additional-50 request: 18 completed (six courses + six proposals + six reports) / 32 planned. This report batch adds six new heroes plus 24 curated existing-image placements, with five different images per case. SWATCH still lacks six primary images.**

PANTRY NOTES is a new 32-page kitchen-measurement learning journal. All 16 genuine primary illustrations are present. The final six show equal-group planning, comparison of observation notes, provenance review, method handoff, careful revision and a closing notebook still life. All 32 pages show their assigned primary illustration; no pending-art diagram remains. Repeated placements do not increase the independent primary-art count. The case is published after browser, offline, cache, export and real Office checks passed.

The framework is a specimen window, observation/method margin and reflection strip. Mobile uses full-width stacked art and readable prose, not a tiny desktop screenshot. Text and a private note save under a separate local key. Current HTML and JSON exports preserve edits; original PDF/PPTX do not change with browser edits. All numerical examples are fictional arithmetic, not readings from the illustrated scale/jug, cooking instructions, calibration, nutrition or safety advice.

Final PDF has 32 pages. Final PPTX has 32 slides with native editable text and all 16 primary raster illustrations. Historical `pantry-notes-preview.pdf` and `.pptx` URLs remain compatible; download filenames are `pantry-notes.pdf` and `.pptx`. Source ZIP opens directly with `file://`, includes all 16 illustrations and a bundled viewer, and can generate self-contained current HTML. Original PDF/PPTX are separate downloads, not duplicated in the source archive. File-origin storage can be unavailable; use exports to retain edits.

## OPEN SHELF — second case (published)

The second case contains 32 authored spatial concept boards, not a recoloured notebook. Its distinct structure combines a full-width proposal heading, responsibility strip, conceptual zoning map, watercolor scene, lower evidence/action columns and per-board local review marks. Native PPTX exports include editable zoning shapes and text; primary watercolor art remains raster. The diagram is not to scale and is not construction, accessibility, safety, privacy, procurement or operational approval.

All 16 independent warm-ivory/pale-sage illustrations are present. The final six show specialist-question review, unresolved planning notes, source review, private draft discussion, a bounded notebook handoff and a closing project still life. All 32 boards now use their assigned main illustration; no pending-art map remains. The case is published after all acceptance gates pass. Historical `open-shelf-preview.pdf`/`.pptx` paths remain compatible; download filenames omit `preview`. Local review values are open/revise/discuss/defer, not official approval, and are saved separately for each board under a separate case key. Edits, note and review marks survive current HTML/JSON export and direct-file offline use. Original PDF/PPTX remain unchanged by browser edits.

The resource model is fictional: 1,800 + 1,400 + 600 + 400 = 4,200 units; adding 800 gives 5,000. Staffing, venue costs, specialist review and other categories are explicitly not supplied. It is not a quote, real funding or a complete budget.

The gallery now reads the case registry rather than a hardcoded single case. Search, OR category filtering, name/date sort, recent views, collection, archive/restore and mobile sidebar operate across all fifteen cases without modifying legacy personal-work storage. Production checks accept an honest draft but forbid publishing art-incomplete metadata.

## Reproduction and safeguards

Run from `design-buddy-home`:

- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 5174 --strictPort`
- `npm run build:pantry-notes` (uses `PANTRY_BASE_URL`, default `http://127.0.0.1:5174`)
- `npm run check:templates` verifies the new catalog, source counts, distinct actual JPEGs and SHA-256 asset manifest. Drafts may exist but cannot count as published. Missing/corrupt originals block production builds.
- `npm run build:open-shelf` and `npm run test:open-shelf` build and exercise the independent second case (`OPEN_SHELF_BASE_URL`, default port 5174).
- `npm run test:pantry-cache` verifies old-cache migration and all six actual offline case reloads.
- `npm run test:pantry-notes` exercises browser behaviour, per-page fit, editing, downloads, real touch and direct-file offline source.
- `npm run test:template-office` requires the optional LibreOffice kit at `.cache/office/node_modules/@deepseek-ai/libreoffice-kit/lib/index.js`, or `OFFICE_KIT_MODULE`; it runs real LibreOffice core, not Microsoft Office GUI.
- `npm run build` runs integrity checks before compiling.

The browser helper automatically extracts packaged Chromium runtime libraries into ignored `.cache/`. Source, primary JPEGs, export files and manifests must be in a verified Git checkpoint. Confirm the remote current-branch commit after pushing; do not rely only on a live process or the platform workspace snapshot. Old catalog and personal storage must not be deleted to make a clean-looking rebuild.

The service worker uses exact-request network-first caching, keeps unrelated caches, and never substitutes homepage HTML for a missing work/module. Versioned gallery and case modules prevent old unversioned caches from replacing new content.

## TIDELINE — third case (published)

32 original portrait atlas pages use a masthead, live scoped metrics, full-colour coastal scene, abstract segment index, source chart and analyst question. This is neither the kitchen journal nor the landscape proposal board. Eight chapter palettes accompany sixteen independently generated scenes: blue sea, coral sunset, overcast harbour, forest green, red boats, sand-gold overlook, deep-teal interior, fog, coastal gardens, indigo night, midnight analyst studio, storm-grey harbour, copper wetland, emerald porch, ochre sunroom and lavender dawn. Not all backgrounds are ivory or sage.

All 16 independent primary illustrations are present. All 32 pages use their actual assigned artwork; no pending-art frame remains. The case is published after all browser, data, mobile, cache, offline, export and real Office checks pass. Repeated placements do not add extra primary art.

The deterministic source model has 240 invented entry-event rows: day totals 42/50/46/58/44, segment totals 70/80/90. These are not unique people, occupancy, weather, a real walking route or empirical evidence. Segment selection genuinely recalculates KPIs/charts, a 25-row paginated source ledger and selected CSV. Prose explicitly remains full-model teaching context. Scope, edits and a private note persist independently under `design-buddy-tideline-rebuild-v1`. Current HTML includes all 32 pages, actual selected charts and embedded artwork; JSON records scope/edits. Original full-model PDF/PPTX are unchanged by edits.

`npm run build:tideline` uses `TIDELINE_BASE_URL` (default port 5174), generates the 32-page PDF, native-text/shape 32-slide PPTX, full CSV/JSON, cover/inside, SHA manifest and offline source ZIP. `npm run test:tideline` exercises ten groups, including mobile, exact scoped CSV and direct-file offline exports. Source ZIP includes all sixteen actual JPEGs, not duplicate original PDF/PPTX.

## AFTERGLOW — fourth case (published)

30 original dark landscape creative folios replace the portrait atlas with a vertical identity spine, five-act navigation, a six-beat reading rail, theatre scene/intention pairing and three editable prompt cards. Five chapter backgrounds are burgundy, midnight blue, copper, deep green and aubergine. Fifteen independent artworks now show varied environments: crimson auditorium, cobalt rehearsal room, copper costume-storytelling room, aubergine/emerald lobby, cobalt quiet lounge, emerald story discussion, crimson dialogue rehearsal, ochre object workshop, forest-green transition doorway, copper revision room, royal-purple alternatives discussion, olive reading nook, crimson informal handoff midnight-navy writing studio and an indigo empty-stage closing still life.

All fifteen independent main artworks are present. All thirty pages show their assigned actual illustration; no pending frame remains. The closing still life is imaginary, not a record of a real show. Publication follows browser/mobile, editing, local-state, offline, cache, export, integrity and real Office checks. Repeated placements are not extra art.

The thirty authored pages form Arrival / Contrast / Movement / Revision / Handoff, six reading beats each. Beat order is not elapsed time, a real show call sheet, blocking or a production plan. All examples concern fictional adults and creative writing. No booking, permissions, funding, accessibility approval, technical instruction or real participant study is supplied.

Act buttons and within-act beat buttons genuinely navigate pages. Each page has an independent local creative mark (unmarked/try/revise/park), six editable text fields and a separate private note. Local state uses `design-buddy-afterglow-rebuild-v1`; reset preserves other cases. Current HTML exports all thirty pages with actual text, marks, embedded artwork and the private note; JSON exports the state. Original PDF/PPTX are fixed full-case builds and are not rewritten by browser edits.

`npm run build:afterglow` uses `AFTERGLOW_BASE_URL` (default port 5174) and generates a 30-page PDF, 30-slide native-text/shape PPTX, cover/inside, SHA manifest and direct-file offline ZIP. The source ZIP contains all fifteen actual JPEGs and a bundled viewer, not duplicated original PDF/PPTX. `npm run test:afterglow` exercises nine groups including every page, touch navigation, editing, exact local marks, genuine downloads and self-contained offline export.

## SWATCH — fifth case (draft)

Thirty original material-question cards use a portrait perforated tear-sheet rather than the previous theatrical folio. A bold catalogue masthead, large colour scene, context boundary and four detachable slips separate LOOK / DO NOT ASSUME / ASK NEXT / KEEP ATTACHED. Five chapter palettes accompany nine genuinely independent main illustrations in cobalt, sunflower yellow, tangerine, turquoise, mint, coral, violet and lime industrial studios. First two cases' original backgrounds and authored content are preserved.

Nine of fifteen primary artworks exist. Pages 1–18 show actual assigned art. Pages 19–30 explicitly mark six pending main illustrations; filing frames are not counted as art. The draft does not count as completed. This turn's ten image generations were one AFTERGLOW closing still life plus nine SWATCH scenes. No sixth case is counted.

Five chapter filters restrict the actual card directory to six records each. The current card stays visible until a directory record is chosen. Users can pin up to three page references, compare current assumptions/questions, remove references, edit six fields and save a private note. The tray does not rank materials or show physical measurements. State saves under `design-buddy-swatch-rebuild-v1`; reset preserves other cases. JSON records actual pinned IDs and edits. Current thirty-card HTML embeds artwork, edited text, pinned IDs and the private note. Original PDF/PPTX are unchanged by browser edits. No tested material properties, supplier evidence, engineering specification, certification, procurement or equipment instruction is supplied.

`npm run build:swatch` uses `SWATCH_BASE_URL` (default port 5174), builds the thirty-page PDF, thirty-slide native-text/shape PPTX, cover/inside, SHA manifest and source ZIP with all nine actual JPEGs. `npm run test:swatch` exercises nine groups including the three-card limit, current edited comparison text, pin removal, chapter filtering, mobile, direct-file offline use and actual downloads.

## COMMON GROUND — first document case (published)

The user's new document-specific minimum is ten pages and five independent images per case. COMMON GROUND is a complete ten-page A4 project document with five independently generated watercolours, not slide screenshots or a renamed PPTX. Its framework uses running headers, numbered page sections, prose hierarchy, figure captions, reader questions and footers. Contents include cover, reading guide, project brief, context boundary, concept narrative, roles, review sequence, decision register, handoff and appendix. Every page has actual artwork; the five images are reused in pairs without inflating the independent count. Garden environments vary from sunny coral/cobalt to overcast lavender, sunset terracotta, dark teal interior and yellow/blue terrace.

The example is fictional and supplies no site survey, permissions, budget, participant findings, technical specification or real-world approval. Six text fields per page and a private note save under `design-buddy-common-ground-document-v1`. Browser edits can export an actual current DOCX, self-contained HTML or JSON. The Word package contains native editable paragraphs, heading styles, nine explicit page breaks, running header/footer with PAGE field and five unique embedded JPEGs used across ten pages. It is not ten whole-page images. Current DOCX/HTML include the private note; review it before sharing. Long edits can reflow beyond ten pages in Word.

Original `common-ground.docx` and `common-ground.pdf` each render to ten pages. The browser-edited and direct-file-offline-edited DOCX exports also render to ten pages in real LibreOffice core (not Microsoft Word GUI). `npm run build:common-ground` uses `GROUND_BASE_URL`, default port 5174, and builds originals, bundle, cover/inside, SHA manifest and offline source ZIP. `npm run test:common-ground` passes eight groups including the actual current Word export. Source ZIP opens directly with file:// and contains all five original JPEGs; original PDF/DOCX are separate downloads.

The registry now records document minima separately. Integrity keeps the original presentation thresholds, verifies document minima, distinct art, DOCX relationships and SHA hashes. Office verification selects DOCX for document cases and PPTX for presentation cases. The native gallery's 文档 format filter now finds this real document case.

## Verification and next steps

PANTRY NOTES passes eight browser groups, OPEN SHELF nine, TIDELINE ten, AFTERGLOW nine, SWATCH nine, COMMON GROUND eight and old-worker/offline regression nine. Real LibreOffice renders the first three PPTX files to 32 pages each and both later presentation cases to 30 and the document to ten. Registry revision 20261029-rebuild-10/SW v10 bypass stale prior gallery modules without deleting personal storage or unrelated caches. Production builds preserve public atelier assets byte-for-byte. Integrity checks accept the honest fifth draft but exclude it from completed totals.

All five PPTX builders now losslessly deduplicate byte-identical embedded images using `scripts/dedupe-pptx-media.mjs`. Reused images point to shared OpenXML media; primary JPEGs, text, shapes, page counts and appearances are unchanged. Integrity verifies no duplicate embedded bytes or broken image relationships; real Office rendering passes after this optimisation. Manifests and source ZIPs were rebuilt. This reduces cumulative changed workspace content from roughly 139.5 MiB to 120.6 MiB before the document case (126.32 MiB including the document), keeping this checkpoint under the snapshot budget without discarding originals. Before broad expansion, move generated distribution artifacts to a verified external artifact store rather than exceeding the budget; do not remove primary art or silently lose downloadable files.

Next: create SWATCH images 10–15 only, with varied sunlit workshop, open-air courtyard, violet/yellow source room, turquoise question nook, bright informal handoff, navy/green record review and blue/yellow closing still-life moods as appropriate. These are plans, not generated files. Keep each final image matched to its paired pages. Then update all missing-art/draft labels, alt text, publication metadata and exports; rerun the full suite and verify GitHub before calling it complete. There are 41 cases not started. Presentation cases still need 28–35 pages and 15–20 independent main illustrations. Document cases need at least ten pages and five independent images. Every case needs its own appropriate framework. Do not count diagrams or repeated placements as additional main art.

The existing history already on this same remote branch is merged without replacing the rebuilt template page with its legacy catalog. Those historical sources are retained; they are not counted as new completed cases.

Export PDFs/PPTX/source archives currently remain in Git as requested deliverables. Before broad expansion, plan artifact generation/storage rather than duplicating these binaries indefinitely; preserve primary art and reproducibility and respect the workspace snapshot size limit.

## Artifact budget checkpoint

Cumulative changed extant tracked/non-ignored files are approximately 126.7 MiB, under but close to the 128 MiB snapshot budget. Six older source ZIPs are no longer duplicated in the current Git tree: their exact bytes remain in already-pushed immutable Git history, pinned by blob ID, byte size and SHA-256 in `artifact-registry.json`. Their local downloadable URLs remain unchanged. `restore:artifacts` verifies/recreates them before dev/start/check/build, using local Git objects first and authenticated `gh api` only as a fallback. A missing COMMON GROUND archive was actually reconstructed and byte-verified; remote GitHub blob retrieval was also byte-verified. This is NOT a GitHub release upload. Future regeneration of an older source archive must update this registry deliberately, not silently restore stale bytes. New nine-case sources and all primary artwork remain tracked.

The combined Word/PDF package is assembled on demand in the browser rather than adding another 12 MB duplicate ZIP to Git. Browser acceptance actually downloads and unpacks all 9 DOCX and 9 PDF entries. Do not add another large batch before addressing the remaining artifact budget.

## Nine category-specific documents — completed together

| Category | Case | Framework |
|---|---|---|
| Course | FIELD SCHOOL | Teaching worksheet with prose/art split and response lines |
| Proposal | STILLWATER | Two-column decision memo with evidence/options table |
| Report | PUBLIC THREAD | Two-column report, source table and lower figure strip |
| Fundraising script | SEED ROUND | Narrative-led script with claim/qualification table |
| Marketing | BRIGHT EDIT | Image-led brochure with copy/proof boundary |
| Training | SHIFT READY | Checklist-first learning record |
| Business planning | LOCAL TABLE | Ledger-first assumptions record |
| Event | OPEN SATURDAY | Three-column programme with discussion blocks |
| Product design | FORM STUDY | Image-left/specification-right requirements matrix |

Every case has ten authored pages, five distinct JPEGs, a real editable native DOCX (headings, paragraphs, tables and images—not a screenshot), ten-page PDF, cover, provenance, SHA manifest and direct-file offline source ZIP. Every page includes an assigned illustration. Sources identify the new hero and four curated existing images honestly. Financial/report models are fictional and reconcile with the exported JSON/CSV; no real fundraising or operational result is claimed.

Collection: `/templates.html?format=文档&batch=nine-documents`. All documents (including COMMON GROUND) remain available through the ordinary format filter; full gallery retains 15 cases, 14 published and one explicit SWATCH draft. Browser edits persist per case and export current DOCX/HTML/JSON; original files stay unchanged. Longer edits can reflow; current exports include private notes and must be reviewed before sharing.

Verification completed: all six earlier case suites, old-worker/cache suite, eleven new batch browser/data groups, nine actual edited-DOCX LibreOffice renderings (ten pages each), all fifteen original Office exports at their expected page counts, SHA integrity and production build. This is real LibreOffice core, not a Microsoft Word GUI claim. Desktop 90-page fit, nine distinct layout geometries, 390px mobile, direct-file offline editing/export and native gallery filters/search were exercised. The builder also produces the shared document-kit integrity manifest. Repeated edited-Word tests remove their previous PDF first so reruns are safe.

Commands: `npm run build:document-batch`, `npm run test:document-batch`, `npm run test:template-office`, `npm run test:pantry-cache`, `npm run build`. Build/test expect the dev server on 5174; optional Office dependency uses `OFFICE_KIT_MODULE` or the ignored `.cache/office` installation. The build emits one pre-existing root-tsconfig es2024 warning but exits successfully.

## Additional-50 request: course batch completed

See `docs/DOCUMENT-EXPANSION-50.md` and JSON for the allocation and detailed status. The six courses are published after eight browser/data groups plus six actual edited-Word renderings. Original six DOCX files also rendered to ten pages each. Sixty pages fit, all six geometries differ, structured worksheet cells persist/export, mobile and file:// pass. Previous six-case browser suites, nine-document suite (including all 18 original batch-download bytes) and cache migration pass. Gallery revision 11 and SW v11 preserve prior works and unrelated caches. Batch ZIP provides six native Word documents and six PDFs; bytes were actually checked against originals.

To preserve snapshot headroom, five older PPTX files and the new six cases’ 18 distribution files were first committed/pushed and remote HEAD verified, then pinned to immutable blobs with byte size/SHA in the artifact registry. Together with the older six source archives, 29 files now use automatic predev/prestart/precheck/prebuild restoration. All 23 newly migrated files were actually removed and restored from Git and hashes checked; a new Word file was also downloaded from GitHub and byte-verified. URLs and local downloads remain intact. No release upload is claimed. The artifact source checkpoint is `4db86e63941bc26d3e4cda1bc2f9aaa20179dd26`. Current cumulative extant non-ignored patch content is approximately 119 MiB. Earlier artifact-budget figures above describe historical checkpoints, not current capacity.

The artifact pinning helper checks that HEAD was pushed and that export bytes equal the committed Git blob before untracking a distribution file. Future regeneration must commit/push actual new bytes and update the registry deliberately. New primary JPEGs, authored content, HTML, case-specific toolkit and manifests remain in the current tree. Original nine documents and older sources are preserved; this is not recovery of the missing historical four originals, nor completion of native DSH integration.

## Additional-50 request: proposal batch completed

PILOT CHARTER / SERVICE BLUEPRINT / PARTNERSHIP CANVAS / RESEARCH COMMISSION / CHANGE CASE / CREATIVE TREATMENT are six complete ten-page proposals, not recoloured course templates. The category plan and machine-readable queue now record 12/50 completed and 38 planned. Three collections remain independent: original nine documents, six courses and six proposals. All previous gallery works and private storage remain intact. Current revision is `20261029-rebuild-12`, SW v12.

Authored source JSON, per-page questions and three specific record fields support each proposal’s framework. A standalone proposal-kit implements different stage-gate, lane, party-panel, register, comparison-card and editorial layouts. Native Word also uses six different block orders, with native editable tables. Browser acceptance checks all 60 pages, six geometries, edits in multiple record cells, persistent/exported text, mobile, file:// source, genuine originals and byte-identical combined downloads. All six original and six edited Word files actually render to ten pages with real LibreOffice, not a Microsoft Word GUI claim. Longer edits remain capable of reflow.

A builder audit found that course originals imported the generic nine-document Word generator while current exports used inquiry-kit. The original builder now uses inquiry-kit; all six originals were rebuilt. Course/proposal acceptance compares native original XML to the correct family generator and requires six distinct image/prose/table orders, preventing this mismatch from returning. Previous original binaries remain in immutable Git history. No image was replaced or lost by this correction.

Artifact pinning preserves actual downloads while managing the cumulative snapshot budget. In addition to earlier files, five older PDFs and all proposal distribution files are stored by fixed blob/byte-size/SHA after a verified push; revised course exports are repinned to their new native Word versions. Final registry has 52 artifacts. Sources, primary JPEGs, thumbnails, HTML and toolkit remain in the current tree. Full clones restore from local Git history; shallow clones may need a history fetch or authenticated GitHub CLI fallback. Never change a generated export without committing/pushing its actual bytes and updating the pin. Historical capacity/checkpoint counts above describe earlier checkpoints, not current progress.

### Final proposal verification checkpoint

All 27 originals passed actual LibreOffice rendering at the expected page counts. Old case suites, original nine-document batch, six-course batch, six-proposal batch, old-worker/cache migration, integrity and production build all pass. Proposal/course tests additionally require actual original XML to match their own native generators and all six native block orders to differ. All 52 pinned distribution files were removed locally, reconstructed from Git history and verified against byte size and SHA; a real GitHub download of the proposal Word blob matched. Source/export checkpoint: `3c373411bfd6e3a61d55afa7c04ee4714dc98d75`. Final cumulative extant non-ignored patch content is approximately **111.05 MiB**, below the 128 MiB budget. No source download was removed.

## Additional-50 request: six reports completed

EVIDENCE REVIEW, EXPERIMENT READOUT, OPERATIONS REVIEW, INTERVIEW SYNTHESIS, LANDSCAPE SCAN and DECISION AUDIT are complete ten-page reports with five distinct images each. `docs/DOCUMENT-EXPANSION-50.md` records the six frameworks, actual model values and 18/50 progress. Thirty-two requested cases remain planned. There are now 33 catalog cases, 32 published and one honest draft; previous native navigation, collection/archive state and three earlier document collections remain intact. Revision 13/SW v13 serves the fourth report collection independently.

The report-kit adds read-only model summaries and separate editable analyst records. Source JSON and correctly quoted CSV reproduce each other and are included in offline sources. Tests recompute every reported arithmetic model, preserve null/denominator and multi-label boundaries, and distinguish V4/V5 information from the V3 decision. All scenarios, quotes and datasets are invented and clearly marked—not real participants, outcomes or market facts. Current prose/record edits do not recalculate the fixed model; that boundary is stated in the viewer and exports.

Eight report browser/data groups plus six real edited-Word renderings pass; the separate source model checks pass too. All sixty pages fit, all six geometries and native block orders differ, original Word XML matches the family generator, multiple record cells persist/export, mobile is stacked/readable, file:// works, and original source/batch-download bytes match. All 33 original Office files passed actual LibreOffice at the expected page counts. Older case suites, original nine documents, courses, proposals and legacy cache migration pass. Root es2024 warning remains pre-existing; production builds succeed.

During cache testing an installed current worker could remain waiting behind the deliberately installed legacy fixture. Gallery registration now uses updateViaCache none and an explicit activate-current message for waiting/installed workers; the worker handles that message via skipWaiting. This does not reload clients or delete private storage or caches. The fixture now waits for initial activation before deliberately replacing the worker, avoiding an unrealistic overlapping-install setup. Repeated migration/offline checks pass.

Complete report distribution bytes are pushed before pinning to immutable history. The current registry contains 70 automatic-restore artifacts; primary JPEGs, content, CSV/JSON, toolkit, HTML and manifests remain in the current tree. Final cumulative extant non-ignored patch content is approximately 118.4 MiB. Missing-file restoration and an actual remote report blob check both passed.

### Final report backup / reproducibility checkpoint

Complete final report export bytes are backed by pushed commit `195eaa8ceeafebc8350b686628261b05c042a3fa`. All 70 pinned artifacts were actually removed locally, automatically reconstructed from immutable Git history and verified against byte size/SHA-256. A report Word blob was independently downloaded from GitHub and matched exactly. The six restored final original Word files were rendered again with real LibreOffice: ten pages each. Production integrity/build passes after the cold restore. Cumulative extant non-ignored patch content is approximately **118.4 MiB**, below 128 MiB.

The CSV writer now emits canonical LF, matching the repository’s enforced LF checkout. All source CSV/JSON/JS bytes were compared with their pushed Git blobs; manifests and offline archives were rebuilt after canonicalisation. This prevents a fresh clone from failing byte-level integrity because of CRLF normalisation. Model round trips, report browser/mobile/offline/download tests and six edited-Word renderings passed again after that correction. No current download was removed by artifact pinning.
