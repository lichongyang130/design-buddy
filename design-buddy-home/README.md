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

See [NEW-TEMPLATE-PLAN.md](NEW-TEMPLATE-PLAN.md) for the complete 56-case target, current 14-published/1-draft status, frameworks, validation and remaining limits. SWATCH remains an honest draft, not a completed case.

## Artifact preservation

Primary art, new source archives, exports and manifests are in Git. Six older duplicate source ZIPs are restored automatically before dev/start/check/build from SHA-pinned, already-pushed Git history via `artifact-registry.json`. Their downloadable paths are unchanged. Local Git objects are preferred; the GitHub CLI is the remote fallback. Do not change an older archive without updating the registry. A missing-file restoration and remote blob-byte verification have both been tested. No successful GitHub release upload is claimed.

## Checks

- `npm run check:templates`: registry, publication gates and SHA manifests, including shared document kit.
- `npm run test:document-batch`: gallery, nine geometries, 90-page fit, editable exports, mobile, offline sources, model arithmetic and real edited Word rendering.
- `npm run test:template-office`: all 15 originals rendered with real LibreOffice core at the expected page counts.
- `npm run test:pantry-cache`: old-cache migration without deleting unrelated caches or personal storage.
- Individual earlier cases retain their own `test:<case>` scripts.

Office tests require Node 22.19+ and `@deepseek-ai/libreoffice-kit` installed in ignored `.cache/office`, or `OFFICE_KIT_MODULE` pointing to its `lib/index.js`. No Microsoft Word GUI verification is claimed. Tests use local port 5174 by default. Rebuild scripts reproduce their exported artifacts. Browser/runtime dependencies are declared in this package.
