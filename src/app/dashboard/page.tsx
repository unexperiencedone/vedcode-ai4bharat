"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { DashboardView } from "@/components/dashboard/DashboardView";

export default function Dashboard() {
  const { data: session } = useSession();
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

  const handle = (session?.user as any)?.handle || "explorer";

  if (loading) {

    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
            Initializing Command Center...
          </p>
        </div>
      </div>
    );
  }

  return <DashboardView data={data} handle={handle} />;
}
