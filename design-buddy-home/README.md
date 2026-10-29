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

See [NEW-TEMPLATE-PLAN.md](NEW-TEMPLATE-PLAN.md) for the current 65-case target, current 37-published/1-draft status, frameworks, validation and remaining limits. SWATCH remains an honest draft, not a completed case.

## Artifact preservation

Primary art, source, manifests and completed export bytes are backed up in Git. Distribution files can be stored in SHA-pinned, already-pushed immutable Git history rather than duplicated in the current tree. Currently 85 files (six older source ZIPs, five older PPTX and five older PDF files, and 69 course/proposal/report/fundraising DOCX/PDF/source archives) are restored automatically before dev/start/check/build via `artifact-registry.json`. Their downloadable paths are unchanged. Local Git objects are preferred; the GitHub CLI is the remote fallback. Do not change an older archive without updating the registry. All pinned downloads have SHA/byte-size verification and automatic missing-file restoration; each new distribution batch is pushed before pinning. Standard full clones restore from local Git objects; shallow clones may require fetching history or authenticated GitHub CLI access. No successful GitHub release upload is claimed.

## Checks

- `npm run check:templates`: registry, publication gates and SHA manifests, including shared document kit.
- `npm run test:document-batch`: gallery, nine geometries, 90-page fit, editable exports, mobile, offline sources, model arithmetic and real edited Word rendering.
- `npm run test:template-office`: all 38 originals rendered with real LibreOffice core at the expected page counts.
- `npm run test:pantry-cache`: old-cache migration without deleting unrelated caches or personal storage.
- Individual earlier cases retain their own `test:<case>` scripts.

Office tests require Node 22.19+ and `@deepseek-ai/libreoffice-kit` installed in ignored `.cache/office`, or `OFFICE_KIT_MODULE` pointing to its `lib/index.js`. No Microsoft Word GUI verification is claimed. Tests use local port 5174 by default. Rebuild scripts reproduce their exported artifacts. Browser/runtime dependencies are declared in this package.

## 50-case expansion — course batch completed

Twenty-three of the 50 additional cases are complete (six courses, six proposals, six reports and five fundraising speeches); 27 remain planned. Open `/templates.html?format=文档&batch=course-expansion`. The original nine-document collection remains nine cases. All previous 15 cases remain available, bringing the gallery to 38 cases (37 published, one SWATCH draft). The revised total target is 65: existing 15 plus 50 additional—not 50 including the old nine.

Six courses: QUESTION LAB (inquiry tree), STORY WORKSHOP (manuscript annotations), VISUAL LITERACY (image/analysis comparison), PROJECT STUDIO (task board), DEBATE ROOM (argument mapping), SELF-PACED ROUTE (branching route). Each has ten substantive pages, five images, one new hero and four curated assets. Worksheet cells are editable, persist per case and export in current DOCX/HTML/JSON. Native Word has six different content orders and appropriate native record tables; image assets remain raster. Original and edited copies rendered to ten pages each in real LibreOffice.

`npm run build:course-expansion` and `npm run test:course-expansion` reproduce and check this batch. `/atelier/inquiry-kit/download.html` assembles six Word and six PDF originals in the browser; the ZIP was unpacked and all entries checked against actual originals. `docs/DOCUMENT-EXPANSION-50.md` records all 50 distinct frameworks and honest progress.

For future artifact updates: rebuild, check, force-add any ignored regenerated exports, commit and push their actual bytes first. Only then run `npm run pin:artifacts -- case-id ...` and commit/push the resulting registry/ignore changes. This helper refuses unpushed or mismatching bytes and never removes local download files. Do not run it on an uncommitted export or claim pinning alone created a backup. Current cumulative snapshot content is approximately 124 MiB; audit it before each further batch.

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
