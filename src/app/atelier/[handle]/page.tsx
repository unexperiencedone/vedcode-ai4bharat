"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Box, Terminal, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data fetcher (replace with actual DB call later)
const getProfile = async (handle: string) => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  if (handle === "kalyan") {
    return {
      name: "Kalyan",
      handle: "kalyan",
      role: "Architect",
      bio: "Building systems that think. Obsessed with high-fidelity interactions and clean data flows.",
      currentLearning: "Agentic AI Patterns",
      hobbies: [
        { name: "Photography", icon: <Camera size={14} />, detail: "Leica M6" },
        { name: "Piano", icon: <Activity size={14} />, detail: "Jazz Improvisation" }
      ],
      socials: { twitter: "@kalyan", github: "kalyan" },
      stats: {
        snippets: 42,
        contributions: 128,
        streak: 15
      },
      portfolio: [
        { type: "img", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", aspectRatio: "aspect-[4/3]" },
        { type: "3d", url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop", aspectRatio: "aspect-square" },
        { type: "img", url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop", aspectRatio: "aspect-[3/4]" },
      ]
    };
  }
  return null;
};

export default function AtelierPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile(handle).then((data) => {
      if (!data) notFound();
      setProfile(data);
      setLoading(false);
    });
  }, [handle]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyan-500 font-mono">INITIALIZING ATELIER...</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">


      <div className="pt-24 pb-20 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Technical Context (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          
          {/* Profile Card */}
          <div className="flex flex-col gap-6">
             <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-2">
                {profile.name[0]}
             </div>
             <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">{profile.role}</h1>
                <p className="text-white/60 leading-relaxed max-w-md">{profile.bio}</p>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Snippets</div>
                <div className="text-2xl font-mono text-cyan-400">{profile.stats.snippets}</div>
             </div>
             <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Impact</div>
                <div className="text-2xl font-mono text-purple-400">{profile.stats.contributions}</div>
             </div>
          </div>

          {/* Learning Log - Active */}
          <div className="border border-cyan-500/30 bg-cyan-500/5 rounded-xl p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-50"><Activity className="text-cyan-500" /></div>
             <div className="text-cyan-500 text-xs uppercase tracking-widest mb-2 font-bold">Current Focus</div>
             <div className="text-xl text-white font-medium">{profile.currentLearning}</div>
             <div className="mt-4 text-xs text-cyan-400/60 font-mono">Last updated 2h ago</div>
          </div>
          
           {/* Hobbies / DNA */}
          <div className="space-y-4">
            <div className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10 pb-2">Personal DNA</div>
            <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 hover:border-white/30 transition-colors cursor-default">
                        {hobby.icon}
                        <span>{hobby.name}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-white/40 italic">{hobby.detail}</span>
                    </div>
                ))}
            </div>
          </div>

        </div>

        {/* Right Column: Creative Output (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Portfolio Grid */}
            <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-white">Visual Logs</h2>
                    <button className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ArrowUpRight size={12} />
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[300px]">
                    {profile.portfolio.map((item: any, i: number) => (
                        <div key={i} className={cn(
                            "relative group overflow-hidden rounded-xl border border-white/10 bg-white/5",
                            i === 0 ? "md:col-span-2" : ""
                        )}>
                            <img 
                                src={item.url} 
                                alt="Portfolio" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                            />
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <div className="text-xs font-mono text-white/70 uppercase tracking-widest">{item.type === '3d' ? 'Render Output' : 'Photography'}</div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Contributions / Code Heatmap (Placeholder) */}
            <div className="p-8 border border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center">
                 <Terminal className="text-white/20 mb-4" size={32} />
                 <h3 className="text-white/40 font-mono text-sm">CONTRIBUTION GRAPH GENERATING...</h3>
            </div>

        </div>
      </div>
    </div>
  );
}
