# VedCode Technical Documentation: Data Requirements

This document contains raw technical notes structured exactly according to the provided data requirements checklist. It serves as the foundational data layer for the final VedCode Platform Whitepaper.

---

## 1. Product Overview (Vision Layer)

### 1️⃣ Mission Statement
**Short Version:**
VedCode exists to transform static code repositories into living, interactive learning environments, ensuring developers always understand the architectural context and downstream impact of the code they edit. 

**Long Version:**
In modern software development, codebases quickly grow beyond the cognitive capacity of any single engineer. The primary motivation behind VedCode is solving the "context gap"—the massive amount of time teams waste cross-referencing fragmented documentation, piecing together invisible dependencies, and accidentally triggering regression bugs because they lacked architectural visibility. 

Unlike standard AI coding assistants (like Copilot or Cursor) that act as "autocomplete engines" generating code for you, VedCode is an **Architectural Intelligence** platform. It doesn't just write code; it helps you truly master the codebase. By combining strict AST parsing with Just-In-Time (JIT) educational models, it guarantees that engineers learn the *why* and the *how* of their system architecture, rather than just blindly accepting AI-generated snippets.

### 2️⃣ Target Users
* **Senior Engineers / Architects:** Who need to map dependencies, visualize legacy monoliths, and enforce safe architectures via impact analysis before approving PRs.
* **Junior Developers / New Hires:** Who are onboarding onto massive legacy systems and need dynamic, step-by-step reading roadmaps and JIT explanations of complex internal libraries.
* **DevOps / CI/CD Engineers:** Who want to calculate the blast radius of changes before pushing code to production.

### 3️⃣ Core Philosophy
* **Code Awareness:** Knowing exactly how the AST (Abstract Syntax Tree) is structured in real-time.
* **Concept Awareness:** Knowing that a piece of code isn't just syntax, but a representation of a mental model (e.g., "Dependency Injection" or "State Hydration").
* **Architectural Intelligence:** Visualizing the invisible threads coupling an application together.
* **Continuous Learning:** Moving away from "AI writing code for me" toward "AI teaching me how this code works so I can master it."

---

## 2. System Architecture

**Frontend:**
Next.js 14+ (App Router) / React / Tailwind CSS / Shadcn UI / @xyflow/react (React Flow for graph rendering) / Framer Motion (animations).

**Backend:**
Node.js / Next.js Server Actions / API Routes / Serverless Cron Workers (for Ebbinghaus scheduling).

**Database:**
PostgreSQL (Neon/Supabase) / Drizzle ORM / `pgvector` extension for semantic search and embeddings.

**AI:**
Amazon Bedrock API / Mistral Large & Anthropic Claude 3 Sonnet / Vercel AI SDK (Unified multi-model streaming).

**Analysis:**
`ts-morph` AST parsing pipeline / Custom Dependency Walker.

---

## 3. Intelligence Layers

**Layer 1 – Knowledge Graph**
* **Purpose:** Stores and relates discrete programming concepts and documentation snippets. 
* **Inputs:** Raw markdown, text chunks, API URLs.
* **Outputs:** A structured Node/Edge mapping of concepts (e.g., Node A "React" -> Node B "Hooks").
* **Main Components:** Doc Ingestor, pgvector database schema, React Flow UI.

**Layer 2 – Learner Cognition Model**
* **Purpose:** Tracks what the user knows and what they struggle with.
* **Inputs:** Code interaction time, active recall quiz scores.
* **Outputs:** Mastery scores, scheduling intervals for next review.
* **Main Components:** Drizzle ORM tracking tables, Ebbinghaus calculation functions.

**Layer 3 – Contextual Intelligence Engines**
* **Purpose:** Translates raw AST tokens into human-readable "intent". 
* **Inputs:** Function signatures, variable names.
* **Outputs:** Plain English explanations of what a specific code block does functionally within the app.
* **Main Components:** Vercel AI SDK integration, syntax tokenizers.

**Layer 4 – Codebase Graph**
* **Purpose:** The exact, deterministic mapping of file imports and module exports.
* **Inputs:** The repository file system.
* **Outputs:** JSON tree of file paths and their direct edge connections.
* **Main Components:** `ts-morph` compiler API, Node.js `fs` module. 

**Layer 5 – Context Guard**
* **Purpose:** The defensive "Blast Radius" analyzer for pull requests.
* **Inputs:** A proposed Git Diff.
* **Outputs:** A warning list of downstream files that might break due to the diff.
* **Main Components:** Dependency trace algorithms, LLM impact reasoning prompt.

**Layer 6 – Concept Time Travel**
* **Purpose:** Understanding how a concept evolved over the lifespan of the repository. (Future/Theoretical).
* **Inputs:** Git history SHAs.
* **Outputs:** A timeline of how a specific file changed.
* **Main Components:** Git CLI integrations.

**Layer 7 – Mentor Engine**
* **Purpose:** The proactive teaching layer that interrupts the user with JIT help.
* **Inputs:** User cursor position, active file AST context.
* **Outputs:** Contextual tooltips, step-by-step reading roadmaps.
* **Main Components:** Context UI Panel, Bedrock API.

**Layer 8 – Hybrid IDE**
* **Purpose:** Merging the reading/learning experience with standard code editing.
* **Inputs:** User keystrokes.
* **Outputs:** Real-time linting, formatting, execution.
* **Main Components:** Monaco Editor.

---

## 4. Core Features

**Project Constellation**
* **What it does:** Renders the entire repository as a 2D interactive galaxy graph.
* **Why it exists:** To expose hidden dependencies and architectural bottlenecks (tight coupling) that aren't visible in a standard file tree.
* **How it works:** Parses the AST with `ts-morph` to extract imports/exports, mapping them to React Flow nodes with physics-based force simulation. Heatmaps indicate highly stressed nodes.
* **Where it appears:** The Knowledge Studio (`/handbook/map`).

**Context Guard**
* **What it does:** Simulates code changes to predict downstream breakages (the "blast radius").
* **Why it exists:** To prevent regression bugs before code is committed.
* **How it works:** It takes a diff, finds the modified function node in the AST graph, traces all incoming edges (files that call that function), and asks the LLM if the signature changes will crash those callers.
* **Where it appears:** Guard Mode Tab in the workspace.

**Doc Ingestor**
* **What it does:** Scrapes unstructured documentation and turns it into structured learning paths.
* **Why it exists:** Developers hate reading fragmented markdown; they need standardized mental models and clear prerequisites.
* **How it works:** Takes text, chunks it, generates vector embeddings, and uses an LLM to extract entity arrays (prerequisites, related concepts).
* **Where it appears:** Document Explainer Tab.

**Universal Handbook**
* **What it does:** A centralized repository for all ingested conceptual knowledge. 
* **Why it exists:** To serve as a single source of truth for onboarding new team members to proprietary company logic.
* **How it works:** Queries the `conceptCards` database table and renders a searchable, highly-styled Wiki interface.
* **Where it appears:** Global Sidebar -> Handbook.

**Mentor Engine & JIT Explainer**
* **What it does:** Delivers Just-In-Time explanations for complex code right when the user needs it.
* **Why it exists:** To prevent context-switching (Googling answers) and to teach the *why* behind proprietary code.
* **How it works:** Tracks the user's cursor or hovered text, fetches the surrounding AST context, and streams a custom LLM explanation tailored to that exact project's architecture.
* **Where it appears:** Side panels or tooltips within the viewing area.

**Active Recall System**
* **What it does:** Tests the user on recently learned concepts using spaced repetition.
* **Why it exists:** Reading code isn't learning. Active testing commits architectural idioms to long-term memory.
* **How it works:** Calculates the Ebbinghaus function ($R = e^{-t/S}$) based on the timestamp the user last viewed a concept card, dynamically generating quizzes when $R$ drops below a certain threshold.
* **Where it appears:** Learn Mode Tab.

**Roadmap Player**
* **What it does:** Generates dynamic, step-by-step reading lists for codebase exploration.
* **Why it exists:** A 500-file repository is overwhelming; junior devs need a curated path (e.g., "Start at `router.ts`, then read `auth.ts`, then `database.ts`").
* **How it works:** Uses graph traversal to find the logical upstream-to-downstream flow of execution and lists the files sequentially.
* **Where it appears:** Dynamic modal menus or Learn Mode paths.

---

## 5. AI Systems

**JIT Explainer**
* **Inputs:** Selected code snippet + surrounding file context.
* **Processing:** Anthropic Claude 3 API with a system prompt instructing it to act as a senior staff engineer explaining logic to a mid-level dev.
* **Outputs:** Markdown-formatted pedagogical explanations.

**Doc Ingestor (Concept Extraction)**
* **Inputs:** Raw Markdown/HTML.
* **Processing:** Mistral Large structured JSON generation prompt. 
* **Outputs:** Typed JSON matching Zod schemas (`title`, `prerequisites[]`, `relatedConcepts[]`).

**Active Recall Generator**
* **Inputs:** A specific Concept Card's text and the user's Mastery Level.
* **Processing:** LLM prompted to generate multiple-choice distractors or fill-in-the-blank code snippets that test comprehension, not memorization.
* **Outputs:** JSON object with Questions, Options, and Correct Answer IDs.

**Regression Correlation Engine (Context Guard Insights)**
* **Inputs:** Modified function AST string + Downstream caller AST string.
* **Processing:** Analysis prompt: "If function A changes its return type from `string` to `Promise<string>`, will Function B crash?"
* **Outputs:** Boolean safety flag + Human-readable impact danger summary.

---

## 6. Data Model (PostgreSQL / Drizzle)

**`conceptCards`**
* **Purpose:** Stores discrete pieces of knowledge (e.g., "What is Redux?").
* **Fields:** `id`, `title`, `content_md`, `embedding` (vector), `metadata_json`.
* **Usage:** Queried via pgvector cosine similarity during search or JIT generation.

**`conceptRelationships`**
* **Purpose:** Tracks how concepts link together (The Knowledge Graph).
* **Fields:** `sourceConceptId`, `targetConceptId`, `relationshipType` (e.g., 'prerequisite_for', 'related_to').
* **Usage:** Fetched to draw the interactive React Flow nodes in the Universal Handbook.

**`projects` & `file_nodes`**
* **Purpose:** Caches the AST state of a repository so we don't have to re-parse massive file trees on every request.
* **Fields:** Project `id`, File `id`, `filePath`, `fileContents`, `imports_json`.
* **Usage:** Used by Project Constellation and Context Guard to calculate edges.

**`user_concept_progress`**
* **Purpose:** Actively stores the Ebbinghaus memory variables for individual users.
* **Fields:** `userId`, `conceptId`, `masteryScore`, `lastReviewedAt`, `nextReviewDueAt`.
* **Usage:** Polled by the UI to determine if it's time to interrupt the user with an Active Recall challenge.

---

## 7. Code Intelligence System

* **How code is parsed:** We initialize a `ts-morph` AST Project instance in memory. We feed it the target directory. It mathematically traverses every TypeScript/JavaScript file, generating SourceFile objects that expose exactly what identifiers are imported and from which paths.
* **How concepts are detected:** We run a keyword/regex scanner over the raw AST file contents and match them against the `title` fields of our `conceptCards` database.
* **How architecture stress is calculated:** 
  * `Indegree` = Number of files importing File A.
  * `Outdegree` = Number of files File A imports.
  * `Total Coupling Score` = `(Indegree * 1.5) + Outdegree`. High scores indicate potential architectural choke points or "God Objects."

---

## 8. Learning Engine

* **Ebbinghaus Algorithm:** We utilize the formula $R = e^{-t/S}$ where $R$ is retrievability, $t$ is time passed since last review, and $S$ is memory stability (Mastery).
* **Mastery Scoring:** Starts at 1. Every successful Active Recall test increases $S$ by a multiplier (e.g., 1.5x), meaning the curve decays much slower next time.
* **Recall Scheduling:** The database tracks `nextReviewDueAt`. When the current time surpasses this timestamp, the dashboard flags the user that it's time to test their knowledge.
* **Challenge Generation:** Driven entirely by contextual AI prompts based on the exact repository code they are working on, making the tests highly relevant (not generic LeetCode problems).

---

## 9. Visualization Systems

* **Project Constellation:** The macro-view of the codebase graph. Utilizes continuous force-directed algorithms to ensure highly connected files clump together visually, creating recognizable module clusters.
* **Stress Heatmap:** An overlay mode in the constellation where nodes map their background color heavily to a red gradient based on their Total Coupling Score.
* **Concept Graph:** A separate, hierarchical (tree-like) layout showing prerequisite chains for learning (e.g., Basics -> Intermediate -> Advanced).
* **Cascade Trajectories:** In Context Guard, when a file is modified, the graph animates glowing particles (trajectories) flowing outward along the edges to demonstrate exactly how the "blast" moves through the architecture.

---

## 10. Security & Privacy

* **How code is processed:** Code is parsed into ephemeral memory on the Node.js server. Only the specific AST signatures and isolated function bodies requested for explanation are sent securely to the LLM API provider (Amazon Bedrock).
* **What data is stored:** We store file paths, import structures, and AI-generated concept explanations. We explicitly *avoid* permanently storing proprietary core business logic strings in the database unless explicitly prompted by the user to save it as a Concept Card.
* **User Isolation:** All database tables use strict Row-Level Security (RLS) tracking the `tenantId` or `userId`. User A can never accidentally query the AST nodes or Concept Progress of User B.

---

## 11. API Overview

* **`/api/knowledge-graph`:** Fetches the list of `conceptCards` and `conceptRelationships` from the database and maps them into exactly the `{ nodes, edges }` JSON structure required by React Flow.
* **`/api/learn`:** Accepts a file path and a code snippet. Returns an LLM-generated JSON payload containing a JIT explanation, potential optimization hints, and identifying potential architectural concepts in use.
* **`/api/explore`:** Ingests a new project zip or folder path, triggers the `ts-morph` worker to map the AST, and returns the Constellation Graph tree.
* **`/api/ingest`:** Receives raw unstructured text or documentation URLs. Triggers the semantic embedding pipeline and writes the extracted mental models to the database.

---

## 12. Development Stack

* **Core Web Framework:** Next.js 14+ (App Router)
* **View Library:** React 18
* **Styling & UI:** Tailwind CSS, Shadcn UI
* **Physics & Graphing:** @xyflow/react (React Flow), Framer Motion
* **Database Driver & ORM:** PostgreSQL, Drizzle ORM
* **Vector Math:** `pgvector` extension
* **AI Pipelines:** Vercel AI SDK, Amazon Bedrock (Mistral/Claude)
* **Code Intelligence:** `ts-morph` (AST Wrapper for TypeScript Compiler API)
* **Interactive Editor:** `@monaco-editor/react`

---

## 13. Future Roadmap

* **IDE Plugin Integration:** Bringing the Context Guard and JIT Mentor directly into VS Code via Language Server Protocol (LSP) extensions.
* **Team Multiplayer Collaboration:** Allowing senior engineers to leave synchronized comments, video annotations, and architectural "pins" directly on Constellation nodes for junior developers to discover.
* **Architecture Diffing over Time:** Storing snapshots of the AST graph daily, allowing teams to "scrub a timeline" and watch exactly when and why their codebase devolved into a monolith.
* **Design System Intelligence:** Connecting the AST graph directly to Figma APIs, allowing developers to see which React UI components in the codebase are currently perfectly synced with the master design system, and which are dangerously outdated.
