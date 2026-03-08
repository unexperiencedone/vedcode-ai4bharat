"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// Basic extension-to-monaco-language mapping
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
        setFiles((prev) => prev.filter((f) => f.id !== id));
        if (activeFile?.id === id) {
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

  const handleExecute = async () => {
    if (!activeFile) return;

    const currentLogs = document.getElementById('runtime-logs');
    if (currentLogs) {
      currentLogs.innerHTML += `<br/><span class="text-emerald-400">&gt; Executing ${activeFile.name}...</span><br/>`;
      currentLogs.scrollTop = currentLogs.scrollHeight;
    }

    setIsExecuting(true);
    let lang = getLanguageFromFile(activeFile.name);
    // Overrides for piston compatibility
    if (lang === 'typescript') lang = 'typescript';
    if (lang === 'javascript') lang = 'javascript';

    try {
      const response = await fetch('/api/execute', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          version: "*",
          code: code,
          stdin: customInput,
        }),
      });

      const data = await response.json();
      
      if (currentLogs) {
        if (data.run?.stderr) {
            currentLogs.innerHTML += `<span class="text-red-400 break-pre-wrap whitespace-pre-wrap">${data.run.stderr}</span><br/>`;
        }
        if (data.run?.stdout) {
            currentLogs.innerHTML += `<span class="text-slate-300 break-pre-wrap whitespace-pre-wrap">${data.run.stdout}</span><br/>`;
        }
        if (!data.run?.stderr && !data.run?.stdout && data.message) {
             currentLogs.innerHTML += `<span class="text-amber-400 break-pre-wrap whitespace-pre-wrap">${data.message}</span><br/>`;
        }
        currentLogs.innerHTML += `<span class="text-slate-500">Process exited with code ${data.run?.code ?? 0}.</span><br/>`;
        currentLogs.scrollTop = currentLogs.scrollHeight;
      }
    } catch (err: any) {
      if (currentLogs) {
         currentLogs.innerHTML += `<span class="text-red-400">Failed to connect to execution engine.</span><br/>`;
         currentLogs.scrollTop = currentLogs.scrollHeight;
      }
    } finally {
      setIsExecuting(false);
    }
  };

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
              disabled={isExecuting || !activeFile}
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
              language={getLanguageFromFile(activeFile?.name)}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-geist-mono)",
                padding: { top: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
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
          <div
            id="runtime-logs"
            className="flex-1 p-4 font-mono text-xs text-slate-400 overflow-y-auto custom-scrollbar"
          >
            VedCode Hybrid IDE Initialized.
            <br />
            Connecting to Language Server... Done.
            <br />
            Linking Mentor Observability Layer... Active.
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
