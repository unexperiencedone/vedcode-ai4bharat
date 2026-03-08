# VedCode: Comprehensive Technical Documentation

## 1. System Architecture Overview

VedCode is a full-stack, AI-native developer platform built to provide Architectural Intelligence (AST dependency tracking, Context Guard impact analysis) and Just-In-Time (JIT) continuous learning (Mentor Engine, Knowledge Studio). 

The platform operates on a modernized, cloud-native architecture prioritizing performance, real-time code analysis, and high-fidelity decentralized storage semantics.

### High-Level Data Flow:
1. **Client Layer:** Next.js (App Router) delivering highly interactive React Server Components, styled with Tailwind CSS, Framer Motion, and Shadcn UI.
2. **Analysis Engine:** A robust AST parser using `ts-morph` and custom Babel integrations processes raw codebase files to compute a dependency graph.
3. **Intelligence Layer:** Core AI logic leveraging Vercel AI SDK and Amazon Bedrock (Anthropic Claude 3 / Mistral) to derive structural context, perform impact analysis, and generate pedagogical models.
4. **Data Persistence:** Serverless PostgreSQL database utilizing Drizzle ORM, with built-in `pgvector` support for semantic embeddings and active recall logging.

---

## 2. Core Modules & Implementation Details

### A. Project Constellation (Architectural Stress Mapping)
**Purpose:** Visualize a project's entire file and module structure as an interconnected graph, identifying "stressful" coupling points out-of-the-box.
**Technical Approach:**
* **Graph Generation:** We recursively traverse the provided file tree and utilize an AST parser to extract all `import` and `export` declarations. This populates a structured JSON representation of nodes (files) and edges (dependencies).
* **Rendering Engine:** `@xyflow/react` is utilized to map the JSON payload to an interactive 2D physics layout. Force-directed algorithms arrange highly coupled nodes together.
* **Stress Calculation Formula:** The opacity and glowing effects (red/amber) of a node are a function of its Indegree (number of incoming dependencies) and Outdegree (number of outgoing dependencies) relative to the repository average.

### B. Context Guard (Blast Radius Simulator)
**Purpose:** Prevent breaking changes by simulating the exact downstream logic failures a diff might cause.
**Technical Approach:**
* **Diff Parsing:** Incoming code changes are converted to a unified diff format.
* **Path Tracing:** We query our AST graph to find the shortest upstream paths connected to the modified node.
* **LLM Impact Reasoning:** We stream the *modified function*, its *immediate upstream callers*, and a system prompt into our AI Engine (Bedrock). The LLM determines if the function signature or return type changes will break string serialization, database schemas, or payload structures in the callers.

### C. Knowledge Studio (Doc Ingestor & Semantic Graph)
**Purpose:** Scrape chaotic team handbooks or external API markdown, structure it into standardized pedagogical knowledge, and visualize the relationships.
**Technical Approach:**
* **Chunking & Embeddings:** Documentation text is chunked recursively. For each chunk, we calculate a text embedding using models (e.g., Titan Embeddings / OpenAI `text-embedding-3-small`) and store them in PostgreSQL via the `pgvector` extension.
* **Entity Extraction:** An LLM pipeline is triggered to extract an array of `learningConcepts` (Name, Definition) and `prerequisites` (e.g., to learn "React Hooks", you must first know "Closures").
* **Relational Persistence:** These nodes and edges are stored in `conceptCards` and `conceptRelationships` tables using a hierarchical Parent-Child schema.

### D. Mentor Engine (JIT Active Recall)
**Purpose:** A pedagogical system tracking the user's codebase interactions to force spaced-repetition learning instead of just auto-completing code.
**Technical Approach:**
* **Interaction Logging:** The frontend telemetry tracks what files/components the user lingers on or interacts with frequently.
* **Ebbinghaus Scheduling:** We implemented a cron-job (or serverless function) worker that calculates the Ebbinghaus forgetting curve formula. If a user was exposed to a specific technical model at $T_0$, active recall micro-challenges are surfaced in the UI at $T+24h$, $T+3d$, and $T+1w$.
* **Challenge Generation:** Using context-aware prompts, the API dynamically generates multichoice or fill-in-the-blank questions based on the exact variable names and functions from the user's repository.

---

## 3. Technology Stack

### Frontend UI & Client
* **Framework:** Next.js 14+ (App Router, Server Actions)
* **Styling:** Tailwind CSS, PostCSS
* **Animation:** Framer Motion (for physics-based layout transitions)
* **Graph Rendering:** `@xyflow/react` (React Flow)
* **Components:** Custom headless UI based on Shadcn

### Backend & AI Infrastructure
* **Runtime:** Node.js (via Next.js Edge/Serverless APIs)
* **Database:** PostgreSQL on Supabase or Neon (optimized for serverless connections)
* **ORM:** Drizzle ORM
* **Semantics & Search:** `pgvector` extension
* **AI Provider:** Amazon Bedrock (utilizing Anthropic's Claude 3 Sonnet and Mistral Large)
* **SDK:** Vercel AI SDK API for normalized multi-model message streaming

### Tooling & Parser
* **TypeScript** for end-to-end type safety
* **AST Utilities:** `ts-morph`, `acorn`

---

## 4. Database Schema Structure
VedCode utilizes a highly relational schema to tie user actions, architectural artifacts, and learning modules together.

| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | Core Auth & Profiles | Connects to sessions, memory retention |
| **`projectFiles`** | AST Structural Persistence | Hierarchical (`parentId` relates to self) |
| **`conceptCards`** | Pedagogical Modules from Ingestor | Has `prerequisite` IDs to other conceptCards |
| **`conceptRelationships`** | Maps edges between concepts | Join table for Knowledge Map rendering |
| **`memorySchedules`** | Stores Active Recall cron timings | Related to `conceptCards` and `users` |
| **`impactReports`** | Saves historical Context Guard alerts | Snapshots the AST state at time of diff |

---

## 5. Security & Authentication
* **Provider:** NextAuth.js (Auth.js v5) handling OAuth (GitHub, Google) and Credentials.
* **Session Strategy:** JWT Strategy with short-lived tokens and secure HttpOnly cookies.
* **Data Isolation:** All projects, AST outputs, and Memory Schedules are hard-isolated using Row-Level Security (RLS) policies mapped to the active `tenantId` or `userId`. Code parsed by the engine is processed ephemerally and sanitized before reaching the LLM layer.

---
*End of Technical Documentation*
