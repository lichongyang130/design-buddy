# Authored collection recovery incident

## Observed state, 2026-10-29

The resumed workspace was clean at `1b70a3e5`, not the previously delivered authored collection. The original `public/atelier/` directory, gallery implementation, generated illustrations, export artifacts and case tests are absent. Restarting Vite succeeded, but HTTP 200 did not establish that the correct product state had been restored.

Expected last delivery, from this conversation (not currently verified or available):

| Case | Pages | Independent main art | Last delivered status |
| --- | ---: | ---: | --- |
| MEASURE | 32 | 16 | Published |
| CORNER LIBRARY | 32 | 16 | Published |
| FOOTFALL | 32 | 16 | Published |
| AFTER HOURS | 32 | 16 | Published |

AFTER HOURS used dark navy, emerald and burgundy environmental backgrounds. Earlier three cases were not restyled. Total expected delivery: 4 of 56 cases, 128 pages, 64 primary illustrations. These are recovery targets, not claims about files present now.

## Recovery searches performed

- Local status, log, reflog, unreachable Git objects and workspace/tmp searches: no authored case source or assets found.
- Fetched current remote branch `arena/057d7bba-design-buddy`: tip `14e20500209e8be3479f41f4b7463f4fd92f6a7b` (2026-10-27). It contains legacy catalog work, not `public/atelier/`.
- Inspected remote `arena/defb7574-design-buddy` without switching branches: no authored collection directory found.
- Connected Drive filename search for the case source archives/names and upgrade document: no matching files found.
- Did not merge the legacy catalog, force-push, delete sources, reset user storage or claim reconstructed pictures are recovered originals.

The exact cause of the missing workspace snapshot is not established. Platform snapshot history is not accessible through the available tools. The prior conversation and its image previews are evidence of work, not recoverable binary files.

## Current safeguards

The template page displays an explicit recovery notice rather than initializing the legacy catalog. Other source files and user work storage remain unchanged. `npm run check:templates` verifies the four cases' source metadata, 16 distinct JPEGs per case, viewer files and export signatures. `prebuild` blocks publishing an incomplete legacy checkout. Failure is intentional while recovery is unresolved. The guard is not a substitute for browser, offline, editing or real Office tests.

## Required recovery

Obtain the workspace snapshot from immediately after the AFTER HOURS publication turn, or the four original `*-source.zip` archives and separate original PDF/PPTX exports. Restore primary art and authored source first; do not generate replacement pictures and call them originals. Source ZIPs intentionally did not bundle original Office/PDF binaries; restore them separately or regenerate from the recovered original builder scripts.

After recovering the original gallery and cases, restore the template entry point from the recovered version (normally `/src/rebuilt-library.js` and its CSS), run `npm run check:templates`, all four browser suites, old-worker/offline regressions and real Office conversion. Then build and verify public/dist byte consistency. Preserve a verified Git checkpoint and a confirmed independent artifact backup before presenting the collection as recovered.

## Subsequent user decision

The user subsequently authorised starting a new reference-led collection. See `NEW-TEMPLATE-PLAN.md`. The former incident-only notice/check is superseded by the new catalog and its SHA-256 integrity check; it no longer requires the four unavailable originals before allowing an honestly labelled new draft. The original incident facts and unrecovered status above are retained as history, not a statement that recovery succeeded.
