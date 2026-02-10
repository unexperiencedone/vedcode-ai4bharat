export const skills = {
  core: [
    { id: "rust", name: "Rust", level: 90, x: 50, y: 50, category: "Core" },
    { id: "ts", name: "TypeScript", level: 95, x: 20, y: 70, category: "Core" },
    { id: "python", name: "Python", level: 85, x: 80, y: 70, category: "Core" },
  ],
  frontend: [
    { id: "react", name: "React", level: 92, x: 20, y: 20, category: "Frontend" },
    { id: "next", name: "Next.js", level: 90, x: 10, y: 40, category: "Frontend" },
    { id: "three", name: "Three.js", level: 75, x: 30, y: 40, category: "Frontend" },
    { id: "webgl", name: "WebGL", level: 70, x: 40, y: 30, category: "Frontend" },
  ],
  backend: [
    { id: "node", name: "Node.js", level: 88, x: 70, y: 40, category: "Backend" },
    { id: "graphql", name: "GraphQL", level: 82, x: 80, y: 20, category: "Backend" },
    { id: "postgres", name: "PostgreSQL", level: 85, x: 90, y: 40, category: "Backend" },
    { id: "docker", name: "Docker", level: 80, x: 60, y: 30, category: "Backend" },
  ]
};

export const connections = [
  { from: "ts", to: "react" },
  { from: "ts", to: "next" },
  { from: "ts", to: "node" },
  { from: "rust", to: "webgl" },
  { from: "react", to: "next" },
  { from: "webgl", to: "three" },
  { from: "node", to: "graphql" },
  { from: "node", to: "postgres" },
];
