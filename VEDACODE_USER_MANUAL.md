# VedCode User Manual
**Version 1.0 | The Definitive Guide to Architectural Intelligence**

Welcome to VedCode. This manual is designed to help you navigate, utilize, and master our platform. Whether you are a junior developer tasked with onboarding onto a massive legacy system, or a senior engineer ensuring system stability before a major deployment, VedCode was built to give you total visibility and continuous learning.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [The VedCode Dashboard (Command Center)](#2-the-vedcode-dashboard)
3. [Project Constellation: Visualizing Architecture](#3-project-constellation)
4. [Context Guard: Preventing Broken Builds](#4-context-guard)
5. [The Knowledge Studio: Ingestion & Skill Trees](#5-the-knowledge-studio)
6. [Mentor Engine & Active Recall: Continuous Learning](#6-mentor-engine--active-recall)

---

## 1. Getting Started

### Accessing the Platform
1. Navigate to the **Landing Page**. (You can view our mission, core platform features, and learning modules here).
2. Click **Start Learning Free** or **Sign In** from the top navigation.
3. Once you log in or register via GitHub, Google, or your Email/Password, you will be directed to the **Command Center (Dashboard)**.

### Platform Navigation
Your primary way to move through VedCode is the **Global Navigation Sidebar (Cluster Rail)** located on the left side of your screen:
* **Dashboard (Home):** Your metrics and active projects.
* **Knowledge Studio / Explorer:** Your gateway to Project Constellation and the Universal Knowledge Graph.
* **Document Explainer:** The Doc Ingestor for generating mental models.
* **Universal Handbook:** The global repository of all your ingested concepts and learning paths.

---

## 2. The VedCode Dashboard

The **Dashboard (`/dashboard`)** acts as your central command. It provides a real-time, high-level overview of your architectural health.

### Quick Metrics
At the top of the dashboard, you will see four critical system indicators:
* **Active Projects:** Number of underlying codebases you are tracking.
* **Live Deployments:** Successful environments currently running.
* **Pending Review:** Crucial items that need your attention (often flagged by Context Guard).
* **Storage Used:** The capacity of your decentralized strata storage.

### Workspace Actions
* **Search / Command Palette:** Use the search bar (or press `Cmd + K`) anywhere in the app to instantly search for projects, specific files, or learned concepts.
* **Project Status:** Projects in your grid will show their live statuses—**Live** (Green), **In Design** (Indigo), or **Paused** (Amber). Clicking a project tile will take you into its specific workspace.

---

## 3. Project Constellation

**Project Constellation** is your architectural map. It translates complex, nested folders of code into a highly interactive, visual, node-based graph.

### How to use Project Constellation:
1. Navigate to the **Knowledge Studio** from the sidebar.
2. Select **Constellation View**.
3. **Graph Exploration:** You will see your codebase rendered as a galaxy of connected nodes (files and functions).
    * **Pan & Zoom:** Click and drag to move around the graph. Scroll to zoom in and out.
    * **Dependency Lines:** The glowing lines connecting nodes represent exact AST (Abstract Syntax Tree) imports and dependencies.
4. **Stress Indicators:** Nodes with dense, tight coupling (where a file imports heavily from, or is imported heavily by, others) will glow brighter or turn red/amber. These are your architectural bottlenecks.
5. **Node Interaction:** Click on any specific file node. A side panel will open showing the code contents, the purpose of the file, and its calculated impact score.

---

## 4. Context Guard

**Context Guard** is your safety net before committing changes. It tracks the "blast radius" or ripple effect of any code modification you attempt.

### How to use Context Guard:
1. Inside the **Knowledge Studio** or your active workspace, switch to **Guard Mode**.
2. **Analyze Difference:** When you input or connect a proposed code change (a pull request diff), Context Guard cross-references this diff against the AST graph.
3. **Ripple Effect Visualization:** On the screen, you will see a simulation. The file you modified will light up, and glowing red lines will shoot outward, illuminating every downstream file, API, or component that relies on the altered code.
4. **Impact Report:** Review the AI-generated impact analysis report on the right-hand side. It will detail exactly *why* a downstream file might break (e.g., "Changing the authentication payload in `auth.ts` will break the serialization in `userProfile.tsx`").

---

## 5. The Knowledge Studio

VedCode's philosophy is that you shouldn't just read code; you should truly understand the engineering concepts behind it.

### A. Doc Ingestor
If you are struggling to understand a specific library, framework, or internal proprietary system, use the **Doc Ingestor**.
1. Navigate to the **Document Explainer** in the sidebar.
2. Paste raw fragmented documentation text, a GitHub URL, or external API docs into the ingestor prompt.
3. Click **Synthesize**. The AI will parse the document, extract the core prerequisites, establish a "Mental Model", and generate code examples.

### B. Knowledge Map & Universal Handbook
Once data is ingested or concepts are learned, they are stored globally.
1. Click the **Handbook** icon in the sidebar.
2. Under the **Global Knowledge Map** tab, you will see your "Skill Tree"—an interactive React Flow graph showing how concepts like *React Hooks*, *Redux*, and *JWT Auth* are related to one another.
3. This creates a standardized, consumable curriculum for your personal growth or your team's onboarding.

---

## 6. Mentor Engine & Active Recall

The ultimate feature of VedCode is its continuous learning loop. It does not just act as an autocomplete tool; it acts as a senior engineer pair-programming with you.

### A. Just-In-Time (JIT) Explanations
When browsing code within the platform, if the Mentor Engine detects you hovering or struggling with complex logic (e.g., a complicated Regex or a Rust memory allocation):
1. A **JIT Explainer** tooltip will gently appear.
2. It breaks down the logic line-by-line, using the exact context of your project, not generic examples.

### B. Mastery Engine (Roadmap Player & Recall)
Learning something once means you will likely forget it.
1. As you explore concepts and files, VedCode schedules **Active Recall Micro-challenges** according to the Ebbinghaus forgetting curve.
2. You will be prompted with short, contextual quizzes customized to the code you've previously studied at optimal intervals (e.g., T+24h, T+3 days).
3. Earning successful recall increases your mastery score, tracking your journey from novice to architectural expert in real-time.

---

### Need Help?
If you run into any issues, you can always use the `Cmd + K` Command Palette to type `? Help` or access our manifesto for deeper architectural philosophies. 

Welcome to the future of developer tooling. **Master your codebase with VedCode.**
