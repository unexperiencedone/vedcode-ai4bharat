"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  FolderOpen,
  Play,
  Terminal,
  Plus,
  Save,
  FolderPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { FileTreeSidebar, FileNode } from "./FileTreeSidebar";

// Extension-to-monaco-language mapping. Covers more than what's executable —
// editing any file type is normal for an IDE; running it is a separate question
// (see EXECUTABLE_LANGUAGES below).
const getLanguageFromFile = (filename: string | undefined) => {
  if (!filename) return "typescript";
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "c":
    case "h":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
      return "cpp";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "json":
      return "json";
    case "html":
      return "html";
    case "css":
      return "css";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

// Exactly what /api/execute can actually run — kept in sync with
// src/app/api/execute/route.ts's LANGUAGES map by hand, since this is a small,
// fixed, honestly-scoped list (see PROGRESS.md Part 1 #9). Anything else edits
// fine but can't be run from here; the Run button reflects that instead of
// hitting the endpoint and failing.
const EXECUTABLE_LANGUAGES = new Set([
  "python", "javascript", "c", "cpp", "java", "go", "rust",
]);

interface WorkspaceEditorProps {
  projectId: string;
}

export function WorkspaceEditor({ projectId }: WorkspaceEditorProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customInput, setCustomInput] = useState("");
  const [creatingRootNode, setCreatingRootNode] = useState<{
    isFolder: boolean;
    active: boolean;
  } | null>(null);

  // Terminal UI State
  const [terminalHeight, setTerminalHeight] = useState(192); // 48 * 4 (h-48)
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);
  // Rendered via JSX below, not innerHTML — program output (stdout/stderr) is
  // untrusted content and was previously concatenated straight into the DOM via
  // `.innerHTML +=`, which is a stored-XSS vector for any program that prints
  // HTML/script-like text. React's default text rendering escapes it.
  type LogLine = { kind: "info" | "stdout" | "stderr" | "error"; text: string };
  const [runtimeLogs, setRuntimeLogs] = useState<LogLine[]>([
    { kind: "info", text: "VedCode IDE ready." },
  ]);
  const appendLog = (line: LogLine) => setRuntimeLogs((prev) => [...prev, line]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [runtimeLogs]);

  // Resizing Terminal Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingTerminal) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 40 && newHeight <= window.innerHeight * 0.8) {
        setTerminalHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      setIsResizingTerminal(false);
      document.body.style.cursor = "default";
    };

    if (isResizingTerminal) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingTerminal]);

  const loadFiles = useCallback(async () => {
    if (!session?.user?.id || !projectId) return;
    try {
      const res = await fetch(`/api/workspace/files?projectId=${projectId}`);
      const fetchedFiles = await res.json();
      setFiles(fetchedFiles);

      if (!activeFile && fetchedFiles.length > 0) {
        // Just pick the first file (not folder)
        const firstFile = fetchedFiles.find((f: FileNode) => !f.isFolder);
        if (firstFile) {
          setActiveFile(firstFile);
          setCode(firstFile.fileContent || "");
        }
      }
    } catch (error) {
      console.error("Failed to load project files:", error);
    } finally {
      setLoading(false);
    }
  }, [session, activeFile]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileSelect = (file: FileNode) => {
    if (file.isFolder) return;
    setActiveFile(file);
    setCode(file.fileContent || "");
  };

  const handleCreateNode = async (
    parentId: number | null,
    isFolder: boolean,
    name: string,
  ) => {
    try {
      const res = await fetch("/api/workspace/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          isFolder,
          name,
          filePath: `/${name}`,
          projectId,
        }),
      });
      if (res.ok) {
        const newFile = await res.json();
        setFiles((prev) => [...prev, newFile]);
        if (!isFolder) {
          setActiveFile(newFile);
          setCode("");
        }
      }
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleRenameNode = async (id: number, newName: string) => {
    try {
      const res = await fetch(`/api/workspace/files/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name: newName } : f)),
        );
        if (activeFile?.id === id)
          setActiveFile((prev) => (prev ? { ...prev, name: newName } : null));
      }
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleDeleteNode = async (id: number) => {
    try {
      const res = await fetch(`/api/workspace/files/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // The server cascade-deletes the whole subtree if `id` is a folder;
        // reflect all of it here too, not just the clicked node, or deleted
        // children linger in the tree until the next reload.
        const { deletedIds } = (await res.json()) as { deletedIds: number[] };
        const deletedSet = new Set(deletedIds);
        setFiles((prev) => prev.filter((f) => !deletedSet.has(f.id)));
        if (activeFile && deletedSet.has(activeFile.id)) {
          setActiveFile(null);
          setCode("");
        }
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workspace/files/${activeFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileContent: code }),
      });
      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === activeFile.id ? { ...f, fileContent: code } : f,
          ),
        );
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeLanguage = getLanguageFromFile(activeFile?.name);
  const isRunnable = EXECUTABLE_LANGUAGES.has(activeLanguage);

  const handleExecute = async () => {
    if (!activeFile || !isRunnable) return;

    appendLog({ kind: "info", text: `> Executing ${activeFile.name}...` });
    setIsExecuting(true);

    try {
      const response = await fetch('/api/execute', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLanguage,
          code: code,
          stdin: customInput,
        }),
      });

      const data = await response.json();

      // Read `data.error` first and stop there — this is the fix for the bug
      // where a hard failure (auth, unsupported language, sandbox unavailable)
      // used to fall through to `data.run?.code ?? 0` and print "Process exited
      // with code 0", i.e. report a failure as a clean success. A real failure
      // now always shows as a real error, never as a fabricated exit code.
      if (!response.ok || data.error) {
        appendLog({ kind: "error", text: data.error || `Execution failed (HTTP ${response.status}).` });
        return;
      }

      if (data.run?.stderr) {
        appendLog({ kind: "stderr", text: data.run.stderr });
      }
      if (data.run?.stdout) {
        appendLog({ kind: "stdout", text: data.run.stdout });
      }
      appendLog({ kind: "info", text: `Process exited with code ${data.run?.code}.` });
    } catch {
      appendLog({ kind: "error", text: "Failed to connect to execution engine." });
    } finally {
      setIsExecuting(false);
    }
  };

  // Monaco's onMount fires once per editor instance, not per render — a command
  // bound directly to `handleExecute` there would close over whatever `activeFile`
  // was at mount time and never see later ones. Keeping the latest version in a
  // ref lets the Ctrl/Cmd+Enter binding (registered once, below) always call
  // through to the current file.
  const handleExecuteRef = useRef(handleExecute);
  useEffect(() => { handleExecuteRef.current = handleExecute; });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Initialising Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Removed the isolated full-page empty state so the Sidebar always renders

  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* Lightweight File Explorer */}
      <div className="w-64 border-r border-border bg-card/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FolderOpen size={14} /> Explorer
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCreatingRootNode({ isFolder: false, active: true })
              }
              className="text-slate-500 hover:text-white transition-colors"
              title="New File"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() =>
                setCreatingRootNode({ isFolder: true, active: true })
              }
              className="text-slate-500 hover:text-white transition-colors"
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
          </div>
        </div>

        <FileTreeSidebar
          files={files}
          activeFileId={activeFile?.id || null}
          onFileSelect={handleFileSelect}
          onCreateNode={handleCreateNode}
          onRenameNode={handleRenameNode}
          onDeleteNode={handleDeleteNode}
          externalCreateRoot={creatingRootNode}
          onExternalCreateClear={() => setCreatingRootNode(null)}
        />
      </div>

      {/* Monaco Editor Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300 font-mono">
              {activeFile?.name || "No file selected"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveFile}
              disabled={isSaving || !activeFile}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
            >
              <Save size={12} /> {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting || !activeFile || !isRunnable}
              title={
                !activeFile
                  ? undefined
                  : isRunnable
                    ? "Run (Ctrl/Cmd+Enter)"
                    : `Run isn't available for .${activeFile.name.split(".").pop()} files — supported: Python, JavaScript, C, C++, Java, Go, Rust`
              }
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {isExecuting ? (
                 <>
                   <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                   Running...
                 </>
              ) : (
                <>
                   <Play size={12} /> Run Task
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative z-20 text-left overflow-visible">
          {activeFile ? (
            <Editor
              height="100%"
              language={activeLanguage}
              theme="archive-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={(editor, monaco) => {
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
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handleExecuteRef.current());
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-geist-mono)",
                fontLigatures: true,
                padding: { top: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                fixedOverflowWidgets: true,
              }}
            />
          ) : (
            <div className="flex w-full h-full items-center justify-center text-slate-500 text-sm font-mono">
              Select a file to edit
            </div>
          )}
        </div>

        {/* Resizable Terminal/Console integration stub */}
        <div
          className="border-t border-slate-800 bg-background shrink-0 flex flex-col relative z-20"
          style={{ height: `${terminalHeight}px` }}
        >
          {/* Drag Handle */}
          <div
            className="absolute top-0 left-0 right-0 h-1 cursor-row-resize z-50 hover:bg-indigo-500/50 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingTerminal(true);
            }}
          />

          <div className="h-8 border-b border-border bg-card/50 flex items-center px-4 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
              <Terminal size={12} /> Runtime Output
            </span>
          </div>
          <div ref={logContainerRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
            {runtimeLogs.map((line, i) => (
              <div
                key={i}
                className={
                  line.kind === "stderr" || line.kind === "error"
                    ? "text-red-400 whitespace-pre-wrap break-words"
                    : line.kind === "stdout"
                      ? "text-slate-300 whitespace-pre-wrap break-words"
                      : "text-emerald-400/80"
                }
              >
                {line.text}
              </div>
            ))}
          </div>
          
          {/* Terminal Input */}
          <div className="h-10 border-t border-border bg-card/30 flex items-center px-4 shrink-0">
             <span className="text-emerald-500 font-mono text-xs mr-2">{'>'}</span>
             <input 
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter standard input (stdin) before running..."
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-300 placeholder:text-slate-600"
             />
          </div>
        </div>
      </div>

      {/* Note: The Right Sidebar (AITutorSidebar) is injected at the layout level outside this component */}
    </div>
  );
}
