"use client";

import React, { useState, useEffect } from "react";
import { Plus, FolderGit2, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WorkspacesIndexPage() {
  const router = useRouter();
  const [codebases, setCodebases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const loadCodebases = async () => {
    try {
      const res = await fetch("/api/codebases");
      const data = await res.json();
      setCodebases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodebases();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/codebases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        const newCb = await res.json();
        router.push(`/workspace/${newCb.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/codebases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCodebases((prev) => prev.filter((cb) => cb.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 max-w-6xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-2">
            Your Codebases
          </h1>
          <p className="text-sm text-slate-400">
            Manage your individual projects and isolated sandbox environments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Card */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative group rounded-xl border border-dashed border-border bg-card/20 hover:bg-card/40 hover:border-indigo-500/50 transition-all p-6 flex flex-col justify-center items-center min-h-[200px]"
        >
            <form onSubmit={handleCreate} className="flex flex-col items-center w-full gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    <Plus size={24} />
                </div>
                <input 
                    type="text" 
                    placeholder="New Codebase Name..." 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-transparent border-b border-border focus:border-indigo-500 text-center text-white placeholder:text-slate-600 outline-none px-2 py-1 select-none"
                    disabled={isCreating}
                />
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-400 text-xs font-bold uppercase tracking-wider hover:bg-indigo-600/20 border border-indigo-500/20 disabled:hidden transition-colors"
                >
                  Create
                </button>
            </form>
        </motion.div>

        {/* Existing Codebases */}
        {codebases.map((cb, idx) => (
          <motion.div
            key={cb.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => router.push(`/workspace/${cb.id}`)}
            className="group relative rounded-xl border border-border bg-card hover:bg-accent/50 transition-all p-6 cursor-pointer flex flex-col justify-between min-h-[200px] overflow-hidden shadow-lg"
          >
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-emerald-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 transition-all duration-500" />
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FolderGit2 size={24} />
              </div>
              <button 
                onClick={(e) => handleDelete(e, cb.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="relative z-10 mt-6">
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                {cb.title}
              </h3>
              <div className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-2">
                 <span>ID: {cb.archiveId}</span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Node Environment</span>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
