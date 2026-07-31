# Project Constellation — Development Log

This file tracks work on the **Explore** feature (a.k.a. "Project Constellation" /
VedCode's GitHub repo explainer + visualizer — `src/app/explore/page.tsx` and
everything under `src/components/galaxy/`, `src/lib/constellation/`).

**How to use this file:** append a new dated section at the **top** (reverse
chronological — newest first) each time work resumes on this feature. Keep the same
structure: what was covered, bugs found/fixed with root causes, known limitations,
and next steps. Don't rewrite history — older sessions stay as-is below.

---

## 2026-07-31 23:44 IST — Session: hardening the Explore pipeline end-to-end

### What this session covered
Picked up mid-flight: a hierarchical DAG renderer (`ConstellationGraph.tsx`) had
just replaced the older radial "Solar System" view (`GraphCanvas.tsx`, which is
still used elsewhere by the Document Explainer's concept map, so it wasn't deleted).
From there this session went through the whole pipeline — GitHub fetch → AST/regex
analysis → import resolution → layout → rendering → per-file AI explain — fixing
real bugs surfaced by live testing against real repos (a Next.js/TS repo and a
Python/FastAPI repo), not just static review.

### Bugs found and fixed (in the order they came up)

1. **Runtime `TypeError: Cannot read properties of null (reading 'ox')`** in
   `ConstellationGraph`'s drag-to-pan `onMouseMove`. The updater passed to `setT`
   read `dragOrigin.current` *inside* the state-updater closure, which React invokes
   later during the batched render phase — not synchronously. A `mouseup` firing in
   between (fast drag-release) could null the ref before the updater actually ran,
   even though the `if (!dragOrigin.current) return` guard had already passed.
   **Fix:** snapshot `dragOrigin.current` into a local `const` before it's captured
   in the closure.

2. **Dead code / duplicated pan-zoom logic.** `src/lib/hooks/useZoomPan.ts` had the
   exact same bug and was never actually imported anywhere — `ConstellationGraph`
   had reimplemented the same drag/zoom logic inline instead of using it.
   **Fix:** fixed the bug once in the hook, then refactored `ConstellationGraph` to
   consume it instead of maintaining a second copy.

3. **Server-side cache leak.** `handleClear()` ("New Repo" button) cleared local
   React state and localStorage but never told the server to free its session —
   every click leaked an entry in the in-memory `constellationCache` /
   `fileContentCache` Maps for the life of the process.
   **Fix:** `handleClear` now also fires `DELETE /api/explore/upload`.

4. **Silent repo-size truncation.** Repos over the 200-file analysis cap were
   silently cut off with no indication. **Fix:** `githubFetcher.ts` now reports
   `truncated` / `eligibleCount`; threaded through the upload response into
   `ConstellationStats` and surfaced as a banner on the Explore page.

5. **`UploadPanel`'s `defaultUrl` staleness** — the input's initial state could miss
   the localStorage-cached URL on first client render. **Fix:** guarded `useEffect`
   sync (only fills in while the field is still empty, never clobbers user input).

6. **Pre-existing lint error** in `useZoomPan.ts`: `tRef.current = t` was being
   mutated directly in the render body (`react-hooks`/React Compiler correctly
   flags mutating a ref during render as unsafe). **Fix:** moved into a `useEffect`.

7. **File/module classification too narrow — most nodes fell into "Other."**
   Both the client (`classifyType` in `ConstellationGraph.tsx`) and server
   (`classifyNode` in `astParser.ts`) classifiers were shaped almost entirely
   around Next.js conventions (`components/`, `api/`, `hooks/`, `actions/`).
   Anything from a different layout — Go's `pkg/`/`internal/`, MVC's
   `controllers/`/`models/`, generic `views/`/`widgets/`/`entities/` — had nowhere
   to land. Also found the client mapped `/db/` files to `"lib"` while the server
   correctly called them `"schema"` — a real inconsistency.
   **Fix:** broadened both classifiers' regexes to cover these conventions and
   fixed the `/db/` mismatch.

8. **Import resolution didn't understand TS path aliases at all** (e.g. `@/lib/foo`
   — literally how every internal import in *this* codebase, and most modern TS
   repos, is written). The resolver only handled `./relative` imports; anything
   else was silently discarded. On an aliased repo this meant almost none of the
   real edges existed — the graph looked arbitrary because most of the actual
   dependency structure was never represented, not because it wasn't there.
   **Fix:** `githubFetcher.ts` now also fetches the repo's `tsconfig.json` /
   `jsconfig.json`; `astParser.ts` parses its `compilerOptions.paths` and resolves
   aliased imports against it (best-effort JSONC comment-stripping, fails soft to
   "no aliases" on a parse error).

9. **Edges carried no explanation on hover.** **Fix:** added an SVG `<title>`
   tooltip (`"A imports B"`) via a wider invisible hit-area path, since the visible
   1–2px stroke is too thin to hover reliably.

10. **Outer graph container silently clipped, not "unscrollable."** The app shell
    (`WorkspaceLayout.tsx`) already sizes page content correctly via
    `flex-1 min-h-0` inside `overflow-hidden` ancestors, but `explore/page.tsx`
    ignored that and hardcoded `height: calc(100vh - 190px)` — a guess at the
    header's height that goes stale the moment the header's *real* height changes
    (e.g. a new banner line). The overshoot then got silently clipped by the
    shell's `overflow-hidden` with nothing to scroll to recover it.
    **Fix:** removed the magic number; content row is now `flex-1 min-h-0`, sized
    correctly by flexbox regardless of header height.

11. **Interaction model changed from click to hover** (explicit user request):
    hovering a node now shows the Blast Radius panel and highlights its
    upstream/downstream edges; clicking now purely opens the file (`FileExplainSheet`
    / `PreFlightGateway`), with no local "selected" state left. Since the panel sits
    away from the node, a plain `onMouseLeave` would hide it mid-transit — added a
    150ms grace-period timeout, cancelled by re-entering either the node or the
    panel itself.

12. **Python (and other dotted-namespace-language) imports were being silently
    dropped**, which is why a real Python/FastAPI repo showed almost every file as
    a fully isolated node with zero connections. The regex-based analyzer filtered
    import strings down to only those starting with `.` or `/` — but Python's
    dominant style is absolute dotted imports (`from app.core.config import
    settings`), which don't start with either. Same root cause class as bug #8, for
    a different language family (also affects Java/Kotlin/C#/Scala's dotted names
    and Rust/C++'s `::` namespacing).
    **Fix:** stopped discarding non-path-shaped imports (external packages are
    filtered out naturally downstream — they just never match a real file, so
    nothing extra needs to reject them here); added dot/`::`→`/` conversion; since
    the converted candidate is relative to wherever the package root actually sits
    (not necessarily the repo root — e.g. `app.core.config` needing to match
    `backend/app/core/config.py`), added a path-suffix match as a fallback when the
    exact match misses.

13. **Blast panel showed two different numbers under the same "Imports" label** —
    top metrics strip showed `rfData.importCount` (raw import statements including
    third-party packages), the section below showed `upstream.length` (resolved
    local edges only). Both said "Imports," so an 8 next to a 0 read as a flat
    contradiction rather than two different measurements.
    **Fix:** consolidated to one canonical number — the top strip now shows the
    exact same `upstream.length` / `downstream.length` used in the breakdown below.

14. **Blast panel positioned top-right, covering graph edges** (user request).
    **Fix:** moved to bottom-center (`bottom: 14, left: 50%, translateX(-50%)`),
    clear of the Legend (bottom-left) and Zoom Controls (bottom-right).

15. **File-content 404 for files with unusual paths (e.g. containing spaces).**
    JS/TS files are analyzed via ts-morph, and the node's canonical `filePath` was
    derived from `sf.getFilePath()` — ts-morph's own internal virtual-filesystem
    path, round-tripped through its own standardization logic — instead of the
    exact string the file was fetched under. Any disagreement there (a space
    being the likely trigger) meant the sidebar/graph node carried a path that no
    longer matched the key in `fileContentCache`, so `/api/explore/file` 404d even
    though the file was fetched fine.
    **Fix:** iterate `tsJsFiles`'s own keys and look up each source file via
    `project.getSourceFile(filePath)`, so the `filePath` used everywhere (node
    identity, sidebar, click handler, cache lookup) is always byte-identical to
    what was actually fetched — never ts-morph's re-derived version.

16. **Legend / zoom controls visibly bleeding through `FileExplainSheet`.** Confirmed
    via screenshot — not just the legend, the zoom controls too.
    `ConstellationGraph`'s internal overlays use z-index 200–300, chosen only to
    layer correctly *within* the graph. `FileExplainSheet` is a `position: fixed`
    overlay at Tailwind's `z-50`. Since the graph's container never established its
    own stacking context, those values competed directly in the page's *global*
    stacking order and won.
    **Fix:** added `isolation: "isolate"` to the graph's root container — contains
    all of its internal z-index values inside its own stacking context permanently,
    so nothing inside it can bleed above a sibling overlay again regardless of the
    specific numbers on either side.

17. **Session ID reuse across concurrent analyses → cross-tab cache clobbering.**
    `upload/route.ts` reused the existing `constellation-session` cookie's value if
    one was already set. Cookies are shared across every tab on the same domain —
    analyzing a *second* repo in another tab silently overwrote the *first* tab's
    cached files under the same session key. The first tab, still showing its
    original (unrelated) graph, then 404d on files that genuinely exist in the repo
    it's displaying, because the cache slot now held a different repo's files.
    **Fix:** always mint a fresh `crypto.randomUUID()` per successful analysis,
    never reuse an existing cookie value.

18. **"No project loaded" immediately after a successful analysis.** Not a logic bug
    in the read/write code (verified both were correct) — caused by Next.js
    dev-mode Fast Refresh. Every edit to a file in `cache.ts`'s dependency graph
    (which we were doing continuously this session — `astParser.ts`,
    `upload/route.ts`) re-evaluates that module and everything importing it,
    silently recreating its module-level `Map`s empty and orphaning every
    previously-cached session.
    **Fix:** pinned both Maps to `globalThis` in `cache.ts` instead of plain module
    scope — survives module re-evaluation within the same Node process, so the
    cache now only resets on an actual server restart.

### Known limitations / not yet fixed
- The in-memory cache (`cache.ts`) still won't survive a real production/serverless
  deploy — separate instances don't share memory, `globalThis` only helps within a
  single process. Would need real persistence (this codebase already has Postgres +
  drizzle wired up elsewhere, e.g. `fileNodes` / `architectureMetrics`) if/when this
  ships beyond local dev.
- Suffix-matching for dotted-namespace imports (bug #12) is a heuristic, not real
  import resolution — it can produce a false-positive edge if two different local
  files share the same trailing path segments under different package roots. Rare
  in practice at the ≤200-file analysis scale, but worth knowing.
- `public/image.png` and `public/image copy.png` are debug screenshots that ended
  up sitting untracked in the repo from this session's back-and-forth. Not
  committed — worth deleting or moving out of `public/` if they're not needed.
- Rust's own local-module resolution (`crate::foo::bar`-style) isn't specifically
  handled beyond the generic `::`→`/` conversion; same for PHP's `\`-namespaced
  `use` imports.

### Architecture snapshot (as of this session)
```
UploadPanel (URL input)
  → POST /api/explore/upload
      → githubFetcher.ts   : parse owner/repo/branch, pull file tree via Git Trees
                              API, batch-fetch blobs (≤200 files, ≤100KB each,
                              20+ languages) + tsconfig/jsconfig.json for aliases
      → astParser.ts       : ts-morph AST for TS/JS; regex heuristics for the rest.
                              Import resolution now understands: relative paths,
                              TS path aliases, and dotted/`::`-namespaced imports
                              (Python/Java/Kotlin/C#/Scala/Rust) via suffix match.
      → layout.ts           : radial "Solar System" layout (still used by the older
                               GraphCanvas.tsx, which Document Explainer's concept
                               map depends on)
      → graph-layout.ts     : deterministic DAG layering (used by ConstellationGraph)
      → DB enrichment       : stress/coupling/churn scores from fileNodes /
                              architectureMetrics, red-alert cascade highlighting
      → constellationCache / fileContentCache (in-memory Maps on globalThis,
        keyed by a fresh-per-analysis session cookie)
  ← { nodes, edges, stats }
ConstellationGraph (hover → Blast Radius panel + edge highlight, click → open file)
  + FileTreeSidebar + FileExplainSheet (per-file AI walkthrough via Bedrock Nova,
    /api/explore/explain) + PreFlightGateway (warns before opening high-stress files)
```

### Where we're heading
No open feature request at the close of this session — the last few rounds were
bug-driven from live testing (a Next.js repo, then a Python repo). Natural next
targets, roughly in order of likely impact:
1. Decide whether the in-memory cache needs real persistence before this goes
   beyond local dev/demo use.
2. Test against a broader spread of languages/layouts (Go, Java/Kotlin, Rust) now
   that the classifier and import resolver both cover them — the Python fix was
   verified against a real repo, the others weren't yet.
3. Clean up the untracked debug screenshots in `public/`.
