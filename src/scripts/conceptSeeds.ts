export const technologySeeds = [
  {
    slug: "react",
    name: "React",
    category: "frontend",
    officialDocsUrl: "https://react.dev/reference/react",
    concepts: [
      { name: "JSX", priority: "core" },
      { name: "Components", priority: "core" },
      { name: "Props", priority: "core" },
      { name: "State", priority: "core" },
      { name: "useState", priority: "core" },
      { name: "useEffect", priority: "core" },
      { name: "useRef", priority: "core" },
      { name: "useMemo", priority: "core" },
      { name: "useCallback", priority: "core" },
      { name: "Context API", priority: "core" },
      { name: "Custom Hooks", priority: "core" },
      { name: "Virtual DOM", priority: "advanced" },
      { name: "Reconciliation", priority: "advanced" },
      { name: "Keys", priority: "core" },
      { name: "Error Boundaries", priority: "advanced" },
      { name: "React.memo", priority: "advanced" },
      { name: "Suspense", priority: "advanced" },
      { name: "Concurrent Rendering", priority: "advanced" }
    ]
  },
  {
    slug: "nextjs",
    name: "Next.js",
    category: "framework",
    officialDocsUrl: "https://nextjs.org/docs",
    concepts: [
      { name: "App Router", priority: "core" },
      { name: "Server Components", priority: "core" },
      { name: "Client Components", priority: "core" },
      { name: "Routing Fundamentals", priority: "core" },
      { name: "Layouts and Templates", priority: "core" },
      { name: "Loading UI", priority: "core" },
      { name: "Error Handling", priority: "core" },
      { name: "Data Fetching", priority: "core" },
      { name: "Server Actions", priority: "core" },
      { name: "Static Site Generation (SSG)", priority: "core" },
      { name: "Server-Side Rendering (SSR)", priority: "core" },
      { name: "Incremental Static Regeneration (ISR)", priority: "advanced" },
      { name: "Route Handlers", priority: "core" },
      { name: "Middleware", priority: "advanced" },
      { name: "Image Optimization", priority: "core" },
      { name: "Metadata", priority: "core" }
    ]
  },
  {
    slug: "postgresql",
    name: "PostgreSQL",
    category: "database",
    officialDocsUrl: "https://www.postgresql.org/docs/",
    concepts: [
      { name: "Tables and Columns", priority: "core" },
      { name: "Primary Keys", priority: "core" },
      { name: "Foreign Keys", priority: "core" },
      { name: "SELECT Statements", priority: "core" },
      { name: "WHERE Clauses", priority: "core" },
      { name: "JOINs", priority: "core" },
      { name: "INNER JOIN", priority: "core" },
      { name: "LEFT JOIN", priority: "core" },
      { name: "GROUP BY", priority: "core" },
      { name: "HAVING", priority: "core" },
      { name: "Indexes", priority: "advanced" },
      { name: "Transactions", priority: "advanced" },
      { name: "ACID Properties", priority: "advanced" },
      { name: "Views", priority: "advanced" },
      { name: "CTEs (WITH)", priority: "advanced" },
      { name: "pgvector", priority: "advanced" }
    ]
  },
  {
    slug: "javascript",
    name: "JavaScript",
    category: "language",
    officialDocsUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    concepts: [
      { name: "Async/Await", priority: "core" },
      { name: "Promises", priority: "core" },
      { name: "Fetch API", priority: "core" },
      { name: "Error Handling", priority: "core" },
      { name: "ES Modules", priority: "core" },
      { name: "Destructuring", priority: "core" },
      { name: "Arrow Functions", priority: "core" },
      { name: "Template Literals", priority: "core" }
    ]
  },
  {
    slug: "typescript",
    name: "TypeScript",
    category: "language",
    officialDocsUrl: "https://www.typescriptlang.org/docs/",
    concepts: [
      { name: "Interfaces", priority: "core" },
      { name: "Types", priority: "core" },
      { name: "Generics", priority: "advanced" },
      { name: "Enums", priority: "core" },
      { name: "Utility Types", priority: "advanced" }
    ]
  }
];
