"use client";

import { useState, useEffect } from "react";
import { Terminal, Code2, Moon, Sun } from "lucide-react";
import EditorWindow from "@/components/compiler/EditorWindow";
import OutputTerminal from "@/components/compiler/OutputTerminal";
import Sidebar from "@/components/compiler/Sidebar";
import ControlPanel from "@/components/compiler/ControlPanel";
import { detectLanguage } from "@/lib/languageDetector";

export default function CompilerPage() {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Auto Language Detection
  useEffect(() => {
    if (language === "auto") {
      const timer = setTimeout(() => {
        const detected = detectLanguage(code);
        setDetectedLanguage(detected);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    } else {
      setDetectedLanguage(language);
    }
  }, [code, language]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    // Apply theme class to body
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Handle Run Code
  const runCode = async () => {
    setIsLoading(true);
    setOutput(null);
    try {
      const activeLang = language === "auto" ? detectedLanguage : language;
      const response = await fetch(`/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLang,
          version: "*",
          code,
          stdin: customInput,
        }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({
        run: { stderr: "Failed to connect to the execution server.", code: 1 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0f172a] text-white" : "bg-gray-50 text-gray-900"} font-sans transition-colors duration-300`}
    >
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight neon-text">
            CodeFusion
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden lg:flex">
          <Sidebar activeLang={language} onSelect={setLanguage} />
        </div>

        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden relative">
          <ControlPanel
            language={language}
            setLanguage={setLanguage}
            detectedLanguage={detectedLanguage}
            runCode={runCode}
            isLoading={isLoading}
            code={code}
            setCode={setCode}
          />

          <div className="flex-1 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-4 min-h-0">
            <EditorWindow
              language={language}
              activeLang={language === "auto" ? detectedLanguage : language}
              code={code}
              setCode={setCode}
              theme={theme}
              runCode={runCode}
            />
            <OutputTerminal
              output={output}
              isLoading={isLoading}
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="glass-panel py-3 text-center text-sm text-gray-400 border-t border-white/5">
        Built by Satish | Powered by Local Execution Service
      </footer>
    </div>
  );
}
