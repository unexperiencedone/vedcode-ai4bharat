"use client";

import { useEffect, useState } from "react";
// Disabling Next-Auth session checks since auth is bypassed globally
// import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { DashboardView } from "@/components/dashboard/DashboardView";

export default function RootDashboard() {
  // const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Set a default mock handle since authentication is bypassed
  const handle = "local_explorer";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#080b14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
            Initializing Command Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <DashboardView data={data} handle={handle} />
    </div>
  );
}
