"use client";

import { Play, Copy, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ControlPanelProps {
  language: string;
  setLanguage: (lang: string) => void;
  detectedLanguage?: string;
  runCode: () => void;
  isLoading: boolean;
  code: string;
  setCode: (code: string) => void;
}

const ControlPanel = ({
  language,
  setLanguage,
  runCode,
  isLoading,
  code,
  setCode,
  detectedLanguage,
}: ControlPanelProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const activeLang = language === "auto" ? detectedLanguage : language;
    const fileExt =
      activeLang === "python"
        ? "py"
        : activeLang === "javascript"
          ? "js"
          : activeLang === "rust"
            ? "rs"
            : activeLang;
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `main.${fileExt}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClear = () => {
    setCode("");
  };

  return (
    <div className="glass-panel rounded-xl p-3 flex flex-wrap gap-4 justify-between items-center border border-white/10 bg-[#0f172a]/90 backdrop-blur-md">
      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-400 hidden sm:block">
          Language:
        </label>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg focus:ring-neon-blue focus:border-neon-blue block p-2.5 pr-8 outline-none font-semibold uppercase tracking-wider cursor-pointer shadow-inner"
          >
            <option value="auto">
              ✨ Auto-Detect{" "}
              {language === "auto" && detectedLanguage
                ? `(${detectedLanguage})`
                : ""}
            </option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Copy Code"
          onClick={handleCopy}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
        >
          <Copy size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Download File"
          onClick={handleDownload}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
        >
          <Download size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Clear Editor"
          onClick={handleClear}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-white/10 text-gray-300 transition-colors"
        >
          <Trash2 size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runCode}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed hidden"
              : "bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_20px_rgba(157,0,255,0.5)]"
          } ${isLoading && "opacity-70 grayscale"}`}
        >
          <Play size={18} fill="currentColor" />
          <span>{isLoading ? "Running..." : "Run Code"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ControlPanel;
