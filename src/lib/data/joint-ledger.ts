export const ledgerStats = [
  { label: "Ledger Totals", value: "412.8", unit: "ETH", trend: "+12.4%" },
  { label: "Contributors", value: "12", unit: "Units", trend: "+2 Active" },
  { label: "Velocity", value: "2.4k", unit: "ops/d", trend: "+4.2%" },
];

export const ledgerProjects = [
  {
    id: "ARCH-042",
    title: "Hyperion Kernel",
    description: "Distributed low-latency ledger state management for Cluster 1 core services.",
    status: "Live",
    tags: ["Rust", "gRPC", "WASM"],
    contributors: 6,
  },
  {
    id: "ARCH-089",
    title: "Neural Linkage",
    description: "Predictive analysis of node behavior using federated learning across shared ledgers.",
    status: "Standby",
    tags: ["PyTorch", "Go"],
    contributors: 3,
  },
  {
    id: "ARCH-112",
    title: "Quantum Vault",
    description: "Post-quantum encryption layer for multi-signature high-value asset storage.",
    status: "Live",
    tags: ["Solidity", "Circom", "C++"],
    contributors: 5,
  },
];

export const ledgerActivity = [
  {
    timestamp: "2023-11-24 14:02:11",
    origin: "0x88...f2a",
    operation: "LEDGER_COMMIT_V2",
    value: "+1.242 ETH",
    status: "VERIFIED",
  },
  {
    timestamp: "2023-11-24 13:58:45",
    origin: "0x41...e31",
    operation: "NODE_SYNC_INITIALIZE",
    value: "---",
    status: "VERIFIED",
  },
  {
    timestamp: "2023-11-24 13:42:01",
    origin: "0x2b...9a0",
    operation: "ASSET_MINT_VAULT",
    value: "+15.000 ETH",
    status: "PENDING",
  },
  {
    timestamp: "2023-11-24 13:30:19",
    origin: "0x99...bb2",
    operation: "REBALANCE_C1_POOL",
    value: "-4.500 ETH",
    status: "VERIFIED",
  },
];
