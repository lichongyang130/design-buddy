# Real file tools and skill packages

## Entry points and data flow

Open **Skills** and select an Excel, Word, PDF or accessibility card, or use the file-tool shortcuts above the run panel. **Import plugin package** opens a separate package manager. Home-page calls to these file skills open the same workbench without charging a synthetic generation task. Old saved names and enabled records remain intact.

All file parsing and generation happens in the browser. File bytes are not sent to a backend or third-party service. Parser code, PDF workers, CMaps, fonts and WASM are served from this application. `prepare-file-skill-assets.mjs` copies the PDF assets and license from the locked npm dependency before build/dev. Exact-request service-worker caching now includes these local vendor assets; an asset must have been visited/cached before it can work offline.

## XLSX

ExcelJS loads actual `.xlsx` files, lists worksheets, shows a paged grid, edits addressed cells and writes a new Office Open XML workbook. Text is never implicitly interpreted as a formula. The editor has explicit text, number and formula modes. Basic imported styles and formulas are preserved in regression fixtures; formulas are **not calculated in the browser**. Excel is requested to recalculate the exported workbook.

The preview displays up to 40 rows and 30 columns at a time. Cells outside that preview can be addressed explicitly, within the supported bounds. Maximum input is 15 MB, declared ZIP expansion 60 MB, 40 sheets, 100,000 populated cells, 100,000 rows and 1,000 columns per sheet. A dedicated worker has a 30-second operation timeout and is terminated when the tool closes. Macro packages, external workbook-link parts and external/oversized formulas are rejected. ZIP headers are preflighted; these limits are not a claim of a formally verified hostile-archive sandbox.

This is not the complete Excel application. Chart, pivot, macro and arbitrary complex-workbook fidelity are not promised. Keep the original file. CSV text analytics remain available to old text-only API callers; they are not presented as having read an uploaded workbook.

## PDF

PDF.js reads actual PDF bytes. It extracts each page's text layer, retains page numbers and outline data, renders a selected page to canvas and exports a JSON report. Password input is transient and cleared before parsing. Limits: 20 MB, 200 pages, 2 MB of extracted text and bounded preview/image dimensions. JavaScript evaluation and XFA are disabled; no PDF actions or annotation scripts are executed.

Pages with no extracted text are marked `needsOCR`; this is a candidate flag, not proof of a scanned page (blank pages also have no text). **OCR, arbitrary PDF editing, redaction and signing are not implemented.** Reading order and typography in extracted text may differ from the visual page. Legacy text-pagination helpers remain distinct from the new file parser.

## DOCX

`docx` generates a real zipped OOXML `.docx`, with document XML, relationships and content types. Markdown headings, paragraphs, bold/italic runs, basic ordered/unordered lists, links, code and tables are mapped to native Word structures. HTML is treated as text; external images are represented by text references, not fetched or embedded. Input is limited to 300,000 characters and 12,000 parser tokens. Complex Markdown/nested-list fidelity and arbitrary embedded media are not promised.

The stable `Word 文档处理` runtime name now returns an asynchronous native DOCX result. Consumers should `await runSkill`. The old exported HTML `.doc` helper is retained only for compatibility, not used by the upgraded skill.

## Browser accessibility and keyboard evidence

DOMPurify sanitizes submitted HTML. An iframe with `sandbox="allow-scripts"` (without same-origin privileges) and a nonce-based CSP renders it. User scripts, event handlers, external stylesheets, embedded frames, form submissions and external requests are blocked; links cannot navigate the preview. Only the application's injected axe-core and reporting code can run. Input limits are 200,000 characters and 3,000 DOM nodes; automatic audits time out after 20 seconds.

Axe-core runs WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules against the **rendered sanitized preview**. Reports retain violations, affected selectors, incomplete checks and the tested engine version. Trusted browser Tab/Shift+Tab events record focus traversal; synthetic key events are ignored. Esc returns focus to the host control. The manual verdict defaults to untested; choosing pass/fail requires at least two recorded Tab events. That is user-declared evidence, not proof that the complete keyboard workflow passed.

This is **not WCAG certification**. Scripts and remote assets are intentionally absent, so the audit does not test a deployed application's dynamic behaviour or all contrast/focus states. Screen-reader testing, manual checks and applicable conformance review remain necessary.

## Real declarative plugin installation

A `.dbskill.json` package contains a manifest **and an executable instruction program**, not merely a display name. Installation:

1. Parse and validate the package, engine, exact dependency and permission schema.
2. Show the name, old/new versions, engine, dependency, permissions and SHA-256 digest.
3. Require explicit consent every time, including upgrades. Closing the dialog cancels.
4. Store the actual normalized package and receipt transactionally in a separate IndexedDB database.
5. Run the stored program only after checking its digest. Reloading preserves installation; uninstall removes the package and receipt.

The initial engine is deliberately limited: `db-text-v1`, dependency `db-text@1.0.0`, permissions `input:read` and `output:write`. Supported instructions are trim, uppercase/lowercase, prefix/suffix, **literal** replace, filter-lines and number-lines. Packages are limited to 512 KB and 50 instructions; input to 200,000 characters and output to 2 MB. Output expansion is checked before large literal replacement. Unknown instructions/dependencies/permissions and arbitrary code fields are rejected. No eval, JS imports, npm lifecycle scripts, regular-expression execution, network access, credentials or system-file access are exposed to packages.

Version upgrades are explicit; downgrades and same-version/different-content replacements are rejected. Concurrent installs recheck the stored version in the write transaction. SHA-256 covers the normalized package and detects changed content; **it is not a publisher signature or trust certification**. Bundled engine dependencies are validated locally; the application does not claim to install operating-system software or arbitrary npm packages. Installed plugins run in the package panel, not silently on the home page or in the background.

Built-in capabilities continue to use the historical `skills` storage records but are now labelled **Enable**, not external software installation. Plugin packages use their separate database and cannot overwrite those records.

## Validation

- `npm run test:file-skills`: native XLSX edit/export/reopen (multiple sheets, style and formula checks), true DOCX package/XML and browser download, two-page PDF text extraction/rendering/report, actual axe violations, trusted Tab events, blocked script/network attempts, plugin permission validation, cancellation, hostile display-name escaping, installed program execution, persistence, upgrade/downgrade and uninstall, and all five new surfaces under four language settings.
- `npm run test:creation-skills`: 18 curated outputs, native DOCX async runtime, static compatibility helpers and preservation of old enabled entries.
- `node tests/verify-settings-real.mjs`: existing 105 settings checks with corrected built-in enable terminology.
- `npm run test:ui-language`, `npm run test:ui-typography`, `npm run test:connector-focus`: UI and gateway regressions.
- `npm audit --omit=dev`: production dependency advisory check. The ExcelJS UUID dependency is overridden to patched `11.1.1`; workbook IO is regression-tested with it.

The browser tests use Chromium. They do not establish native Microsoft Excel/Word UI testing, Safari/physical-device coverage, OCR accuracy or a formal accessibility certification.
