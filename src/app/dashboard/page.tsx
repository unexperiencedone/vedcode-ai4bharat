"use client";

import { FeaturedWorks } from "@/components/home/FeaturedWorks";
import { LiveFeed } from "@/components/home/LiveFeed";

export default function Dashboard() {
  return (
    <div className="flex h-full overflow-hidden">
      <FeaturedWorks />
      <LiveFeed />
    </div>
  );
}
