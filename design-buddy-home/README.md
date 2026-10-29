# Design Buddy — standalone creation workspace

This Vite workspace preserves the native gallery navigation, search, format/category filters, collections and local work. It is not the completed native DSH integration.

## Run

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5174 --strictPort
npm run build
```

## New document collection

Open `/templates.html?format=文档&batch=nine-documents` for nine different category/framework documents, each with 10 pages and 5 distinct illustrations: course, proposal, report, fundraising script, marketing, training, business planning, event and product design. Each has editable DOCX, PDF, offline source ZIP and image provenance. The collection links to a browser-generated ZIP containing all nine Word files and nine PDFs. This package downloads actual originals and uploads nothing.

Nine new theme illustrations are combined with 36 curated existing-image placements, not 45 new images. Report/model values are fictional. Original DOCX/PDF remain fixed; current edited Word/HTML/JSON exports include local edits and private notes. Long edits can reflow. Review notes before sharing.

See [NEW-TEMPLATE-PLAN.md](NEW-TEMPLATE-PLAN.md) for the current 65-case target, current 54-published/1-draft status, frameworks, validation and remaining limits. SWATCH remains an honest draft, not a completed case.

## Artifact preservation

Primary art, source, manifests and completed export bytes are backed up in Git. Distribution files can be stored in SHA-pinned, already-pushed immutable Git history rather than duplicated in the current tree. Currently 163 files (six older source ZIPs, five older PPTX and five older PDF files, and 147 original-nine/course/proposal/report/fundraising/marketing/training/business DOCX/PDF/source archives) are restored automatically before dev/start/check/build via `artifact-registry.json`. Their downloadable paths are unchanged. Local Git objects are preferred; the GitHub CLI is the remote fallback. Do not change an older archive without updating the registry. All pinned downloads have SHA/byte-size verification and automatic missing-file restoration; each new distribution batch is pushed before pinning. Standard full clones restore from local Git objects; shallow clones may require fetching history or authenticated GitHub CLI access. No successful GitHub release upload is claimed.

## Checks

- `npm run check:templates`: registry, publication gates and SHA manifests, including shared document kit.
- `npm run test:document-batch`: gallery, nine geometries, 90-page fit, editable exports, mobile, offline sources, model arithmetic and real edited Word rendering.
- `npm run test:template-office`: all 55 originals rendered with real LibreOffice core at the expected page counts.
- `npm run test:pantry-cache`: old-cache migration without deleting unrelated caches or personal storage.
- Individual earlier cases retain their own `test:<case>` scripts.

Office tests require Node 22.19+ and `@deepseek-ai/libreoffice-kit` installed in ignored `.cache/office`, or `OFFICE_KIT_MODULE` pointing to its `lib/index.js`. No Microsoft Word GUI verification is claimed. Tests use local port 5174 by default. Rebuild scripts reproduce their exported artifacts. Browser/runtime dependencies are declared in this package.

## 50-case expansion — course batch completed

Forty of the 50 additional cases are complete (six courses, six proposals, six reports, five fundraising speeches, six marketing documents, six training documents and five business-planning documents); 10 remain planned. Open `/templates.html?format=文档&batch=course-expansion`. The original nine-document collection remains nine cases. All previous 15 cases remain available, bringing the gallery to 55 cases (54 published, one SWATCH draft). The revised total target is 65: existing 15 plus 50 additional—not 50 including the old nine.

Six courses: QUESTION LAB (inquiry tree), STORY WORKSHOP (manuscript annotations), VISUAL LITERACY (image/analysis comparison), PROJECT STUDIO (task board), DEBATE ROOM (argument mapping), SELF-PACED ROUTE (branching route). Each has ten substantive pages, five images, one new hero and four curated assets. Worksheet cells are editable, persist per case and export in current DOCX/HTML/JSON. Native Word has six different content orders and appropriate native record tables; image assets remain raster. Original and edited copies rendered to ten pages each in real LibreOffice.

`npm run build:course-expansion` and `npm run test:course-expansion` reproduce and check this batch. `/atelier/inquiry-kit/download.html` assembles six Word and six PDF originals in the browser; the ZIP was unpacked and all entries checked against actual originals. `docs/DOCUMENT-EXPANSION-50.md` records all 50 distinct frameworks and honest progress.

For future artifact updates: rebuild, check, force-add any ignored regenerated exports, commit and push their actual bytes first. Only then run `npm run pin:artifacts -- case-id ...` and commit/push the resulting registry/ignore changes. This helper refuses unpushed or mismatching bytes and never removes local download files. Do not run it on an uncommitted export or claim pinning alone created a backup. Current cumulative snapshot content is approximately 115.48 MiB; audit it before each further batch.

## Proposal batch completed

Open `/templates.html?format=文档&batch=proposal-expansion` for PILOT CHARTER, SERVICE BLUEPRINT, PARTNERSHIP CANVAS, RESEARCH COMMISSION, CHANGE CASE and CREATIVE TREATMENT. Six genuinely different frameworks: stage gates, service lanes, bilateral partnership panels, a research scoping ledger, current/target/dependency comparisons and an editorial creative treatment. Each has ten pages/five distinct illustrations (one new + four curated), real native editable Word tables and headings, PDF and an offline source archive.

`/atelier/proposal-kit/download.html` builds a six-Word/six-PDF ZIP locally in the browser from actual originals. `npm run build:proposal-expansion` and `npm run test:proposal-expansion` reproduce/check the batch. Optional source/image preparation: install Pillow (`python3 -m pip install --target .cache/expansion-python pillow` from the repository root), then run `python3 design-buddy-home/scripts/prepare-proposal-expansion.py`. Its authored JSON is checked in; existing primary heroes are valid fallbacks when the ignored generation cache is absent. Regenerating image derivatives or export bytes requires deliberate manifest and artifact-registry updates.

Browser and native Word structures are independently checked: all six geometries and all six native image/prose/table orders differ. The original Word XML must equal the family generator output. This also fixes the earlier course original-builder reference so its native originals now match the inquiry-kit implementation used by current edited exports. Previous versions remain in Git history. Fictional proposal scenarios do not imply real research, permissions, appointments, partnerships or production commitments.

The original nine-document collection, six-course collection, full-library native filters and local workspace state are preserved. Regression totals now derive from catalog metadata instead of requiring a manual hardcoded count change on every batch.

Final proposal checkpoint: all 27 original Office files rendered with real LibreOffice at their expected page counts; all six proposal originals and six edited copies were ten pages. Old six-case suites, nine-document suite, course suite, proposal suite, poisoned-cache migration, integrity and production build pass. All 52 pinned artifacts passed a missing-file cold restore; SHA/byte-size verification and a real remote proposal Word blob fetch pass. Export source commit: `3c373411bfd6e3a61d55afa7c04ee4714dc98d75`. Cumulative non-ignored patch content: approximately 111.05 MiB. The pin helper currently targets document families; earlier presentation distribution pins require the same explicit pushed-blob verification workflow when regenerated.

## Report batch completed

Open `/templates.html?format=文档&batch=report-expansion` for EVIDENCE REVIEW, EXPERIMENT READOUT, OPERATIONS REVIEW, INTERVIEW SYNTHESIS, LANDSCAPE SCAN and DECISION AUDIT. Each report has ten authored pages/five distinct illustrations, native editable Word, PDF, complete synthetic-source CSV/JSON, provenance and file:// offline source. Six new heroes plus 24 curated placements, not thirty newly generated artworks.

The six structures differ: source-register review, denominator-led experiment readout, flow/balance operations ledger, overlapping qualitative code synthesis, capability matrix landscape and decision-time version audit. Dedicated source-summary panels remain fixed while analyst records and prose are edited; the originals do not silently recalculate. Update sources and rebuild to change the model. Actual source files are included in offline ZIPs, while current HTML/Word preserve the model summaries and current edits. Long edits can reflow and private notes travel in current exports.

`/atelier/report-kit/download.html` assembles six Word and six PDF originals entirely in the browser; all twelve entries are actually checked against originals. `npm run build:report-expansion` and `npm run test:report-expansion` reproduce and verify the batch. The test also invokes `verify-report-models.mjs`: CSV/JSON round trips, inclusion roles, 24 task rows/17 completions with completed-only time summaries, 10+268−259=19 balance reconciliation, six invented extracts/nine overlapping tags, 15 flags/24 matrix cells and V3 decision-time boundaries. No real experiments, operational outcomes, interviews or market findings are claimed.

All 33 original Office exports were rendered with real LibreOffice at their expected page counts in this checkpoint. All four document batches, older case suites, native gallery and cache regression pass. Six report geometries, six native block orders, original XML/generator equality, record-cell persistence, source downloads, 390px mobile, current exports and file:// Word were exercised. Six edited report Word files render to ten pages each; this is not Microsoft Word GUI verification.

The gallery now requests uncached service-worker updates and messages an already-installed waiting worker to activate; it never reloads the page or erases personal work/caches. The legacy-worker fixture waits for the initial installation to settle before replacing it, avoiding a synthetic two-installer race. Cache migration and exact offline work reloads pass without deleting unrelated caches.

Optional image/source preparation: install Pillow to ignored `.cache/expansion-python`, then run `python3 design-buddy-home/scripts/prepare-report-expansion.py` from the repository root. Authored JSON and deterministic datasets are checked in; existing heroes are valid fallbacks when the ignored generation cache is absent. Regeneration requires updating manifests and committing/pushing actual export bytes before repinning.

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
