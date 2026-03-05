import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Code2, BrainCircuit, Target, Send, ShieldAlert } from 'lucide-react';
import { TutorIntentRouter, ReasoningContext } from '@/lib/code-intelligence/tutorIntentRouter';

interface Message {
    id: string;
    role: 'user' | 'tutor';
    content: string;
    contextUsed?: ReasoningContext;
}

export function AITutorSidebar() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'tutor',
            content: "Hi. I'm your engineering mentor. I'm connected to your codebase graph and your learning profile. How can we improve this code today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // Mock global context that would normally come from the IDE state / Context API
    const mockGlobalContext = {
        activeFile: 'src/lib/auth/authMiddleware.ts',
        activeConcepts: ['async_await', 'error_handling'],
        recentCommitConcepts: ['async_await'],
        currentStress: 0.72,
        userProfileId: 'user_123'
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // 1. Route the intent through the intelligence layers (Reasoning Interface)
        const context = await TutorIntentRouter.routeQuery(
            userMsg.content,
            mockGlobalContext.activeFile,
            mockGlobalContext.userProfileId,
            mockGlobalContext
        );

        // Simulate LLM processing time based on the structured context
        setTimeout(() => {
            let reply = "";
            
            // 2. The LLM acts purely as an explanation layer for the system reasoning
            if (context.intent === 'debug') {
                reply = `Let's inspect this together. \${context.systemReasoning} I recommend wrapping the await call with try/catch to handle rejections properly.`;
            } else if (context.intent === 'architecture') {
                reply = `\${context.systemReasoning} Specifically, consider extracting the token validation logic into a separate utility to reduce coupling.`;
            } else if (context.intent === 'concept') {
                reply = `\${context.systemReasoning} Think of it like a restaurant order: you place the order (await) and do other things until the food arrives.`;
            } else if (context.intent === 'learning') {
                reply = `\${context.systemReasoning} Would you like me to load a short lesson and interactive exercise on that topic?`;
            } else {
                reply = `I see you are working in \${context.activeFile}. \${context.systemReasoning}`;
            }

            const tutorMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                role: 'tutor', 
                content: reply,
                contextUsed: context
            };

            setMessages(prev => [...prev, tutorMsg]);
            setIsThinking(false);
        }, 1500);
    };

    // The most recent context used by the tutor dictates what we show in the Context panels
    const latestContext = messages.filter(m => m.contextUsed).pop()?.contextUsed;

    return (
        <div className="w-80 h-full bg-[#0a0f18] border-l border-white/5 flex flex-col shadow-2xl shrink-0">
            {/* Context Header Tabs (The "Transparent Reasoning" UI) */}
            <div className="flex flex-col bg-slate-900/80 border-b border-white/5 p-4 shrink-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <BrainCircuit className="text-indigo-400" size={16} /> Tutor Context
                </h3>
                
                <div className="space-y-3">
                    {/* Active File Context */}
                    <div className="bg-slate-800/50 rounded p-2 border border-slate-700/50">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1">
                            <Code2 size={10} /> Active File
                        </div>
                        <div className="text-xs text-slate-300 truncate font-mono">
                            {mockGlobalContext.activeFile}
                        </div>
                    </div>

                    {/* Mastery Context */}
                    <div className="bg-slate-800/50 rounded p-2 border border-slate-700/50">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1">
                            <Target size={10} /> Your Mastery (Active Concepts)
                        </div>
                        <div className="flex gap-2">
                            {mockGlobalContext.activeConcepts.map(c => {
                                const score = latestContext?.userMastery[c] !== undefined ? latestContext.userMastery[c] : 0.2;
                                return (
                                    <div key={c} className="bg-white/5 px-2 py-1 rounded text-[10px] text-slate-300 border border-white/10 flex items-center gap-1">
                                        {c}
                                        <span className={`w-1.5 h-1.5 rounded-full \${score > 0.6 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Intent Router View (Only visible if the system routed a query) */}
                    {latestContext && (
                         <div className="bg-indigo-500/10 rounded p-2 border border-indigo-500/20">
                             <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1 flex items-center gap-1">
                                 <ShieldAlert size={10} /> Last Detected Intent
                             </div>
                             <div className="text-xs text-indigo-300 font-medium capitalize">
                                 {latestContext.intent} Router
                             </div>
                         </div>
                    )}
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence>
                    {messages.map(msg => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed \${
                                msg.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                            }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    {isThinking && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start"
                        >
                            <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2">
                                <span className="animate-pulse w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                <span className="animate-pulse w-1.5 h-1.5 bg-slate-400 rounded-full delay-75"></span>
                                <span className="animate-pulse w-1.5 h-1.5 bg-slate-400 rounded-full delay-150"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-white/5 shrink-0">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your mentor..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 p-1.5 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
