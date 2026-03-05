"use client";

import Editor from "@monaco-editor/react";
import { useEffect } from "react";

interface EditorWindowProps {
  language: string;
  activeLang: string;
  code: string;
  setCode: (code: string) => void;
  runCode: () => void;
}

const EXT_MAP: Record<string, string> = {
  python: "py",
  javascript: "js",
  rust: "rs",
  cpp: "cpp",
  java: "java",
  c: "c",
  go: "go",
};

export default function EditorWindow({
  language,
  activeLang,
  code,
  setCode,
  runCode,
}: EditorWindowProps) {
  const ext = EXT_MAP[activeLang] ?? activeLang;

  // Persist per-language drafts
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`code_${language}`);
    if (saved) setCode(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleChange = (value: string | undefined) => {
    const val = value ?? "";
    setCode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(`code_${language}`, val);
    }
  };

  const handleMount = (editor: any, monaco: any) => {
    // Clean professional dark theme matching the app
    monaco.editor.defineTheme("archive-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "4b5563", fontStyle: "italic" },
        { token: "keyword", foreground: "60a5fa", fontStyle: "bold" },
        { token: "string", foreground: "34d399" },
        { token: "number", foreground: "f472b6" },
        { token: "type", foreground: "a78bfa" },
      ],
      colors: {
        "editor.background": "#0b0e11",
        "editor.lineHighlightBackground": "#ffffff06",
        "editorLineNumber.foreground": "#374151",
        "editorLineNumber.activeForeground": "#6b7280",
        "editor.selectionBackground": "#3b82f620",
        "editorCursor.foreground": "#3b82f6",
      },
    });
    monaco.editor.setTheme("archive-dark");

    // Ctrl+Enter / Cmd+Enter to run
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      runCode
    );
  };

  return (
    <div className="flex flex-col min-h-0 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-card">
        <div className="flex items-center gap-1.5 bg-background rounded-md px-3 py-1 border border-border">
          <span className="w-2 h-2 rounded-full bg-primary/60" />
          <span className="text-xs font-mono font-medium text-muted-foreground">
            main.{ext}
          </span>
        </div>
        <span className="ml-auto text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          {activeLang}
        </span>
      </div>

      {/* Monaco editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeLang}
          value={code}
          defaultValue="// Write your code here…"
          onChange={handleChange}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Geist Mono', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            renderLineHighlight: "gutter",
            overviewRulerBorder: false,
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
          }}
        />
      </div>
    </div>
  );
}
