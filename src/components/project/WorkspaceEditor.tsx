"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FolderOpen, FileCode, Play, Terminal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock File Structure for the Demo
const MOCK_FILES = [
    { name: 'authMiddleware.ts', language: 'typescript', content: `import { NextRequest, NextResponse } from 'next/server';\n\nexport async function middleware(req: NextRequest) {\n    // Phase 9: Tutor Integration\n    const token = req.cookies.get('token');\n    \n    if (!token) {\n        return NextResponse.redirect('/login');\n    }\n    \n    return NextResponse.next();\n}` },
    { name: 'tutorIntentRouter.ts', language: 'typescript', content: `export class TutorIntentRouter {\n  static detectIntent(q: string) { return 'debug'; }\n}` },
    { name: 'package.json', language: 'json', content: `{\n  "name": "ved-code",\n  "version": "1.0.0"\n}` },
];

export function WorkspaceEditor() {
    const [activeFile, setActiveFile] = useState(MOCK_FILES[0]);
    const [code, setCode] = useState(activeFile.content);

    const handleFileSelect = (file: any) => {
        setActiveFile(file);
        setCode(file.content);
    };

    return (
        <div className="flex h-full w-full bg-[#0a0f18] text-foreground">
            
            {/* Lightweight File Explorer */}
            <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FolderOpen size={14} /> Explorer
                    </span>
                    <button className="text-slate-500 hover:text-white transition-colors"><Plus size={14} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {MOCK_FILES.map(file => (
                        <div 
                            key={file.name}
                            onClick={() => handleFileSelect(file)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors \${activeFile.name === file.name ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                            <FileCode size={14} className={activeFile.name === file.name ? 'text-indigo-400' : 'text-slate-500'} />
                            {file.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Monaco Editor Canvas */}
            <div className="flex-1 flex flex-col">
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300 font-mono">{activeFile.name}</span>
                        {/* Tab styling */}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors">
                            <Play size={12} /> Run Task
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={activeFile.language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: 'var(--font-geist-mono)',
                            padding: { top: 16 },
                            smoothScrolling: true,
                            cursorBlinking: 'smooth'
                        }}
                    />
                </div>

                {/* Lightweight Terminal/Console integration stub */}
                <div className="h-48 border-t border-slate-800 bg-[#0a0f18] shrink-0 flex flex-col">
                    <div className="h-8 border-b border-slate-800 bg-slate-900/50 flex items-center px-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
                            <Terminal size={12} /> Runtime Output
                        </span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-slate-400 overflow-y-auto">
                        Ved Code Hybrid IDE Initialized.<br/>
                        Connecting to Language Server... Done.<br/>
                        Linking Mentor Observability Layer... Active.
                    </div>
                </div>
            </div>

            {/* Note: The Right Sidebar (AITutorSidebar) is injected at the layout level outside this component */}
        </div>
    );
}
