
export type ComponentItem = {
  id: string;
  name: string;
  type: "ui" | "layout" | "animation";
  code: string;
  description: string;
};

export const componentRegistry: ComponentItem[] = [
  {
    id: "neon-button",
    name: "Neon Button",
    type: "ui",
    description: "A cyberpunk-style button with neon glow effects.",
    code: `<button class="relative px-6 py-3 font-bold text-white transition-all duration-300 bg-transparent border-2 border-cyan-400 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.5)] hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:text-cyan-300 active:scale-95">
  Initialize System
  <div class="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 bg-cyan-400/5 blur-md"></div>
</button>`,
  },
  {
    id: "glass-card",
    name: "Glassmorphism Card",
    type: "layout",
    description: "A frosted glass card with subtle borders.",
    code: `<div class="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl max-w-sm">
  <h3 class="text-xl font-bold text-white mb-2">Neural Link</h3>
  <p class="text-gray-400 text-sm">Synchronizing neural pathways with the central archive database.</p>
</div>`,
  },
  {
    id: "cli-input",
    name: "Terminal Input",
    type: "ui",
    description: "A terminal-style text input field.",
    code: `<div class="relative flex items-center w-full max-w-md">
  <span class="absolute left-4 text-green-500 font-mono text-lg">></span>
  <input 
    type="text" 
    class="w-full pl-10 pr-4 py-3 bg-black/80 border border-green-500/30 rounded-lg text-green-400 font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-green-500/30 transition-all"
    placeholder="Enter command..."
  />
</div>`,
  },
    {
    id: "status-badge",
    name: "Status Badge",
    type: "ui",
    description: "An animated status indicator.",
    code: `<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
  <span class="relative flex h-2 w-2">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
  </span>
  <span class="text-xs font-medium text-emerald-400">OPERATIONAL</span>
</div>`,
  }
];
