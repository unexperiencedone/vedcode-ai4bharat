"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const members = [
  {
    name: "Kalyan",
    handle: "kalyan",
    role: "Architect",
    bio: "Building systems that think.",
  },
  {
    name: "Riya",
    handle: "riya",
    role: "Designer",
    bio: "Crafting digital dreams.",
  }
];

export default function AtelierIndexPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">The Atelier</h1>
        <p className="text-white/60 mb-12 text-lg">
          The creative headquarters. Where code meets identity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member) => (
            <Link 
              key={member.handle} 
              href={`/atelier/${member.handle}`}
              className="group border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {member.name[0]}
                </div>
                <ArrowRight className="text-white/20 group-hover:text-white transition-colors" size={20} />
              </div>
              
              <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">{member.name}</h3>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3">{member.role}</div>
              <p className="text-white/60 text-sm">{member.bio}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
