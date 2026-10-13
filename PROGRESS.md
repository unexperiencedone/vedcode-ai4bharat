# the-archive / VedCode — Project Progress

This file has two parts:

- **Part 1 — Full Repo Feature Audit.** A living, indexed status report on every
  feature in the app: what it claims to do, what actually happens when you trace
  the code, how complete/real it is, who it's actually useful for, and whether it
  duplicates something else. **Update this part in place** when a feature changes —
  edit the relevant entry, don't append a new copy of it. The index at the top of
  Part 1 is how you find "which feature are we talking about."
- **Part 2 — Development Session Log.** A dated, append-only log of work sessions
  (bugs fixed, decisions made). Newest entry at the top of Part 2. Never rewrite old
  entries here — this is history.

Last full audit: **2026-08-01**, based on a traceback of all 160 commits and a
file-by-file read of every route/page/component in `src/app` and `src/components`.

---

# Part 1 — Full Repo Feature Audit

## Index

| # | Feature | Route(s) | Verdict | Completeness |
|---|---|---|---|---|
| 1 | Landing page | `/` | Keep (as marketing) | Polished shell, 3 broken links |
| 2 | Auth (login/register/OAuth) | `/login`, `/register` | Keep | ~90% real |
| 3 | Onboarding | `/onboarding` | Rework (dead sibling route) | ~85% real, has dead twin |
| 4 | Dashboard | `/dashboard` | Rework | ~60% real, "live" stats are fake |
| 5 | Explore / Project Constellation | `/explore` | **Keep — strongest feature** | ~85% real |
| 6 | Guard / Context Guard | ~~`/guard`~~ | **Removed** (2026-08-01) | Deleted — was LLM guessing from pasted text, no real AST |
| 7 | PreFlightGateway (Explore's stress gate) | ~~(component)~~ | **Removed** (2026-08-01) | Deleted — dead data source, never actually fired |
| 8 | `/api/preflightCheck` (Doc Explainer's "Impact Guard") | ~~tab in `/documentExplainer`~~ | **Route removed, engine relocated** (2026-08-01) | Real `CodebaseAnalyzer` parked in `src/lib/parser/analyzer.ts`, unwired, for reuse once ripple detection is rebuilt on the merged IDE |
| 9 | Compiler | ~~`/compiler`~~ (deleted) | **Merged into #10** (2026-08-01) | Its editor polish + execution mechanism now live in Workspace |
| 10 | Workspace → **Web IDE** (merged with Compiler) | `/workspace`, `/workspace/[id]` | **Fixed — the one real IDE surface** (2026-08-01) | Real persistence + real 7-language execution, now authenticated and container-sandboxed |
| 11 | Document Explainer | `/documentExplainer` | Rework | Real AI text, fake graph metrics, 3 dead sub-features |
| 12 | Handbook | `/handbook`, `/handbook/[tech]`, `/handbook/map` | Keep, needs content | Real engine, thin/empty data |
| 13 | Learn | `/learn` | Keep | Real, most sophisticated logic in the repo |
| 14 | Roadmap | `/roadmap` | Keep, needs integration | Real LLM sequencing, siloed from Learn/Handbook |
| 15 | VedCode / Knowledge Studio | `/vedcode` | Keep (Ingest/Search/Reader/Galaxy) | ~90% real, 1 of 4 tabs inert |
| 16 | Atelier | API-only, no page | **Cut (already half-cut)** | Built, shipped, then deleted |
| 17 | Vault | API-only, no page | **Cut (already half-cut)** | Built, shipped, then deleted |
| 18 | Lab / Skill Tree | API-only or nothing | **Cut** | Never had a page |
| 19 | Admin/infra routes | `/api/admin/*`, `/api/logs`, etc. | Mixed | 2 real, 3 empty stubs, 1 unauthenticated |
| 20 | Checkup | `/checkup` | Keep | Real, DB-backed |
| 21 | Manifesto / Changelog | `/manifesto`, `/changelog` | Keep (static content) | Static by design, not a bug |

Jump to a feature's full writeup by its number below.

## How I'm deciding "real" vs. "theoretical" vs. "redundant"

You asked how I'd judge whether something is too optimistic/theoretical to implement
— using the compiler as the example (claiming to be a code editor for every
language without the infrastructure to back it). Here's the concrete test I applied
to every feature, not just that one:

1. **Trace the claim to its mechanism.** Read what the UI/copy asserts, then read
   the actual code path underneath it. Is there a real algorithm/model call/DB
   query doing the work, or is the "work" a hardcoded value, a `// Dummy` comment,
   an empty catch block, or a UI element with no handler?
2. **Check the infrastructure gap.** If the claim requires something structurally
   absent from the repo (a sandboxed execution environment for "isolated sandbox
   environments," a populated import-graph cache for "ripple detection," a vector
   index for "semantic search"), that's the theoretical/optimistic case — the code
   describes the destination without having built the road. This is different from
   "incomplete" (a real mechanism that just doesn't cover every case yet).
3. **Find the actual data source.** A lot of "AI-powered" features in this repo
   trace back to a real model call — the AI is rarely fake. What's usually fake or
   missing is the **input** to that call: a hardcoded file path instead of the
   user's real target, an empty cache no one ever writes to, a DB table nothing
   populates. The AI honestly reports on garbage/empty input, which looks like a
   bug in the output but is actually a bug in the plumbing before it.
4. **Redundancy = same job, different code.** I flagged something as redundant only
   when two live, reachable code paths do the same job for the same user (e.g. four
   separate "guard/impact analysis" implementations). I did *not* flag legitimate
   reuse (e.g. Document Explainer's concept map deliberately calling Explore's own
   layout function) as redundant — that's good engineering, not duplication.
5. **Practicality per skill level** is a judgment about *who the working version of
   this actually serves*, not who the concept could theoretically serve. A beginner
   needs guided explanation and guardrails; an intermediate needs speed and
   onboarding-to-new-code tools; an advanced/expert user needs correctness, control,
   and things their own tooling (IDE, `grep`, linter) doesn't already give them
   faster. A feature that's "for everyone" in the pitch but only actually helps one
   band in practice gets rated per-band, not with one blended score.

---

### 1. Landing page (`/`, `src/components/landing/*`)

**Claims:** "Understand code. Build faster" — showcases Project Constellation,
Context Guard, JIT Learning/Mentor, and a "Knowledge Studio" grid (Doc Ingestor,
Mastery Engine, Roadmap Player, Knowledge Map).

**Reality:** Pure static marketing page, scroll-driven Framer Motion animations,
zero data fetching — which is fine, it's a landing page. Real problems: a
`console.log` left in the render path (`HeroSection.tsx:46`); nav links to `#features`
and `#docs` that don't exist anywhere in the DOM; "View Documentation" CTA points to
`/docs`, which doesn't exist (404); footer links to generic `github.com`/`twitter.com`
placeholders and a `/terms` page that doesn't exist.

**Verdict: Keep**, it's doing its job (sell the product), but fix the four dead
links before this is customer-facing — a landing page with a 404'ing primary CTA
("View Documentation") undermines the exact "professional, buttoned-up" impression
it's going for.

---

### 2. Auth — Login / Register / NextAuth (`/login`, `/register`, `src/auth.ts`)

**Claims:** Email/password + Google/GitHub OAuth sign-in and sign-up.

**Reality:** This is genuinely solid. Real bcrypt hashing (cost 12), real Drizzle
inserts, real NextAuth v5 provider config for Credentials/Google/GitHub, a real
`signIn` callback that upserts profiles by email on OAuth login. Register really
auto-logs-in and redirects to onboarding.

**Gaps:** "Forgot Password?" is a dead `href="#"` — no reset flow exists anywhere.
The Terms/Privacy checkbox on register has no state binding at all — it's decorative;
you can submit without checking it.

**Practicality:** irrelevant to skill level — this is infrastructure everyone
depends on. It's the most trustworthy piece of the whole codebase.

**Verdict: Keep.** Add a real password-reset flow before this is used by real users
who will inevitably lock themselves out.

---

### 3. Onboarding (`/onboarding` → `/api/learner/profile`)

**Claims:** A quick profile-setup quiz (experience, languages, learning style) that
personalizes the rest of the app.

**Reality:** The *live* flow is real — Zod-validated, a genuine Drizzle transaction
writes to `learnerProfile` and flips `profiles.onboardingComplete`. But there's a
**dead twin**: `PUT /api/onboarding` is a completely different, more elaborate
onboarding implementation (bio, socials, OS/IDE, hardware, avatar upload via
UploadThing) with **zero callers anywhere in the app** — confirmed by grep. Its
functionality was fully superseded by `EditProfileModal.tsx` → `POST
/api/atelier/update`, but the old route, its DB columns, and the UploadThing wiring
(`UploadButton`/`UploadDropzone`, also unused anywhere) were never deleted. Two
`console.log("DEBUG: ...")` lines and a 500ms `setTimeout` "to let the cookie
settle" (a timing hack papering over a session-refresh race) also remain in the live
path.

**Verdict: Rework.** Delete `/api/onboarding`, its now-orphaned schema columns (or
confirm `EditProfileModal` still needs them and just delete the *route*), and the
unused UploadThing components. Fix the underlying JWT/cookie race instead of
sleeping past it.

---

### 4. Dashboard (`/dashboard`)

**Claims:** "Your system is live" — active projects, live deployments, uptime,
latency, load, a learner intelligence panel.

**Reality:** The querying is real (genuine Drizzle joins across `profiles`,
`projects`, `snippets`, `portfolioWorks`, `logs`). But the headline "live system"
metrics (`activeModules`, `liveDeployments`, `uptime`, `latency`, `load`) are static
values written once by the **seed script** and never updated by any real
telemetry — `POST /api/codebases` (the only production project-creation path) never
sets them, so any real project shows zeros/defaults while seeded demo projects show
permanently frozen fake numbers under a pulsing "System Live" badge. A hardcoded
fake notification is *always* injected regardless of what's actually in the DB. The
search box only filters already-loaded project titles (not files/concepts, despite
the placeholder text claiming both); the Filters button, ⌘K hint, and per-card
Edit/Analytics/Archive icons have no handlers at all.

**Verdict: Rework.** The learner-intelligence half of this page is genuine and
worth keeping as-is. The "system telemetry" half is decorative and actively
misleading (a badge that says "Live" over numbers that cannot change) — either wire
it to something real or remove the live-system framing entirely.

---

### 5. Explore / Project Constellation (`/explore`) — my own assessment

I know this one first-hand from directly rebuilding it this session against two
real third-party repos (a Next.js/TS repo and a Python/FastAPI repo), not from a
research pass — see Part 2 for the full bug-by-bug history.

**Claims:** Paste a GitHub URL → live AST-powered dependency map, per-file AI
walkthrough, blast-radius (imports/imported-by) on hover.

**Reality:** The most fully real feature in the repo. GitHub fetching is real (Git
Trees API). Structural analysis is real: ts-morph AST for TS/JS (actual
if/switch/catch/function counting), regex heuristics for 20+ other languages.
Import resolution — hardened this session — correctly handles relative imports, TS
path aliases, and dotted/`::`-namespaced imports (Python/Java/Kotlin/C#/Scala/Rust)
with suffix-match fallback. Layout is a genuine deterministic DAG layering
algorithm, not a fake simulation. The AI file-explanation panel makes a real
Bedrock Nova Pro call with structured (Zod) output.

**Real gap found by this audit, not by me:** the "stress score" heatmap overlay
this page reads from `fileNodes`/`architectureMetrics` (Postgres) is fed by
`CodeGraphBuilder.indexCodebase()` — which, per the Dashboard/Guard research pass,
**has zero callers anywhere in the app**. So the DB-driven stress coloring in
Explore is silently inert for any repo except whatever was manually seeded; the
`redAlert`/amber/green stress-based node coloring you'd see is, in practice, always
absent. This doesn't affect the core dependency-graph rendering (which has its own
independent complexity/gravity metrics computed live from the AST, not from that
dead DB pipeline) — but the "architectural stress" *narrative* layered on top of it
is currently decorative.

**Fragility:** in-memory cache (fixed this session to survive dev-mode HMR via
`globalThis`, but still won't survive a real multi-instance production deploy — see
Part 2, bug #18's note); no caching of AI explanations, so re-opening a file
re-spends real Bedrock tokens; 200-file/100KB analysis cap (now surfaced to the
user, previously silent).

**Practicality:**
- **Beginner** — high value. "Help me understand a codebase I've never seen" plus a
  visual "don't touch this file casually" intuition from the blast-radius view is
  exactly the tool a junior needs when landing on an unfamiliar repo.
- **Intermediate** — medium-high. Genuinely useful for onboarding onto a new job's
  codebase; less useful once you already know the repo.
- **Advanced/expert** — low-medium. An expert can usually get "what imports this"
  faster from their own IDE for a repo they own. The real niche is triaging an
  unfamiliar OSS repo before contributing — real, but narrower.

**Verdict: Keep — this is the feature to point to as proof the underlying
architecture (multi-language AST/regex analysis, real AI grounding, real dependency
resolution) works.** Before this goes further: (a) real persistence for the cache
(Postgres, already used everywhere else in this codebase, is right there), (b) cache
AI explanations per file/content-hash to control cost, (c) either wire up
`CodeGraphBuilder.indexCodebase()` for real or strip the now-inert stress overlay so
it's not silently misleading.

---

### 6–8. Guard / Context Guard / PreFlightGateway / preflightCheck — RESOLVED 2026-08-01

This audit originally found **four separate, non-communicating implementations**
of "warn about the impact of a change," none of which shared code with each other
or with Explore's own graph. As of the 2026-08-01 session, three are deleted and
the fourth's real logic is intentionally parked, not wired to anything:

| | Route/component | What it did | Resolution |
|---|---|---|---|
| 6a | `/guard` → `/api/guard` | Pasted a diff into a textarea, asked Mistral Large to *invent* a JSON ripple report. UI copy claimed "AST dependency tracing" — there was no AST parsing or codebase access at all. | **Deleted.** Page, route, and nav links (`ClusterRail.tsx`, `WorkspaceLayout.tsx`, `TabProvider.tsx`) all removed. |
| 6b | `/api/preflightCheck` ("Impact Guard" tab in Document Explainer) | Used a **real** ts-morph `CodebaseAnalyzer` to find genuine ripple effects — but the caller hardcoded `filePath: "src/app/page.tsx"` regardless of what the user pasted. Real analysis, wrong target, every time. | **Route deleted, engine kept.** The "Impact Guard" tab is gone from `DocReadingMode.tsx`. `CodebaseAnalyzer` (`src/lib/parser/analyzer.ts`) is real, working code — left intact with a parking comment explaining it's earmarked for reuse once ripple detection gets rebuilt against the merged IDE's real file source (`projectFiles`) instead of `process.cwd()`'s on-disk tree. |
| 6c | `PreFlightGateway` (Explore's stress-score gate) | Read real `fileNodes`/`architectureMetrics` tables that nothing populates (same dead `CodeGraphBuilder` pipeline as #5's gap). Its own code comment admitted it was a demo shortcut that would bypass in a real app. | **Deleted.** Component and its call site in `explore/page.tsx` (state, the `getFileMetrics` gating call, the JSX render) all removed. Explore's own click-to-open-file flow is otherwise untouched. |
| 6d | `src/lib/agents/guard.ts::preflightCheck()` | A fourth implementation, OpenAI `gpt-4o`-based. Zero callers anywhere. | **Deleted.** Confirmed zero references before removal. |

**Current state:** zero live "guard/impact" surfaces. The one piece of real,
reusable logic (`CodebaseAnalyzer`) is intact and documented but deliberately
unwired — rebuilding ripple/change-impact detection on top of it is explicitly
deferred to a future session, once the merged IDE (see #9–10 below) is solid.

---

### 9–10. Compiler + Workspace → merged Web IDE — RESOLVED 2026-08-01

This was the feature you specifically flagged as the theoretical-vs-real example
(claiming an in-browser editor "for every language" without the infrastructure to
back it), so it got the deepest trace, and the deepest fix.

**What this cluster looked like before the merge:** two independently-built,
partial editors. Compiler (`/compiler`) had a real Monaco editor and real
execution — actual `child_process.spawn()` of the *host machine's own* compilers
(`python`, `node`, `gcc`/`g++`, `javac`/`java`, `go run`, `rustc`) for 7 languages —
but with **zero sandboxing** (no container, no seccomp, no cgroup limits, just a
5-second wall-clock timeout) and **no authentication** on `/api/execute` at all: an
open, unauthenticated remote-code-execution endpoint on whatever host ran the app.
Workspace (`/workspace`) had genuinely solid authenticated, user-scoped Drizzle
persistence against `projectFiles`, but claimed "isolated sandbox environments" in
its copy over what was actually just a database row (`POST /api/codebases`'s own
comment: `// Generate a quick fake archive ID`), only recognized 2 of its own
editor's languages when running code, and had a bug that displayed hard execution
failures as `"Process exited with code 0"` — a lie a user would reasonably trust.

**What changed:**
- **Merged into one surface.** `/workspace` (+ `/workspace/[projectId]`) is now the
  only IDE route. `/compiler`, its dedicated components
  (`ControlPanel`/`EditorWindow`/`OutputTerminal`/`Sidebar`), and
  `src/lib/languageDetector.ts` are deleted; nav links (`ClusterRail.tsx`,
  `WorkspaceLayout.tsx`, `TabProvider.tsx`) updated to match.
- **Execution is now real container-per-run, not raw host `spawn()`.**
  `/api/execute` requires an authenticated session (401 otherwise) and runs every
  execution in a disposable Docker container (`docker/sandbox.Dockerfile`):
  `--network none`, `--memory 128m`, `--cpus 0.5`, `--pids-limit 64`,
  `--cap-drop ALL`, `--security-opt no-new-privileges`, `--read-only` root
  filesystem with a small writable `/tmp` tmpfs for compiled output, running as a
  non-root user, with the request's source file bind-mounted read-only. An
  in-container `timeout` plus a host-side backup `docker kill` both bound each
  run's wall-clock time. Fails clearly (503, with the exact `docker build` command
  to run) if the sandbox image isn't built rather than silently falling back to
  anything unsafe.
- **False-success bug fixed.** `WorkspaceEditor.handleExecute` now checks
  `data.error`/`!response.ok` first and surfaces it as a real error — it no longer
  falls through to a fabricated `?? 0` exit code when execution never actually ran.
- **Language coverage aligned, honestly.** `getLanguageFromFile` now recognizes all
  7 execute-supported languages (previously only 2: JS and Python — C/C++/Java/Go/
  Rust had no file-extension mapping at all, despite `/compiler` having claimed to
  support them). The Run button is disabled with an explanatory tooltip for any
  other file type (`.ts`, `.json`, `.html`, `.css`, `.md`, etc.) instead of hitting
  the endpoint and 500ing. No UI copy claims "every language" — the scope is stated
  as exactly what's real.
- **Fabricated infrastructure copy removed.** "Isolated sandbox environments" is
  gone from `/workspace`'s page copy and the per-card "Node Environment" label;
  `POST /api/codebases`'s comment now says plainly that `archiveId` is a display
  label, not a provisioned environment.
- **Flavor-text console lines removed.** "Connecting to Language Server... Done" /
  "Linking Mentor Observability Layer... Active" (neither of which existed) are
  gone, replaced with an honest single ready line.
- **Folder delete now cascades.** `DELETE /api/workspace/files/[id]` walks the full
  descendant subtree in-app before deleting, so removing a folder removes its
  contents instead of orphaning children with a `parentId` pointing at a deleted
  row. The client-side file-tree state is updated to match all deleted IDs, not
  just the one clicked.
- **A bonus fix found while implementing, not in the original audit:** the runtime
  output console was built via raw `element.innerHTML +=` string concatenation of
  program stdout/stderr — a stored-XSS vector, since a program's own printed output
  is untrusted content and could contain `<script>`/markup that the DOM would then
  parse as real HTML. Replaced with React state (`runtimeLogs`) rendered as normal
  JSX text nodes, which auto-escapes.
- **Also folded in while merging:** Compiler's nicer Monaco setup (the
  `archive-dark` custom theme, `fontLigatures`, smooth-caret animation) and its
  Ctrl/Cmd+Enter-to-run keybinding, both now in `WorkspaceEditor.tsx`.

**Verified end-to-end, 2026-08-01 19:31 IST (same-day follow-up):** Docker Desktop
was started, `docker build -t vedcode-sandbox -f docker/sandbox.Dockerfile .`
completed successfully (~578MB image), and all 7 languages were actually executed
through the real `docker run` invocation `/api/execute` constructs (same flags,
same command templates) — not just type-checked. `tsc --noEmit`/`next lint` clean
throughout. This surfaced **3 real bugs that static review and type-checking could
never have caught**, all now fixed in `route.ts`:

1. **Compiled-language binaries couldn't run at all** — `gcc main.c -o /tmp/a.out
   && /tmp/a.out` failed with `Permission denied`. Docker's `--tmpfs` mounts
   default to `noexec` for security; the fix compiled C/C++/Rust binaries into but
   silently couldn't execute them from `/tmp`. **Fix:** added `exec` to the tmpfs
   mount options (`/tmp:rw,exec,size=64m,mode=1777`).
2. **`go run` couldn't even start** — `failed to initialize build cache ...
   read-only file system`. Go's build cache defaults to `$HOME/.cache/go-build`,
   which sits outside the one writable path (`/tmp`) under `--read-only`. **Fix:**
   set `GOCACHE=/tmp/go-cache` for the go command specifically.
3. **`go run` still failed after that** — `failed to create new OS thread ...
   errno=11`, because Go's build+run pipeline (separate compile/link subprocesses,
   each internally threaded) needs more than the `--pids-limit 64` ceiling allows,
   even single-threaded. **Fix:** set `GOMAXPROCS=1` for the go command (keeps
   Go's own concurrency modest, consistent with the container's 0.5-CPU
   allocation) and raised `--pids-limit` from 64 → 128 (still a firm anti-fork-bomb
   ceiling for arbitrary submitted code, just not razor-thin against a
   legitimately thread-hungry toolchain).

After those three fixes, re-verified clean runs for all 7 languages (Python,
JavaScript, C, C++, Java, Go, Rust — each printing real output from real
compilation/interpretation), a genuine compile error surfacing correctly (bad C
syntax → real `gcc` error text, non-zero exit — not swallowed), the 8s timeout
actually firing on an infinite loop (exit 124, ~9s wall clock including container
overhead), full network isolation (`urllib` request inside the container fails
with DNS resolution failure, confirming `--network none` holds), and the read-only
root filesystem + read-only source mount both correctly rejecting writes (running
as uid 10001, non-root, as intended).

**Takeaway for future sandboxed-execution work in this repo:** container
*security* flags (`--read-only`, `--network none`, `--cap-drop`, `--pids-limit`)
are straightforward to get right by reasoning about them; container *runtime
compatibility* (each language toolchain's own assumptions about where it's allowed
to write, how many threads it wants to spawn) is not — that only surfaces by
actually running each one. Budget for this kind of live-testing pass on any future
language additions to this sandbox, not just a code read.

**Practicality, updated:**
- Beginner — now genuinely usable for a quick "does this work" loop, since it's no
  longer unsafe to expose.
- Intermediate/advanced/expert — still a fixed 7 languages with no
  package/dependency support, so the value proposition against their own local
  toolchain remains modest; that's an honest, stated limitation now rather than a
  hidden gap behind "every language" marketing.

**Explicitly deferred:** ripple/change-impact detection against this new IDE (the
parked `CodebaseAnalyzer` from #6–8) — not built or wired up in this pass, by
design. That's the natural next step once the merged IDE itself has been verified
working end-to-end.

**Known issues found by the user during real use, 2026-08-01 — not yet fixed,
noted here so they aren't lost:**
1. **Save fails with an unexpected error; the file isn't actually persisted.**
   Not yet diagnosed. `handleSaveFile` → `PUT /api/workspace/files/[id]` is the
   path to check first (`WorkspaceEditor.tsx` around `handleSaveFile`).
2. **No way to feed stdin to a running program.** Reported symptom: a script
   using `input("enter your name: ")` hangs until the 8s timeout (`Process exited
   with code 124`) instead of receiving input. Two distinct problems bundled in
   this one report, worth separating when this gets picked up:
   - **A likely real bug in `runInContainer`** (`src/app/api/execute/route.ts`):
     `proc.stdin.write(...)`/`proc.stdin.end()` only run `if (stdinData && ...)` —
     when the stdin box is empty, `proc.stdin` is never `.end()`'d, so the
     container's stdin stays open indefinitely and `input()` blocks until the
     outer timeout kills it, rather than hitting EOF immediately (which is the
     correct behavior for "no stdin supplied" — Python would raise `EOFError`
     right away instead of hanging). Fix is probably just calling `.end()`
     unconditionally.
   - **A real UX gap, not just a bug:** even when the stdin box *is* pre-filled,
     the current design only supports supplying all input *before* clicking Run —
     there's no way to see a prompt appear and then type a response while the
     program is still running. Genuine interactive stdin (type-while-running)
     would need a streaming connection (e.g. WebSocket) between the browser and
     the running container, not the current one-shot request/response
     `/api/execute` call — a real architecture change, not a quick fix. Worth
     scoping explicitly with the user before starting: is "fill in stdin
     up-front, single round-trip" an acceptable near-term fix, or is true
     interactive back-and-forth required?

---

### 11. Document Explainer (`/documentExplainer`)

**Claims:** Paste a document → AI walkthrough ("Deep Insight"), auto-generated
concept map ("Knowledge Map"), cross-domain analogies ("Creative Domains"),
change-impact analysis ("Impact Guard"), hover-tooltips on technical terms.

**Reality:** Despite the "document"/"manuscript" framing, there is **no document
upload/parsing anywhere** — it's a paste-text-into-a-textarea tool; real PDF/file
ingestion lives entirely in the separate VedCode feature (#15), not here. Deep
Insight and Creative Domains are real, working LLM calls (Nova Pro / Mistral Large
respectively) with elaborate hand-written prompts — genuinely functional. Knowledge
Map is a real `generateObject` call producing a real graph, deliberately reusing
Explore's own `buildConstellationGraph` layout engine (good, intentional reuse) —
but the metrics attached to each node are fabricated: `lineCount: 100, // Dummy`,
and a code comment reading `"Calculate mock stats that look good visually."`
Impact Guard is #6b above (real AST, hardcoded wrong file). Keyword tooltips work
for the bulk-extracted definitions, but the "click for a deeper explanation"
affordance implied by a dedicated `explainKeyword` endpoint doesn't exist in the UI
at all — and that endpoint isn't even the only dead one: **there are three
separate, non-converging "explain a single keyword" implementations in this
codebase** (a Bedrock/Mistral route, an OpenAI gpt-4o agent function, and the
bulk-Mistral path that's actually used), only one of which is ever called. A
"Llama 3.3" engine badge is shown in the UI; that model constant is defined but
never actually invoked anywhere — the badge doesn't correspond to reality.
`generateConceptMap/` is an empty directory with no code at all.

**Verdict: Rework.** The real text-generation tabs are good and worth keeping.
Remove the "Llama 3.3" badge (it's simply false) or actually wire it in. Replace the
dummy metrics in Knowledge Map with something honest (even "N/A" beats a fake `100`).
Fix or remove the Impact Guard tab (same fix as #6b). Delete two of the three dead
`explainKeyword` implementations and either wire the third to the keyword tooltips
or remove it too. Delete the empty `generateConceptMap/` stub.

---

### 12–14. Handbook / Learn / Roadmap — the most sophisticated logic in the repo, badly siloed

**Claims:** Handbook = personalized AI-curated docs reference. Learn = "keyword to
understanding," grounded in your actual codebase. Roadmap = AI-sequenced learning
path toward a stated goal.

**Reality — genuinely impressive, and the most real of anything in this audit:**
- Real per-user mastery tracking with an actual **Ebbinghaus forgetting-curve decay
  formula** and a discrete spaced-repetition interval schedule
  (1d→3d→7d→14d→30d→90d), correctly reset on failure — this is real, working
  spaced-repetition, not a quiz with no scheduling behind it.
- Real recency-weighted skill inference from the last 100 behavioral signals,
  thresholding a user into beginner/intermediate/advanced and actually feeding back
  into what explanation depth Learn shows them.
- Real gap-detection: walks a real `conceptRelationships` prerequisite graph against
  what the user has actually mastered.
- Roadmap generation is a real single LLM call reasoning over the *actual* concept
  catalog for a technology, not a template.

**The gaps are about data and integration, not fake logic:**
- Content coverage is thin and manual — only 5 technologies seeded, 5–18 concepts
  each, populated by a no-UI CLI script. One seed script (`bootstrapConcepts.ts`)
  writes the **literal placeholder string `"Bootstrap"`** as the explanation text.
  Another generation script is flatly broken against the current `conceptQuizzes`
  schema (writes columns that no longer exist).
- An entire adjacent table+feature (`learningRoadmaps`, an older roadmap concept
  superseded by the current `userRoadmaps` system) is fully wired to the DB but has
  **zero live callers** — dead subsystem.
- `POST /api/admin/ingest` — the only way to add new content — has **no
  authentication at all**, despite triggering real (costly) LLM writes to the
  knowledge base.
- **Zero cross-navigation** between the three: Handbook never links to Learn or
  Roadmap; Roadmap's lesson player calls Learn's own explanation/quiz APIs
  internally but never links back to the fuller Handbook article for that same
  concept; finishing a Roadmap lesson doesn't feed the same skill-signal loop that
  Handbook's page does, so your mastery score can literally diverge depending on
  which of the three surfaces you used to learn the same concept.

**Practicality:** this is squarely built for **beginner-to-intermediate**
programmers learning a new stack, and it's the one feature cluster in the repo
where the *personalization logic itself* (not just an LLM being asked to
personalize) is real and technically serious. An advanced/expert user has little
use for guided concept sequencing they already know, but the underlying engine
(mastery decay, gap detection) is a genuinely well-built piece of software
regardless of audience.

**Verdict: Keep, but treat as one product, not three.** The single highest-leverage
fix here isn't more AI — it's (a) actually authenticating the ingestion endpoint,
(b) fixing/removing the broken seed script and the dead `learningRoadmaps` table,
(c) building the cross-linking between Handbook/Learn/Roadmap that's currently
completely absent, and (d) making Roadmap lesson completion feed the same mastery
signal Handbook does, so a user's progress means the same thing everywhere.

---

### 15. VedCode / Knowledge Studio (`/vedcode`)

**Claims:** Ingest documentation URLs, semantic search over them, an AI-generated
concept galaxy, an encyclopedia-style reader, and "Ripple Guard" change-impact
analysis — four tabs.

**Reality:** Three of the four tabs are genuinely, deeply real — this surprised me
more than any other feature. Real HTML scraping and chunking, real Amazon Titan
embeddings, real (if brute-force/linear-scan rather than ANN-indexed) cosine
similarity search over DynamoDB, real Nova Pro/Mistral Large calls for page
summaries and concept extraction, a hand-rolled but functioning force-directed
graph layout. There's even evidence (repair/retry maintenance scripts) that this
pipeline was actually run against live AWS infrastructure, not just written and
left untested — real usage, not just real code.

**The fourth tab, Ripple Guard, is a good example of "real engine, dead input":**
it uses genuine ts-morph AST parsing and a real AI narrator, but its core data
dependency — an "who imports this file" cache — is written by a function
(`writeImportCache`) that **is never called from anywhere in the codebase**. The
result: Ripple Guard will always report "no ripple effects detected," regardless of
the actual code, every time, forever, until something is wired up to populate that
cache.

**Verdict: Keep Ingest/Search/Reader/Galaxy — this is the strongest AI
infrastructure in the repo.** Fix Ripple Guard by wiring up the missing
`writeImportCache` call (or, given #6's finding that this exact "who imports this
file" capability already exists and *works* via `CodebaseAnalyzer`/ts-morph in the
preflightCheck route, consider reusing that instead of building a second import
cache from scratch).

---

### 16–18. Atelier, Vault, Lab — three small features in three different states of abandonment

- **Atelier** (portfolio/journal profile pages): was built, shipped, then
  deliberately shelved (`src/app` → `src/app_future_features`) and later fully
  deleted — this is confirmed from git history, not a guess. The backend routes
  (`/api/atelier/*`) still exist and still work against real DB tables, with no
  page left to call them except one orphaned modal component.
- **Vault** ("curated knowledge store"): same shelve-then-delete pattern. What
  remains, `/api/vault/search`, does plain SQL `ilike` keyword matching — not
  semantic search, despite the "Vault" branding. There's no `vault` table in the
  schema at all. The public landing-page nav still links to `/vault`, which now
  404s for any logged-out visitor who clicks it.
- **Lab** / "Skill Tree": never had a page at all, per git history. A stats API and
  an orphaned `SkillTree.tsx` component exist, but the nav links to `/skill-tree`,
  which has zero implementation of any kind.

**Verdict: Cut, formally.** These aren't half-built features waiting to be
finished — two were built and then actively removed by a past decision, and the
third never had a frontend. Leaving their backend routes and orphaned components in
place, plus a dead nav link, adds maintenance surface and confusing dead ends
(a 404 from the public marketing nav is a bad first impression) for zero current
benefit. If any of the three is wanted back, that's a real "build it" decision, not
a "finish it" one — the data model (especially Vault's "keyword search pretending
to be a vault") would need real product thought, not just reconnecting old routes.

---

### 19. Admin / infra routes

Mixed bag: `/api/admin/technologies` and `/api/codebases` are simple, real,
functional CRUD. `/api/admin/ingest` is real but **unauthenticated** despite
triggering expensive LLM writes — anyone who finds the URL can spend your AWS
Bedrock budget. `/api/logMemory`, `/api/getMemoryPrompt`, and `/api/db-debug` are
**empty directories with no route file at all** — they 404, and nothing in the app
calls them; they're likely leftovers from an abandoned memory/spaced-repetition
feature (a `memoryLogs` table exists in the schema with a comment about "forgetting
decay" but has zero application code reading or writing it anywhere).

**Verdict:** authenticate `/api/admin/ingest` immediately (real cost exposure,
not just a code-quality nit); delete the three empty route directories; decide
whether the orphaned `memoryLogs`-based "decay" idea is worth building for real or
should be dropped from the schema too.

---

### 20. Checkup (`/checkup`)

Real, DB-backed (`architectureMetrics`, `conceptChangeLog`, `userConceptProgress`),
degrades gracefully to an honest empty state rather than faking data when a user
has no history. One nit: fetch failures are swallowed into `console.error` and look
identical to "no data yet" — a real backend outage would be invisible to the user.
**Verdict: Keep**, worth a small fix to distinguish "no data" from "fetch failed."

Note: like Explore's stress overlay and PreFlightGateway, this page's Architectural
Heatmap reads from the same never-populated `architectureMetrics` table — so in
practice this page's most novel visualization is also currently inert for any repo
that isn't the one manually seeded. This is the *same* root cause as #5's gap and
#6c — one dead pipeline (`CodeGraphBuilder.indexCodebase()`) is silently disabling
parts of three different features at once.

---

### 21. Manifesto / Changelog

Both are intentionally static content pages (manifesto is prose/philosophy;
changelog is a hand-authored version history). Not bugs — a changelog doesn't need
to be dynamically generated to be legitimate — though the changelog *could* pull
from the existing `logs` table or git tags if keeping it current by hand becomes a
burden. **Verdict: Keep as-is**, low priority either way.

---

## Cross-cutting findings

**One dead pipeline quietly disables three features at once.**
`CodeGraphBuilder.indexCodebase()` (which would populate `fileNodes` /
`architectureMetrics` via a real, well-written stress-scoring formula in
`stressEngine.ts`) has zero callers anywhere in the app. Its absence is the *actual*
root cause behind: Explore's stress-color overlay never lighting up, Checkup's
Architectural Heatmap being permanently empty for real repos, and
`PreFlightGateway`'s warning gate never firing (which its own source comment admits
is a known, accepted demo shortcut). Wiring this one function up — running it
on-demand when Explore analyzes a repo, since that's where the raw AST data already
exists — would repair three features simultaneously.

**"Real AI, fake input" is the dominant failure mode in this codebase, not "fake
AI."** Across every cluster, the AI/LLM calls themselves are almost always genuine —
real prompts, real models, real API calls that cost real money. What's fake or
broken is consistently what's fed *into* them: a hardcoded file path (#6b, #8), an
empty cache (#15's Ripple Guard), dummy metrics (#11's Knowledge Map), a diff pasted
with no codebase access at all (#6a). If you're auditing a new feature yourself
going forward, the highest-signal question is not "does this call an AI" but "is
what it's handing the AI actually true."

**Redundant/duplicate systems found (four separate cases):**
1. Four independent "warn about change impact" implementations (#6a/b/c/d) — see
   above, consolidate to one.
2. Four independent graph/concept-visualization systems: Explore's constellation,
   Document Explainer's concept map (which *deliberately and correctly* reuses
   Explore's layout code — not a problem), `/api/knowledge-graph` (Postgres +
   React Flow, tied to Handbook/Learn), and VedCode's Galaxy (DynamoDB + its own
   715-line hand-rolled physics engine). The last three are conceptually
   overlapping but architecturally isolated from each other — worth a real product
   decision about whether the app needs three different concept-graph renderers.
3. Two independent document/URL ingestion pipelines: VedCode's (DynamoDB + Titan
   embeddings, real semantic search) and `admin/ingest`'s `DocIngestor` (Postgres,
   no embeddings — the `conceptCards.embedding` pgvector column is defined and
   never used anywhere). These feed two entirely separate downstream features and
   don't share a line of code.
4. Onboarding, two generations (#3): a dead PUT route fully superseded by Atelier's
   update endpoint.
5. Three non-converging "explain a single keyword" implementations (#11), two of
   which are unreachable dead code.

**Confirmed dead/orphaned code inventory** (zero callers, verified by repo-wide
grep, not just "looks unused"): `PUT /api/onboarding`, `UploadButton`/
`UploadDropzone` components, `src/lib/agents/guard.ts::preflightCheck`,
`src/lib/agents/jit.ts::explainKeyword`, `src/app/api/explainKeyword/route.ts`,
`generateConceptMap/` (empty dir), `learningRoadmaps` table + `learningActions.ts`'s
readers, `CodeGraphBuilder.indexCodebase` + everything in
`src/lib/code-intelligence/` (`stressEngine`, `evidenceMemory`,
`patternAggregator`, `mentorInsightEngine`, `regressionDetector`),
`writeImportCache` (defined, never called), `EditProfileModal.tsx` (calls a live
route, `/api/atelier/update`, but no page anywhere renders this component, so the
route is only reachable from dead code), `VaultExplorer.tsx`, `SkillTree.tsx`,
`/api/logMemory`, `/api/getMemoryPrompt`, `/api/db-debug` (all three empty route
dirs).

Resolved 2026-08-01 (no longer in the codebase, listed here only so the history
isn't lost): `src/lib/agents/guard.ts::preflightCheck` (deleted), `/guard` page +
`/api/guard` route + `GuardSummary.tsx`/`ImpactList.tsx` (deleted),
`PreFlightGateway.tsx` (deleted), `/api/preflightCheck` route (deleted — its
`CodebaseAnalyzer` engine was kept, see #6–8 above), `/compiler` page + its 4
dedicated components + `src/lib/languageDetector.ts` (deleted, merged into
Workspace — see #9–10 above).

## Recommended path forward, roughly in priority order

1. ~~**Security, immediately:** authenticate `/api/execute`~~ — **done 2026-08-01**
   (auth required, real container-per-run isolation; not yet verified end-to-end,
   see #9–10). `/api/admin/ingest` is **still unauthenticated** — separate task,
   out of scope for the 2026-08-01 session.
2. ~~**Fix the false-success bug in Workspace**~~ — **done 2026-08-01.**
3. **Wire up `CodeGraphBuilder.indexCodebase()`** once, to repair three silently-dead
   visualizations at once (#5, #6c [now removed, but the underlying dead pipeline
   is unchanged], #20). Still open.
4. ~~**Consolidate the four Guard implementations to one**~~ — **done differently,
   2026-08-01:** rather than consolidating to one *live* surface, three were
   deleted outright and the one real engine (`CodebaseAnalyzer`) was parked unwired
   rather than reconnected, since rebuilding ripple detection properly needs the
   IDE work (#9–10) done first. Reconnecting it is the natural next task.
5. **Delete confirmed dead code** listed above — still open for everything except
   the Guard/Compiler items resolved 2026-08-01 (see the resolved-items note just
   above this list).
6. **Cut Atelier/Vault/Lab formally** (routes + orphaned components + the dead
   `/vault` nav link) unless there's an active decision to rebuild them for real.
   Still open.
7. **Cross-link Handbook/Learn/Roadmap and unify their mastery-signal writes**
   (#12–14) — this is the highest product-value fix in the repo relative to effort,
   since all the hard logic already exists and just isn't connected. Still open.
8. ~~**Decide the Compiler-vs-Workspace question**~~ — **done 2026-08-01:** merged
   into one surface (`/workspace`), see #9–10 above.

---

# Part 2 — Development Session Log

**How to use this part:** append a new dated section at the **top** each time work
resumes. Keep the structure: what was covered, bugs found/fixed with root causes,
known limitations, and next steps. Don't rewrite history — older sessions stay as-is
below.

---

## 2026-08-01 19:31 IST — Follow-up: built and live-tested the Docker sandbox

### What this covered
The previous entry (below, 15:34 same day) shipped the container-per-run rewrite
of `/api/execute` but explicitly flagged it as **not verified end-to-end** — Docker
Desktop's daemon wasn't running on the dev machine at the time. This entry is that
verification: started Docker Desktop, built `docker/sandbox.Dockerfile`
(~578MB image), and actually ran all 7 languages through the exact `docker run`
invocation `route.ts` constructs — not just read the code and trusted it.

Prompted by the user hitting the expected "Sandbox image isn't built yet" error in
the running app (a screenshot of `/workspace/.../test.py` showing that exact
message) — confirming, incidentally, that the false-success bug fix from the
15:34 session is working correctly: a real, honest, actionable error instead of a
silent fake "exited with code 0."

### Bugs found — only visible under live execution, not from reading the code
1. **`noexec` on the `/tmp` tmpfs silently blocked every compiled language.**
   C/C++/Rust all compile to `/tmp/a.out` and execute it; Docker's `--tmpfs`
   defaults include `noexec`, so every one of them failed with `Permission denied`
   despite compiling successfully. **Fix:** added `exec` to the tmpfs mount options.
2. **`go run` couldn't initialize its build cache** — defaults to
   `$HOME/.cache/go-build`, not writable under `--read-only`. **Fix:**
   `GOCACHE=/tmp/go-cache`.
3. **`go run` then hit the pids limit** — its build+run pipeline spawns more OS
   threads than the original `--pids-limit 64` allowed, even with a single
   goroutine's worth of actual work. **Fix:** `GOMAXPROCS=1` for the go command,
   plus raised the ceiling to 128 (still a real anti-fork-bomb bound).

Full detail, including the exact error text for each, is in Part 1 #9–10 above —
not duplicated here to avoid drift between the two.

### Verified this session
All 7 languages (clean success case each), a genuine compile error surfacing
correctly end-to-end, the 8s in-container timeout actually firing on an infinite
loop (exit 124), full network isolation (`--network none` confirmed via a blocked
`urllib` request), and the read-only root filesystem + read-only source mount both
correctly rejecting write attempts while running as non-root (uid 10001).
`tsc --noEmit` clean after the three fixes.

### Not covered this session
- Did not test through the actual authenticated `/api/execute` HTTP endpoint from
  a browser session — verification was done by replicating the exact `docker run`
  invocation `route.ts` constructs, which validates the sandbox mechanism itself
  (the part that was genuinely unverified) but not the Next.js route handler's own
  request parsing / auth-check / response-shaping code path. That code type-checks
  and was reviewed, but a real click-Run-in-the-browser pass is still worth doing.
- Did not re-test Guard-cluster or nav changes from the 15:34 session — out of
  scope for this Docker-focused follow-up.
- `PROGRESS.pdf` was not regenerated after this entry — regenerate before treating
  the PDF as current (see the `pandoc` → headless-Edge `--print-to-pdf` pipeline
  used earlier in this file's history if the exact commands are needed again).

---

## 2026-08-01 15:34 IST — Session: cut the four Guard implementations, merged Compiler + Workspace into one IDE

### What this session covered
A scoped follow-up to the 2026-08-01 full repo audit, working from a task spec
agreed against `PROGRESS.md` Part 1 #6–8, #9, #10. Two explicit deliverables:
(A) reduce the four redundant "impact/ripple guard" implementations to zero live
surfaces while preserving the one real piece of logic for later reuse, and
(B) merge Compiler and Workspace into one secured, honestly-scoped web IDE.
Ripple/change-impact detection against the new IDE was explicitly **not** built
this session — deferred by design, see Part 1 #6–8 and #9–10 above for the full
current-state writeups (this log only covers what happened and why).

### Part A — Guard consolidation
- Deleted `/guard` page, `/api/guard` route, and its two support components
  (`GuardSummary.tsx`, `ImpactList.tsx`) — this was the implementation whose UI
  claimed "AST dependency tracing" while actually just asking an LLM to invent a
  ripple report from pasted text, no codebase access at all.
- Deleted `PreFlightGateway.tsx` and its call site in `explore/page.tsx`
  (`preFlightFile` state, the `getFileMetrics` gating call before opening a file,
  the JSX render) — this component's own source comment admitted it was a demo
  shortcut that would bypass in a real app, and its data source
  (`fileNodes`/`architectureMetrics`) is fed by nothing, so it never actually
  fired. Explore's click-to-open-file flow now just opens the file directly;
  nothing else in Explore was touched, per the task's explicit scope limit.
- Deleted `src/lib/agents/guard.ts` (the OpenAI `gpt-4o`-based fourth
  implementation) after confirming zero callers via repo-wide grep.
- Deleted `/api/preflightCheck` (the route wiring) but **kept**
  `src/lib/parser/analyzer.ts`'s `CodebaseAnalyzer` — this is real, working
  ts-morph-based ripple detection, the one piece of genuine logic among the four.
  Left intentionally unwired with a parking comment explaining why: it was always
  pointed at a hardcoded `src/app/page.tsx` rather than the user's actual target,
  and properly fixing that means feeding it the merged IDE's real file source
  (`projectFiles`) instead of `process.cwd()`'s on-disk tree — future work, not
  this session's.
- Removed the "Impact Guard" tab from `DocReadingMode.tsx` (Document Explainer)
  entirely: tab state, the fetch call, the tab button, the content panel. Left the
  other three tabs (Deep Insight, Knowledge Map, Creative Domains) completely
  untouched, per scope.
- Removed all three now-dead `/guard` and `/compiler` nav references from
  `ClusterRail.tsx`, `WorkspaceLayout.tsx`, and `TabProvider.tsx` (the latter two
  done in the same pass for both routes, since both needed the same treatment).

### Part B — Compiler + Workspace merge

**Kept `/workspace` (+ `/workspace/[projectId]`) as the one surviving IDE route.**
Deleted `/compiler`, its four dedicated components
(`ControlPanel`/`EditorWindow`/`OutputTerminal`/`Sidebar`), and
`src/lib/languageDetector.ts` (its content-sniffing auto-detect doesn't fit a
file-based IDE where every file already has a real name/extension).

**`/api/execute` rewritten from raw host `spawn()` to container-per-run:**
- Requires an authenticated session (`auth()`, 401 otherwise) — it had no auth
  check at all before.
- Every execution now runs in a disposable Docker container built from the new
  `docker/sandbox.Dockerfile` (Debian slim + python3/nodejs/build-essential/
  default-jdk-headless/golang-go/rustc, non-root `sandbox` user), invoked with
  `--rm --network none --memory 128m --cpus 0.5 --pids-limit 64 --cap-drop ALL
  --security-opt no-new-privileges --read-only` plus a small writable `/tmp`
  tmpfs for compiled output, and the request's single source file bind-mounted
  read-only. This replaces directly `spawn()`ing the *host machine's own*
  compilers with zero isolation, which is what was there before.
- Timeout enforcement is now two-layered: an in-container `timeout 8s` wrapping
  the actual language command (primary), plus a host-side timer that SIGKILLs the
  local `docker run` client and issues a separate `docker kill <name>` as a
  backup, since killing the CLI client alone doesn't guarantee the daemon stops
  the container.
- If the sandbox image isn't built yet, returns a clear 503 with the exact
  `docker build` command to run, rather than a cryptic failure or (worse) any
  kind of unsafe fallback.
- Language scope is unchanged and stated honestly: exactly the same 7 languages
  as before (Python, JavaScript, C, C++, Java, Go, Rust) — no "every language"
  claim anywhere in the merged UI.

**Bugs fixed in `WorkspaceEditor.tsx` as part of the merge, not after:**
1. **False-success bug.** `handleExecute` now checks `data.error`/`!response.ok`
   first and shows a real error line — it no longer falls through to
   `data.run?.code ?? 0` and prints `"Process exited with code 0"` for a request
   that never actually ran (e.g. an unsupported-language 400, or an unauthenticated
   401). This was actively misleading — a user could believe broken code worked.
2. **Language coverage mismatch.** `getLanguageFromFile` previously mapped file
   extensions to only 2 of the 7 languages `/api/execute` could run (`javascript`,
   `python`) — `.c`/`.cpp`/`.java`/`.go`/`.rs` had no mapping at all, despite
   `/compiler` having offered all 7 via its dropdown. Extended the extension map to
   cover all 7 (restoring the full capability the merge is supposed to preserve),
   and the Run button is now `disabled` with an explanatory tooltip for any file
   type outside that set (`.ts`, `.json`, `.html`, `.css`, `.md`, etc.) instead of
   hitting the endpoint and 500ing.
3. **Cascading folder delete.** `DELETE /api/workspace/files/[id]` previously
   deleted only the clicked row, orphaning any children with a `parentId` pointing
   at a now-gone row (the schema declares an `onDelete: 'cascade'` FK, but no
   migration in `drizzle/` actually created that constraint on the live table —
   this project uses `drizzle-kit push` for iterative schema sync, so the
   migrations folder doesn't reflect the true DB state either way; fixed at the
   application layer instead, which works regardless of DB-level constraint
   state). The route now walks the full descendant subtree in-app before
   deleting and returns `{ deletedIds }`; the client (`handleDeleteNode`) now
   clears every deleted ID from local state, not just the one clicked.
4. **Fabricated infrastructure copy.** `/workspace`'s "Manage your individual
   projects and isolated sandbox environments" became "Manage your projects and
   their files"; the per-project card's "Node Environment" label (implying a
   provisioned runtime that doesn't exist) became "Open Project";
   `POST /api/codebases`'s `// Generate a quick fake archive ID` comment was
   rewritten to state plainly that `archiveId` is a display label, not an
   environment.
5. **Flavor-text console lines removed.** "Connecting to Language Server... Done."
   and "Linking Mentor Observability Layer... Active." (neither system exists) are
   gone from the runtime console's initial content.
6. **Found while implementing, not in the original audit — stored-XSS-shaped bug:**
   the runtime output console built its content via
   `document.getElementById('runtime-logs').innerHTML += ...` string concatenation
   of raw program stdout/stderr. Since program output is untrusted content, a
   program that printed `<script>`-like text would have it parsed as real markup
   by the DOM. Replaced the whole log panel with React state
   (`runtimeLogs: LogLine[]`) rendered as normal JSX text nodes, which auto-escape;
   added a ref + effect to preserve the previous auto-scroll-to-bottom behavior.
7. **Folded in Compiler's editor polish while merging:** the custom `archive-dark`
   Monaco theme (previously only in the deleted `EditorWindow.tsx`) and a
   Ctrl/Cmd+Enter-to-run keybinding are now in `WorkspaceEditor.tsx`. Note on the
   keybinding: Monaco's `onMount` fires once per editor instance, not once per
   render, so binding it directly to `handleExecute` would have closed over
   whichever file was active *at mount time* and silently kept running that one
   forever regardless of which file the user later switched to. Fixed by keeping
   the latest `handleExecute` in a ref (`handleExecuteRef`, updated every render
   via a plain `useEffect`) and having the keybinding call through that ref
   instead of the closed-over function directly.

### Verified vs. not verified
- `tsc --noEmit` and `next lint` both clean across every file touched this
  session — no new errors or warnings anywhere in either Part A or Part B.
- **Not verified: the Docker sandbox itself.** Docker Desktop's daemon was not
  running on the dev machine this session (`docker info` failed to connect). The
  container-per-run code and `docker/sandbox.Dockerfile` are written and
  type-check, but no one has actually run
  `docker build -t vedcode-sandbox -f docker/sandbox.Dockerfile .` or exercised a
  real execution through the UI yet. This is flagged here deliberately rather than
  claimed as done — **next session should start Docker Desktop, build the image,
  and manually test all 7 languages (success case + a deliberate compile error +
  a deliberate infinite loop to confirm the timeout actually fires) before this
  is trusted in front of a real user.**

### Known limitations / explicitly deferred
- Ripple/change-impact detection is not wired to anything right now — by design,
  per this session's scope. `CodebaseAnalyzer` is real and parked; reconnecting it
  to the merged IDE's real file source is the natural next task once the IDE
  itself is verified working end-to-end (see above).
- `/api/admin/ingest` is still unauthenticated (Part 1 #19) — known, explicitly
  out of scope for this session, tracked separately.
- Everything else marked "still open" in Part 1's "Recommended path forward" list
  remains open: wiring up `CodeGraphBuilder.indexCodebase()`, deleting the
  remaining dead-code inventory, cutting Atelier/Vault/Lab formally, and
  cross-linking Handbook/Learn/Roadmap.
- The Docker-based sandbox is Windows-dev-machine-tested for path handling only
  informally (Docker Desktop's Windows CLI generally auto-translates
  `C:\...`-style bind-mount paths for its Linux backend) — this hasn't been
  confirmed to actually work end-to-end (see "Not verified" above), and a Linux
  production host would use POSIX temp paths natively either way, so this is a
  dev-environment-only consideration, not a portability concern for deployment.

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
