# Reference-led collection rebuild

## New user-authorised scope

On 2026-10-29 the user requested a new rebuild, not recovery of the missing prior binaries. Presentation cases must contain **28–35 pages and 15–20 independently generated main illustrations**. The subsequent document-specific instruction requires **at least 10 pages and at least 5 independent images per document case**; it does not lower the presentation requirements. This replaces the earlier 28–40-page allowance. The attached kitchen image initially guided the first two cases: warm ivory, pale sage, delicate ink and soft watercolour. The subsequent latest instruction explicitly requires varied backgrounds, not this same pale palette throughout. From case three onward, vary environment, time of day, light and colour by theme while retaining fine-line watercolour quality. Preserve the first two cases unchanged. Each case must have a genuinely distinct framework. Preserve native gallery rail/sidebar/filter/workspace behaviour and existing user work storage.

The original target was 56 cases. The latest request adds 50 documents to the existing 15 cases, so the current catalog target is 65 cases; do not fold the previous nine into the 50. Legacy bulk sources are retained, not used to populate the rebuilt gallery. Prior MEASURE/CORNER LIBRARY/FOOTFALL/AFTER HOURS originals remain unrecovered; this batch must not be described as recovery of those files.

## Actual progress

**Published: 59 / 65 (four presentations and fifty-five documents). Drafts: 1 SWATCH presentation. Not started: five product-design documents. Authored pages including draft: 706. Additional-50 request: 45 completed / 5 planned. This event batch adds 25 curated existing illustrations, five distinct images per case; no newly generated artwork is claimed. SWATCH still lacks six primary images.**

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


## Fundraising speech batch completed — 23 / 50

Five different frameworks: FOUNDER NARRATIVE (story and evidence side-notes), TRACTION DIALOGUE (claim/definition/source challenge), TECHNICAL THESIS (mechanism, baseline and validation gate), IMPACT THESIS (independent impact and commercial paths), ROUNDTABLE BRIEF (ten non-linear investor question modules). Each includes ten complete English spoken drafts with independent speaker/evidence notes, five distinct illustrations, editable native Word, ten-page PDF, offline source ZIP and source CSV/JSON. Five new heroes plus twenty curated existing images; not twenty-five new artworks. The five browser geometries and five native Word block orders differ.

Open `/templates.html?format=文档&batch=fundraising-expansion`; `/atelier/fundraising-kit/download.html` downloads five Word + five PDF originals in one browser-built, byte-checked ZIP. `npm run build:fundraising-expansion` reproduces exports. `npm run test:fundraising-expansion` checks all fifty pages, gallery/search, editing persistence, native Word XML, notes, mobile, offline file://, ZIP contents and actual edited Word rendering. `tests/verify-fundraising-models.mjs` validates complete LF CSV/JSON round trips and source arithmetic/unknown-value boundaries. Optional preparation: `python3 design-buddy-home/scripts/prepare-fundraising-expansion.py --keep-images` from the repository root preserves existing image bytes.

All scenarios are fictional, not investment offers: teaching units are not currency or an actual ask; 30 invented workspaces/48 events/14 repeated workspaces are not retention or growth; payment is unknown, not zero; three technical stages are untested, not deployed code; six impact/commercial hypotheses are unverified, not measured outcomes; the question index is not a real meeting or agreed terms. Original sources stay fixed when prose/records are edited. Current Word/HTML include the private note; review it before sharing. Longer edits may reflow. No Microsoft Word GUI validation is claimed.

Current expansion: 23 published, 27 remaining; gallery 38 cases (37 published, one SWATCH draft), 486 authored pages. Existing collections and local workspace mechanisms are preserved. Gallery revision 14 / SW v14 use the existing activation handshake without deleting personal data. Next planned batch: six marketing documents.


### Final fundraising backup / reproducibility checkpoint

Export bytes were committed and pushed before pinning: `97e3c88d` (five DOCX, five PDFs, five offline source ZIPs). All **85** registered artifacts were physically moved aside, automatically restored from immutable Git history and verified against SHA-256 and byte sizes. An actual remote traction Word blob was independently fetched with GitHub CLI and matched. All five source CSV/JSON/JS/data files match pushed Git bytes exactly; canonical LF CSV round trips pass.

All 38 original Office documents rendered at their expected page counts with real LibreOffice, including five ten-page fundraising originals. Five fundraising edited Word exports also rendered to ten pages. Old six-case browser suites, original nine-document, six-course, six-proposal, six-report suites and all nine cache-migration checks pass. Final integrity and production build pass after cold restoration. Extant non-ignored snapshot content is approximately **124.75 MiB**, below 128 MiB. Audit/release storage before the next batch; do not remove downloads or add another full batch without a storage plan. Original-nine exports may be candidates for the same pushed-byte pinning workflow, but are not pinned yet.


## Marketing batch completed — 29 / 50

| Template | Independent framework / editable module |
|---|---|
| LAUNCH KIT | Channel-message launch system: message, audience, channel copy, action and release gates |
| CASE STORY | Permission-aware scene/challenge/action/change narrative with explicit source and outcome boundaries |
| COMPARISON GUIDE | Task-first needs/options/conditions workbook with three fictional concepts and four assumed capability flags |
| EDITORIAL CALENDAR | Question/pillar/brief planning board; twelve relative slots, not dates or publication commitments |
| BRAND VOICE | Tone scale, vocabulary decisions and before/after/rationale rewrite guide |
| CAMPAIGN PLAYBOOK | Conceptual touchpoint journey, information handoffs, response scripts and release checks |

Each contains ten complete English pages, five distinct illustrations, native editable Word, ten-page PDF, offline source ZIP, provenance, SHA manifest and downloadable source CSV/JSON. Six newly generated heroes plus 24 curated existing images, not thirty new artworks. Page colours and structures vary: cobalt campaign board, terracotta story feature, violet comparison register, teal editorial board, rose/aubergine voice specimen and forest-green touchpoint plan. Six browser geometries, six native Word block orders and framework-specific native tables are checked independently. No page is a Word screenshot.

Collection: `/templates.html?format=文档&batch=marketing-expansion`. Batch originals: `/atelier/marketing-kit/download.html` (six Word + six PDF entries, all byte-checked against originals). Build: `npm run build:marketing-expansion`. Acceptance: `npm run test:marketing-expansion`, including `tests/verify-marketing-models.mjs`. Preparation from repository root: `python3 design-buddy-home/scripts/prepare-marketing-expansion.py --keep-images` (Pillow in ignored `.cache/expansion-python`); existing primary heroes are valid fallbacks if the generation cache is absent. Regenerating images/exports needs deliberate manifest and pin updates.

The models explicitly distinguish planning from evidence: three draft placements are not sends; five authored story elements are not interviews, permissions or testimonials; eight yes flags across twelve assumed cells are not a product ranking; twelve relative editorial slots are not actual dates or publications; eight rewrite pairs are editorial choices, not tested winners or legal clearance; six planned touchpoints are not interactions, attribution or conversions. Missing dates, contact counts and outcomes stay null, not invented zero observations. Original source excerpts/registers stay fixed when copy and planning records are edited. Current Word/HTML include private notes; review before sharing. Long edits may reflow.

Current additional expansion: **29 published / 50, 21 remaining**. Full gallery: **44 cases, 43 published and one SWATCH draft**, 546 authored pages, target 65. Earlier fifteen cases and all prior batch filters remain preserved. Gallery revision 15 / SW v15 keep the existing activation handshake and do not delete unrelated caches or personal work. Next planned batch: six training documents.

Verification: all sixty marketing pages fit A4; six distinct browser geometries/native orders; five distinct image hashes per case; original native Word XML equals this family generator; persistent copy/record edits and private notes; current DOCX/HTML/JSON; original downloads; 390px mobile navigation; direct file:// offline editing and Word export; source downloads and offline source bytes; LF CSV/JSON record round trips. All **44 original Office files** rendered at their expected counts with real LibreOffice, including six ten-page marketing originals; six edited marketing Word exports also rendered to ten pages. No Microsoft Word GUI validation is claimed. Original-nine, course, proposal, report and fundraising regression suites pass. Old six-case suites pass. One combined-run worker handover wait timed out; the isolated final nine-group cache-migration suite passed. No production cache-clearing workaround was introduced.

Storage preservation: the original nine-document collection’s 27 unchanged exports were verified against already-pushed Git blobs and moved into the same SHA-pinned automatic restoration mechanism; local download paths/files remain intact. Marketing export bytes are pushed before pinning. A current source checkout restores pinned files before dev/start/check/build; a shallow clone may require Git history or authenticated GitHub CLI. Pinning does not remove the downloadable artifacts.

### Final marketing backup / reproducibility checkpoint

Complete marketing export bytes were pushed in `6af1dba2869d231982e2482c181f86fda02372c3` before the 18 new distributions were SHA-pinned. The registry now contains **130** artifacts, including the 27 unchanged original-nine distributions. All 130 were physically moved aside, restored automatically from immutable Git history and verified against byte size and SHA-256. A comparison Word blob was independently fetched from GitHub and matched. All six marketing source CSV/JSON/JS/data files match pushed Git blobs exactly. No downloadable file or local personal work was removed.

After cold restoration, marketing acceptance passed again (eight browser/data groups and six real ten-page edited Word renderings), as did all nine cache-migration groups and production integrity/build. All 44 original Office renderings had already passed; restored bytes are identical. The final cache suite also passed concurrently with marketing acceptance. Extant non-ignored cumulative patch content is approximately **108.25 MiB**, below 128 MiB. Keep auditing before future batches; artifact pinning is preservation in pushed history, not a deletion or an unverified release upload.


## Training batch — 35 / 50 additional documents

| Template | Distinct framework and editable module |
|---|---|
| ROLE ONBOARDING | Role-to-task learning passport, five learning gates, boundary/referral and feedback records |
| SCENARIO PRACTICE | Three-route choice, assumption and debrief rehearsal; reversible branch navigation |
| FACILITATOR GUIDE | SAY/ASK/OBSERVE cue fieldbook with five proposed timeboxes totalling 45 teaching minutes |
| PEER COACHING | Bounded agreement, clarification, listening, options, action accord and ending record |
| PROCESS REHEARSAL | Three-lane/four-step handoff loop with input/output continuity and exception cards |
| SKILLS PORTFOLIO | Three-attempt/four-dimension evidence folio with revision rationale; no automatic grade |

Each has ten complete English pages, five distinct illustrations, native editable Word, ten-page PDF, offline source ZIP, source CSV/JSON, image provenance and SHA manifests. The illustrations are five curated existing AI-generated assets per case (30 placements total), **not newly generated artwork**. The gallery and downloads state this accurately. Colours/layouts vary: ochre passport rail, terracotta branch board, copper cue deck, violet peer accord, navy swimlane ledger and forest evidence folio. Six browser geometries, six native Word block orders and framework-specific native tables differ.

Collection: `/templates.html?format=文档&batch=training-expansion`. Combined originals: `/atelier/training-kit/download.html` (six editable Word + six PDF originals, byte-checked). Build: `npm run build:training-expansion`. Acceptance: `npm run test:training-expansion`. Sources: `scripts/training-expansion-content.json`, `scripts/prepare-training-expansion.py` and `tests/verify-training-models.mjs`. To prepare while preserving image bytes, run `python3 design-buddy-home/scripts/prepare-training-expansion.py --keep-images` from the repo root with Pillow installed in ignored `.cache/expansion-python`.

The scenario branches work online and directly via file://: page 5 routes A/B/C to pages 6/7/8, each returning to page 5. Current exported HTML uses real internal anchors; Word originals/current exports use valid underscore-named bookmarks and internal hyperlinks. Branches are conceptual discussion routes, not predicted consequences or scored correct answers. Source excerpts/registers are read-only and stay fixed when practice prose/records are edited. Private notes are included in current Word/HTML and must be reviewed before sharing. Long edits may reflow.

Model checks recompute the five unassessed onboarding gates, reversible branch graph, 5+8+12+12+8=45 teaching-minute plan, six planned coaching stages, four-step/three-role input-output chain and 3×4=12 unassessed evidence cells. CSV uses canonical LF; complete round trips preserve null unknown values and explicit not-assessed/not-rehearsed status. A missing score is not a zero or a failing grade. These examples establish no employment requirements, actual participants, attendance, confidentiality guarantee, operational authority, real performance improvement, professional accreditation or certification.

Current additional expansion: **35 published / 50, 15 remaining**. Full gallery: **50 cases (49 published, one SWATCH draft), 606 authored pages**, target 65. Previous collections/local work are preserved. Gallery revision `20261030-rebuild-16` / SW v16 retain the existing activation handshake without clearing personal/unrelated caches. Next planned batch: five business-planning documents.

At the start of this batch the local checkout was unexpectedly at the original base commit. Before any authoring, the active branch was fetched and fast-forwarded to the verified previous delivery `30a6473723855c7c98d4d697b66a8103a61603f4`, then all 130 existing pinned artifacts restored. Earlier deliveries were preserved, not recreated or silently rolled back.

### Final training backup / reproducibility checkpoint

Complete final training exports were committed and pushed in `63263732623945a82a169eb665a8e50ee0035049` before pinning the 18 new DOCX/PDF/source distributions. All **148** pinned artifacts were physically moved aside, automatically restored from immutable Git history and checked against SHA-256 and byte size. An actual remote scenario Word blob was independently fetched with GitHub CLI and matched. All 24 training source CSV/JSON/JS/data files match their pushed Git blobs byte-for-byte. Downloads remain present locally and restore before dev/start/check/build; pinning is not removal of the deliverables.

All **50 original Office files** rendered at their expected page counts with real LibreOffice, including six ten-page training originals. A concurrent original-render process was killed with exit 137 after 12 successful files; after the other regressions finished, the remaining 38 were rendered sequentially and the combined set checked against all 50 catalog IDs. The Office verifier now accepts optional distinct catalog IDs to support explicit resumption; the default still checks the full catalog. Avoid multiple simultaneous memory-heavy Office converters. This interruption was not counted as a pass.

Original-nine, course, proposal, report, fundraising and marketing suites pass, including their edited Word checks. All six earlier individual case suites pass. The nine-group cache migration suite passed twice consecutively, retaining unrelated caches and personal storage. After the actual cold restore, training acceptance passed again (eight browser/data groups and six actual ten-page edited Word renderings), and production integrity/build passed. No Microsoft Word GUI validation, actual learner assessment or certification is claimed.

The final extant non-ignored cumulative patch content is approximately **115.48 MiB**, below 128 MiB. Recheck before the final fifteen documents; do not add complete distribution bytes to the current tree without the established pushed-byte pinning/storage workflow. The next batch is five business-planning frameworks.


## Business-planning batch — 40 / 50 additional documents

| Template | Independent framework / editable module |
|---|---|
| LEAN VENTURE | Six untested hypotheses, assumption canvas, validation backlog and revision rules |
| SCENARIO LEDGER | Three demand cases, capacity-constrained delivery, point ledger and one-variable sensitivity |
| SERVICE ECONOMICS | Demand/capacity, reserved time, unit contribution and a whole-unit teaching threshold |
| GROWTH OPTIONS | Five options, an acyclic dependency graph, token-constrained portfolios and stop rules |
| OPERATING MODEL | Capability map, four functional roles, five interfaces and responsibility/authority boundaries |

Each has ten complete English pages, five distinct curated illustrations, native editable Word, ten-page PDF, offline source ZIP, source CSV/JSON, provenance and SHA manifests. Twenty-five curated existing AI-generated illustration placements, not newly generated art. Visual structures vary: gold canvas with a learning backlog, navy driver ledger, terracotta capacity board, forest option desk and graphite interface rail. Five browser geometries, five native Word block orders and five framework-specific native table treatments are independently checked. Text/tables are native editable content, not screenshots.

Collection: `/templates.html?format=文档&batch=business-expansion`. Batch originals: `/atelier/business-kit/download.html` (five Word + five PDF entries, byte-checked). Build: `npm run build:business-expansion`. Acceptance: `npm run test:business-expansion`, including `tests/verify-business-models.mjs`. Preparation from repo root: `python3 design-buddy-home/scripts/prepare-business-expansion.py --keep-images` with Pillow in ignored `.cache/expansion-python`. Authored source is `scripts/business-expansion-content.json`. Original model excerpts and source registers stay fixed when planning prose or records are edited; edit sources and rebuild to change the model. No live forecast calculator is claimed. Current Word/HTML include private notes; review before sharing. Long edits may reflow.

The models distinguish planning arithmetic from actual business evidence. Six canvas hypotheses remain untested. Three scenario rows and three sensitivity rows use delivered=min(demand,capacity), separate unmet/unused units, four benefit points per delivery and 12+2×delivery resource points; net values are not money or profit. The service model uses (450−90)/45=8 sessions, a 6-credit unit contribution and ceil(20/6)=4 whole sessions as a teaching threshold, not financial break-even. Demand cases 6/8/10 deliver 6/8/8 with net credits 16/28/28. The five growth options request 20 non-monetary tokens against an illustrative allowance of 8; dependencies are checked for valid prior nodes and cycles. Five operating interfaces preserve role/artifact continuity, with no real appointments or delegated authority. Unknown real customers, demand, money, growth and performance stay null.

Current expansion: **40 published / 50, 10 remaining**. Full gallery: **55 cases (54 published, one SWATCH draft), 656 authored pages**, target 65. Previous batch filters and local-work mechanisms remain preserved. Gallery revision `20261030-rebuild-17` / SW v17 retain the existing activation handshake; no cache or user-data deletion is used. Next planned batch: five event documents, then five product-design documents.

Validation covers all fifty pages, five distinct sourced-image hashes per case, editable title/prose/records, saved edits, native Word XML/family-generator equivalence, current DOCX/HTML/JSON, real original downloads, 390px mobile, direct file:// editing/export, source downloads and offline bytes, canonical LF CSV/JSON round trips, arithmetic, whole-unit boundaries and dependencies. Five edited business Word exports render to ten pages each with real LibreOffice. The fifty previous original Office files and five new originals all rendered at their expected page counts. All seven prior document-batch regression suites (including their edited Word tests), and six original individual-case suites pass. No Microsoft Word GUI validation is claimed.

Known cache-test limitation: the old/current worker handover intermittently times out with the new worker installed/waiting and the legacy fixture still controlling, even though the current gallery content loaded. This was reproduced and recorded, not treated as a pass or bypassed by clearing data. Listener-order and bounded-retry experiments did not eliminate it and were reverted; production activation behaviour is unchanged except the version bump. The final isolated nine-group migration run passed, including exact offline works and retention of unrelated caches/personal storage. Failure-only registration-state diagnostics remain in the test to aid a future lifecycle investigation. Do not claim the handover flake is fixed or that repeated stress runs are all green.

### Final business backup / reproducibility checkpoint

Complete final business export bytes were pushed in `3df0a4a4f8fb470c751c8629ffd451eb22524023` before the 15 distributions were SHA-pinned. The registry now contains **163** artifacts. Every one was physically moved aside, restored automatically from immutable Git history and verified against byte size/SHA-256. An actual remote service-economics Word blob was independently fetched from GitHub and matched. All 20 business source CSV/JSON/JS/data files match pushed Git blobs exactly, including array-valued dependency CSV round trips and canonical LF. Local download paths remain unchanged.

After cold restoration, business acceptance passed again (seven browser/data groups and five actual ten-page edited Word renderings); integrity and production build passed. All 55 original Office renderings were verified against the catalog (50 prior plus 5 new), and restored bytes are identical. No Microsoft Word GUI verification is claimed. The cache-handover limitation above remains unresolved; the final isolated run passed, but failed stress iterations were not counted as passes and no speculative lifecycle workaround was retained.

Extant non-ignored cumulative patch content is approximately **121.80 MiB**, below 128 MiB. Only about 6.2 MiB remains before that cap. Audit and make a preservation plan before the final ten documents; unused already-pushed QA cover PNGs may be candidates for the same immutable-history pin/restore workflow, but no covers have been pinned yet. Do not remove original art, downloads or personal work to meet the budget.


## Event batch — 45 / 50 additional documents

| Template | Independent framework / native editable module |
|---|---|
| COMMUNITY FORUM | Three topic circles, six authored note examples, difference-preserving synthesis and follow-up questions |
| EXHIBITION GUIDE | Three conceptual exhibition zones, six fictional work cards, a zone index and return links |
| WORKSHOP RUNBOOK | Two task stations, input/output continuity, functional roles and a six-block illustrative run sheet |
| READING SALON | Three original exercise passages, three discussion rounds and nine unrecorded discussion cells |
| DEMO DAY | Three fictional concept units, clarification questions and nine uncollected feedback cells |

Each document contains ten complete English A4 pages, five distinct illustrations with an image on every page, native editable Word, ten-page PDF, offline source ZIP, source CSV/JSON and provenance. All 25 illustrations are curated from existing AI-generated artwork and prepared as attributable derivatives; no newly generated artwork is claimed. Visual structures differ: green topic-circle cards, lilac exhibition catalogue/banner, terracotta station rail, blue text-first reading spread and cobalt feedback strip. Browser geometries, five native Word block orders and five framework-specific native table structures differ; text and tables are not flattened screenshots.

Collection: `/templates.html?format=文档&batch=event-expansion`. Batch originals: `/atelier/event-kit/download.html` (five Word + five PDF files, byte-compared with actual originals). Build: `npm run build:event-expansion`. Acceptance: `npm run test:event-expansion`, including `tests/verify-event-models.mjs`. Preparation from repo root: `python3 design-buddy-home/scripts/prepare-event-expansion.py --keep-images`, with Pillow installed in ignored `.cache/expansion-python`. Authored source: `scripts/event-expansion-content.json`.

The models explicitly separate authored material from real events. Forum notes are proposals/questions, not submissions, votes or consensus; no contributor names are invented. Exhibition work cards are fictional and routes are document links, not venue/safety plans or installed works. The workshop's 5+12+3+15+15+10=60 minutes is planned illustrative time, not measured delivery; station input/output continuity is checked. Salon passages are original exercises, not external quotations; all nine response cells remain unrecorded. Demo concepts are not running products, and all nine feedback cells remain uncollected. Real attendance, consent, feedback, appointments, endorsements and contact opt-in are not asserted. Original source excerpts/registers remain fixed when copy is edited; update sources and rebuild to change them. Current exports include private notes; review before sharing. Long edits may reflow in Word.

Current expansion: **45 published / 50, 5 remaining (product design)**. Full gallery: **60 cases (59 published, one SWATCH draft), 706 authored pages**, target 65. Existing artwork, download URLs, collections, local work and prior batch filters are preserved. Gallery revision `20261030-rebuild-18` / SW v18 use the existing activation handshake; no unrelated-cache or personal-data deletion is introduced. The previously documented intermittent old-worker handover timeout is **not fixed**. This batch's nine-group isolated cache check passed; it does not erase earlier failed stress runs.

Validation covers all fifty page layouts, five distinct sourced-image hashes per case, editable titles/prose/records, persistence, immutable source excerpts, native Word generator equivalence, actual DOCX/PDF downloads, current Word/HTML/JSON, 390px touch layout and file:// offline Word export. Source CSV/JSON round trips preserve all rows, nulls and canonical LF. Exhibition index-to-zone and return navigation is exercised on desktop, touch and file://; Word uses six valid internal hyperlinks to its ten module bookmarks. All 60 original Office exports render at their expected page counts with real LibreOffice core (55 prior, five new); five edited event exports render to ten pages each. All eight previous document-family suites and six earlier individual-case suites pass. No Microsoft Word GUI verification is claimed.

### Event backup and storage checkpoint

Complete event distribution bytes were committed and pushed in `bf117e42` before pinning their 15 Word/PDF/source archives. To stay under the snapshot limit without removing deliverables, 55 existing QA cover PNGs were also byte-verified against already-pushed `20aaa853` and added to the explicit immutable-history restore workflow. Their local site paths remain present; no primary illustration or personal work was removed. Pinning covers requires explicit `--covers` and catalog membership; restore permits only the narrow existing artifact-path whitelist plus `cover.png`.

The registry contains **233 files: 178 distributions and 55 QA covers**. Every file was physically moved aside, restored automatically from immutable Git history, and checked against original bytes, byte size and SHA-256. An actual remote exhibition Word blob was independently fetched with GitHub CLI and matched. All 20 event data/content/source CSV/JSON files match pushed Git blobs byte-for-byte. Restoring before dev/start/check/build preserves download and gallery paths. Full clones prefer local Git objects; shallow clones may need history or authenticated GitHub CLI access. Do not claim these binaries remain duplicated in the latest Git tree.

After actual cold restoration, event acceptance passed again, including all desktop/touch/file:// exhibition routes, seven browser/data groups and five real ten-page edited-Word renders. Integrity and production build passed. Final extant non-ignored cumulative content is approximately **108.54 MiB**, below 128 MiB; recheck before the final product-design batch.
