# Ved Code

**The Contextual Learning & Coding Intelligence Engine**

Learning technology today is paradoxical. Developers invest hours into tutorials and documentation, only to quickly forget what they've learned. The "fear of forgetting" forces them into an endless loop of re-watching theory. Meanwhile, existing coding assistants are largely stateless, lacking the context of the user's project and their learning history.

**Ved Code** is an AI-powered living mentor that transforms your coding environment. It remembers what you learn, understands your project structure, explains concepts visually, and warns you before your code breaks.

---

## The MVP Architecture

Ved Code is built on a clean, modern tech stack designed for high impact and scalable intelligence.

### Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS v4, Shadcn UI, Framer Motion
- **Backend:** Next.js App Router (Serverless API Routes) + Vercel AI SDK
- **Storage:** PostgreSQL, Drizzle ORM, Vector Database (for embeddings)
- **Intelligence Layer:** Multi-Agent Architecture (Recall Agent, JIT Explainer, Context Guard)
- **Processing:** AST Parsers (ts-morph/tree-sitter) & Embeddings Engine

---

## Core Features

### 1. Active Recall Sidekick 🧠
Eliminates the forgetting curve. Ved Code logs the concepts and keywords you use in your project (e.g., `Zod .refine()`) and triggers micro-challenges 24 hours later to rebuild your long-term memory.

### 2. Visual Knowledge "Galaxy" Mapping 🌌
Provides intuition over text-heavy documentation. Using Framer Motion and AST parsing, Ved Code visualizes your project's folder structure, file relationships, and module dependencies in an interactive node-edge graph.

### 3. JIT (Just-in-Time) Explainer
Converts specific keywords into laser-focused, contextual explanations based on *your* actual codebase, solving theory fatigue and information overload.

### 4. Pre-Execution "Context Guard" 🛠️
Runs a lightweight analysis on your codebase before execution to detect hidden ripple effects. It warns you precisely which files will break if you modify a specific schema or interface.

---

## Directory Structure (MVP Phase 1)

```
veda-code/
├── app/                    # Routing, Layouts, and Server Actions
│   ├── (auth)/             # Route group: /login, /register
│   ├── (dashboard)/        # Route group: /dashboard, /galaxy
│   ├── api/                # Route Handlers (AI Agents, Webhooks)
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Landing Page
├── components/             # React & UI Components
│   ├── galaxy/             # React Flow / Framer Motion logic
│   └── ui/                 # Shadcn primitives
├── db/                     # Drizzle Configuration & Schema
├── lib/                    # Shared logic & AI Agents
│   ├── agents/             # Recall, JIT, and Guard logic
│   └── parser/             # AST logic
└── public/                 # Static Assets
```

---

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up your database with Drizzle:
```bash
npm run db:push
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Why Ved Code?

Built for the **AI for Bharat (Student Track)**, Ved Code directly addresses the gap between theoretical learning and applied understanding, aiming to help developers and students learn up to 5x faster through active recall, visual intuition, and contextual intelligence.
