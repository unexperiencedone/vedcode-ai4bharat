"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FileNode {
  id: number;
  userId: string;
  name: string;
  isFolder: boolean;
  parentId: number | null;
  filePath: string;
  fileContent: string;
  children?: FileNode[];
}

interface FileTreeSidebarProps {
  files: FileNode[];
  activeFileId: number | null;
  onFileSelect: (file: FileNode) => void;
  onCreateNode: (
    parentId: number | null,
    isFolder: boolean,
    name: string,
  ) => void;
  onRenameNode: (id: number, newName: string) => void;
  onDeleteNode: (id: number) => void;
  externalCreateRoot?: { isFolder: boolean; active: boolean } | null;
  onExternalCreateClear?: () => void;
}

export function FileTreeSidebar({
  files,
  activeFileId,
  onFileSelect,
  onCreateNode,
  onRenameNode,
  onDeleteNode,
  externalCreateRoot,
  onExternalCreateClear,
}: FileTreeSidebarProps) {
  // Build tree from flat list
  const fileTree = buildTree(files);

  const [creatingInParent, setCreatingInParent] = useState<{
    id: number | null;
    isFolder: boolean;
  } | null>(null);
  const [createInput, setCreateInput] = useState("");

  // Sync external create trigger (from WorkspaceEditor Header)
  React.useEffect(() => {
    if (externalCreateRoot?.active) {
      setCreatingInParent({ id: null, isFolder: externalCreateRoot.isFolder });
      if (onExternalCreateClear) onExternalCreateClear();
    }
  }, [externalCreateRoot, onExternalCreateClear]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createInput.trim() && creatingInParent) {
      onCreateNode(
        creatingInParent.id,
        creatingInParent.isFolder,
        createInput.trim(),
      );
      setCreatingInParent(null);
      setCreateInput("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {fileTree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          activeFileId={activeFileId}
          onFileSelect={onFileSelect}
          onAddFile={(parentId: number) =>
            setCreatingInParent({ id: parentId, isFolder: false })
          }
          onAddFolder={(parentId: number) =>
            setCreatingInParent({ id: parentId, isFolder: true })
          }
          onRename={onRenameNode}
          onDelete={onDeleteNode}
          creatingInParent={creatingInParent}
          createInput={createInput}
          setCreateInput={setCreateInput}
          handleCreateSubmit={handleCreateSubmit}
          setCreatingInParent={setCreatingInParent}
        />
      ))}

      {/* Root level creation */}
      {creatingInParent?.id === null && (
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center gap-2 px-2 py-1 mt-1 ml-2"
        >
          {creatingInParent.isFolder ? (
            <Folder size={14} className="text-slate-500" />
          ) : (
            <FileCode size={14} className="text-slate-500" />
          )}
          <input
            autoFocus
            className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-indigo-500/50 outline-none w-full"
            value={createInput}
            onChange={(e) => setCreateInput(e.target.value)}
            onBlur={() => setCreatingInParent(null)}
            placeholder={
              creatingInParent.isFolder ? "Folder name..." : "File name..."
            }
          />
        </form>
      )}

      {files.length === 0 && !creatingInParent && (
        <div className="text-center p-4">
          <p className="text-xs text-slate-500 mb-4">No files yet.</p>
          <div className="flex justify-center gap-2 text-xs">
            <button
              onClick={() => setCreatingInParent({ id: null, isFolder: false })}
              className="hover:text-indigo-400 text-slate-400"
            >
              Add File
            </button>
            <button
              onClick={() => setCreatingInParent({ id: null, isFolder: true })}
              className="hover:text-amber-400 text-slate-400"
            >
              Add Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to build tree
function buildTree(files: FileNode[]): FileNode[] {
  const map = new Map<number, FileNode>();
  const roots: FileNode[] = [];

  // Initialize
  files.forEach((f) => map.set(f.id, { ...f, children: [] }));

  // Build relationships
  files.forEach((f) => {
    if (f.parentId) {
      const parent = map.get(f.parentId);
      if (parent) {
        parent.children!.push(map.get(f.id)!);
      } else {
        roots.push(map.get(f.id)!); // Fallback if parent missing
      }
    } else {
      roots.push(map.get(f.id)!);
    }
  });

  // Sort: folders first, then alphabetical
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
    nodes.forEach((n) => ({ ...n, children: sortNodes(n.children || []) }));
    return nodes;
  };

  return sortNodes(roots);
}

// Recursive Tree Node Component
function TreeNode({
  node,
  level,
  activeFileId,
  onFileSelect,
  onAddFile,
  onAddFolder,
  onRename,
  onDelete,
  creatingInParent,
  createInput,
  setCreateInput,
  handleCreateSubmit,
  setCreatingInParent,
}: any) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    }
    setIsEditing(false);
  };

  if (node.isFolder) {
    return (
      <div>
        <div
          className="group flex items-center justify-between px-2 py-1 text-sm rounded-md cursor-pointer hover:bg-slate-800 text-slate-300"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div
            className="flex items-center gap-1.5 flex-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronDown size={14} className="text-slate-500" />
            ) : (
              <ChevronRight size={14} className="text-slate-500" />
            )}
            <Folder size={14} className="text-amber-500/80" />

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex-1">
                <input
                  autoFocus
                  className="bg-slate-900 text-slate-200 text-xs px-1 rounded border border-amber-500/50 outline-none w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                />
              </form>
            ) : (
              <span className="truncate flex-1 text-xs">{node.name}</span>
            )}
          </div>

          <div className="hidden group-hover:flex items-center gap-1 text-slate-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(node.id);
                setIsOpen(true);
              }}
              className="hover:text-white p-0.5"
            >
              <Plus size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFolder(node.id);
                setIsOpen(true);
              }}
              className="hover:text-white p-0.5"
            >
              <Folder size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="hover:text-blue-400 p-0.5"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="hover:text-red-400 p-0.5"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {creatingInParent?.id === node.id && (
                <form
                  onSubmit={handleCreateSubmit}
                  className="flex items-center gap-2 py-1 mt-1"
                  style={{ paddingLeft: `${(level + 1) * 12 + 28}px` }}
                >
                  {creatingInParent.isFolder ? (
                    <Folder size={14} className="text-amber-500/80" />
                  ) : (
                    <FileCode size={14} className="text-slate-500" />
                  )}
                  <input
                    autoFocus
                    className="bg-slate-900 text-slate-200 text-xs px-1 py-0.5 rounded border border-indigo-500/50 outline-none w-[120px]"
                    value={createInput}
                    onChange={(e) => setCreateInput(e.target.value)}
                    onBlur={() => setCreatingInParent(null)}
                    placeholder={
                      creatingInParent.isFolder ? "Folder..." : "File..."
                    }
                  />
                </form>
              )}
              {node.children?.map((child: any) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  activeFileId={activeFileId}
                  onFileSelect={onFileSelect}
                  onAddFile={onAddFile}
                  onAddFolder={onAddFolder}
                  onRename={onRename}
                  onDelete={onDelete}
                  creatingInParent={creatingInParent}
                  createInput={createInput}
                  setCreateInput={setCreateInput}
                  handleCreateSubmit={handleCreateSubmit}
                  setCreatingInParent={setCreatingInParent}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render File
  return (
    <div
      className={`group flex items-center justify-between px-2 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${activeFileId === node.id ? "bg-indigo-500/20 text-indigo-300 font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
      onClick={() => onFileSelect(node)}
    >
      <div className="flex items-center gap-2 flex-1 truncate">
        <FileCode
          size={14}
          className={
            activeFileId === node.id ? "text-indigo-400" : "text-slate-500"
          }
        />
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex-1">
            <input
              autoFocus
              className="bg-slate-900 text-slate-200 text-xs px-1 rounded border border-indigo-500/50 outline-none w-full"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => setIsEditing(false)}
            />
          </form>
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </div>

      <div className="hidden group-hover:flex items-center gap-1 text-slate-500 pl-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="hover:text-blue-400 p-0.5"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="hover:text-red-400 p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
