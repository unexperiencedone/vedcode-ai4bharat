"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MentorInsightWidget } from "./MentorInsightWidget";
import { getDynamicInsight } from "@/lib/actions/insightActions";

export function GlobalMentorOverlay() {
  const [insight, setInsight] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Reset insight on path change to allow new triggers
    setInsight(null);
    
    const timer = setTimeout(async () => {
      try {
        const dynamicInsight = await getDynamicInsight(pathname);
        if (dynamicInsight) {
          setInsight(dynamicInsight);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic insight:", error);
      }
    }, 45000); // 45s delay for a more natural pop-up


    return () => clearTimeout(timer);
  }, [pathname]);

  if (!insight) return null;

  return <MentorInsightWidget initialInsight={insight} />;
}

