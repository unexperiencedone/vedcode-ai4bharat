"use client";

import { motion } from "framer-motion";

const languages = [
  { id: "auto", name: "Auto-Detect", icon: "✨" },
  { id: "c", name: "C", icon: "📝" },
  { id: "cpp", name: "C++", icon: "⚙️" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JS", icon: "💛" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
];

const Sidebar = ({
  activeLang,
  onSelect,
}: {
  activeLang: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <aside className="w-16 lg:w-20 glass-panel border-r border-white/5 flex flex-col items-center py-6 gap-6 z-10 shrink-0 overflow-y-auto">
      {languages.map((lang) => (
        <motion.button
          key={lang.id}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(lang.id)}
          className={`relative group w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
            activeLang === lang.id
              ? "bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border-white/30 shadow-[0_0_15px_rgba(157,0,255,0.4)]"
              : "hover:bg-white/5 border-transparent opacity-60 hover:opacity-100"
          } border shrink-0`}
        >
          {lang.icon}

          {/* Tooltip */}
          <span className="absolute left-14 lg:left-16 bg-dark-card border border-white/10 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-gray-200 z-50 shadow-xl">
            {lang.name}
          </span>

          {activeLang === lang.id && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -left-[25px] w-1 h-8 bg-gradient-to-b from-neon-blue to-neon-purple rounded-r-full"
            />
          )}
        </motion.button>
      ))}
    </aside>
  );
};

export default Sidebar;
