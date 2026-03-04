"use client";

import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

interface EditorWindowProps {
  language: string;
  activeLang: string;
  code: string;
  setCode: (code: string) => void;
  theme: string;
  runCode: () => void;
}

const EditorWindow = ({
  language,
  activeLang,
  code,
  setCode,
  theme,
  runCode,
}: EditorWindowProps) => {
  const monaco = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    monaco.current = editor;

    // Custom theme definition to match neon design
    monacoInstance.editor.defineTheme("neon-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
      ],
      colors: {
        "editor.background": "#1e293b00", // transparent to let glassmorphism show
        "editor.lineHighlightBackground": "#ffffff0a",
      },
    });

    monacoInstance.editor.setTheme(theme === "dark" ? "neon-dark" : "vs");

    // Ctrl+Enter / Cmd+Enter shortcut
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        runCode();
      },
    );
  };

  useEffect(() => {
    // Load from local storage
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem(`code_${language}`);
      if (savedCode) setCode(savedCode);
    }
  }, [language, setCode]);

  const handleChange = (value: string | undefined) => {
    const val = value || "";
    setCode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(`code_${language}`, val);
    }
  };

  const fileExt =
    activeLang === "python"
      ? "py"
      : activeLang === "javascript"
        ? "js"
        : activeLang === "rust"
          ? "rs"
          : activeLang;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl overflow-hidden flex flex-col min-h-0 border border-white/10 relative shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
    >
      <div className="bg-[#1e293b] border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400 font-mono">main.{fileExt}</span>
      </div>

      <div className="flex-1 relative bg-[#1e293b]/50">
        <Editor
          height="100%"
          language={activeLang}
          value={code}
          theme={theme === "dark" ? "neon-dark" : "light"}
          defaultValue="// Write your code here"
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />
      </div>
    </motion.div>
  );
};

export default EditorWindow;
