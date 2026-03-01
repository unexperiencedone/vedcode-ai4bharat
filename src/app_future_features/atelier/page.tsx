"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
  handle: string;
  image: string | null;
  role: string | null;
  bio: string | null;
}

export default function AtelierIndexPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setMembers(data.recentMembers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-auto no-scrollbar">
      <div className="max-w-4xl mx-auto pt-12 px-8 pb-20">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">The Atelier</h1>
          <p className="text-white/50 text-sm">
            The creative headquarters. Where code meets identity.
          </p>
        </div>

        {members.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
            <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No members yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/atelier/${member.handle}`}
                className="group border border-white/[0.08] rounded-xl p-6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-white/[0.08] group-hover:ring-primary/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                      {member.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <ArrowRight className="text-white/10 group-hover:text-primary transition-colors" size={18} />
                </div>

                <h3 className="text-lg font-bold mb-0.5 group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3 font-bold">
                  @{member.handle} {member.role && `· ${member.role}`}
                </div>
                {member.bio && (
                  <p className="text-white/40 text-sm line-clamp-2">{member.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
