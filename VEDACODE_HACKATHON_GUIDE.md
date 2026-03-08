# VedCode: The Definitive User Guide

## Overview

Welcome to **VedCode**, the intelligent developer platform designed to bridge the gap between architectural context and continuous technical mastery. 

In today’s fast-paced engineering ecosystem, developers spend the majority of their time trying to understand complex codebases, dealing with fragmented documentation, and accidentally introducing regression bugs when unaware of hidden dependencies. **VedCode solves this.**

By combining intelligent codebase analysis (AST parsing), Just-In-Time (JIT) learning, and active knowledge retention, VedCode empowers every engineer to understand what they are interacting with, the impact of their changes, and the fundamental concepts behind the architecture—without ever context-switching out of their workflow.

---

## 1. Project Constellation (Architectural Intelligence)
*See the invisible threads holding your codebase together.*

**The Problem:** Large codebases turn into "black boxes." Changing a simple utility function can inadvertently break business logic three modules away due to tight coupling.
**The Solution:** The Project Constellation feature transforms your repository into an interactive galaxy.

* **AST Dependency Analysis:** VedCode parses the Abstract Syntax Tree (AST) of your project, detecting how files, components, and functions import and utilize each other.
* **Stress Indication:** Nodes (files/modules) graphically indicate their "stress level" or coupling density. Hovering over a node reveals the true architecture of your codebase, helping you identify bottlenecks and overly complex areas before they become technical debt.
* **Ripple Effect Mapping:** Instantly see which files rely on the current active file, allowing you to gauge the collateral impact of a refactor.

---

## 2. Context Guard (Proactive Impact Analysis)
*Never break the build again.*

**The Problem:** Unintended side effects and "blast radius" logic errors are only caught much later in the CI/CD pipeline, wasting valuable engineering hours.
**The Solution:** Context Guard simulates your exact code diffs and traces the ripple effect across the entire system.

* **Diff Contextualization:** By combining an LLM analysis with the existing AST mapping, Context Guard intelligently understands *what* your code changes mean functionally.
* **Blast Radius Tracing:** Before committing, the platform warns you of the downstream layers (APIs, databases, interconnected UI components) that your edit affects. 
* **Safe Delivery:** Engineering confidence goes up, drastically reducing the rollback rate of deployments.

---

## 3. Knowledge Studio
*Turning fragmented documentation into an interactive curriculum.*

A core philosophy of VedCode is that *reading code* isn't the same as *learning concepts*. The Knowledge Studio actively bridges this gap through four interconnected tools:

### A. Doc Ingestor (Universal Scraper)
* **How it works:** Point the Doc Ingestor at any fragmented markdown, external API documentation, or internal handbook. 
* **The Magic:** Using advanced AI synthesis, it automatically extracts "mental models," prerequisites, and related concepts—structuring chaotic text into standardized, consumable learning nodes.

### B. Knowledge Map 
* **How it works:** A React Flow interactive graph charting the relationships between all ingested concepts.
* **The Magic:** It creates a "Skill Tree" for your project. A new hire can instantly see the required knowledge path—from understanding the basic routing paradigm to mastering the complex distributed database layer.

### C. Roadmap Player
* **How it works:** Dynamically generated step-by-step curricula tailored to the user's specific learning needs or project requirements.
* **The Magic:** Based on what the user touches in the codebase, the Roadmap Player curates a specialized learning path, ensuring they aren’t overwhelmed by irrelevant information.

### D. Mastery Engine (Active Recall & Spaced Repetition)
* **How it works:** The platform introduces active recall challenges based on the Ebbinghaus forgetting curve.
* **The Magic:** When you learn a new concept (like a new dependency injection paradigm), the Mastery Engine schedules micro-challenges at optimal intervals, solidifying your understanding into long-term memory. 

---

## 4. Mentor Engine & JIT (Just-In-Time) Learning
*An AI pair-programmer that focuses on "Why," not just "How."*

Most AI assistants write the code for you, leaving you dependent on their outputs. The Mentor Engine focuses on **teaching**.

* **Gap Detection:** The system actively monitors your interaction with the codebase. If you are struggling with a complex React custom hook or a Rust memory allocation, the Mentor Engine detects the learning gap.
* **JIT Explanations:** It delivers highly-contextual explanations specifically aligned with the lines of code you are reading.
* **Personalized Feedback:** It doesn't just hand you the answer; it guides your thinking process, helping you develop true engineering intuition.

---

## 5. The Command Center (Dashboard & Global Navigation)
*Your professional engineering workspace.*

VedCode isn't just a set of utilities; it’s a high-end, distraction-free environment optimized for deep work. 

* **Universal Handbook:** Seamlessly access the Knowledge Graph and Doc Ingestor tools from the global sidebar.
* **Real-time Metrics:** The dynamic dashboard surface gives you a high-level view of your architectural health—Active Projects, Live Deployments, Items Pending Review, and Storage Usage.
* **Sleek, Responsive UI:** Built with performance and aesthetics in mind. Glassmorphism, subtle micro-animations (Framer Motion), and glowing status indicators make it a premium digital atelier.

---

## Conclusion: The VedCode Edge
VedCode is building the future of developer tooling. We aren't simply providing another AI autocomplete tool; we are providing **Architectural Intelligence**. We are preserving logic, surfacing context, and empowering engineers to learn continuously while they build. 

*Stop wrestling with hidden dependencies. Master your architecture. Elevate your engineering with VedCode.*
