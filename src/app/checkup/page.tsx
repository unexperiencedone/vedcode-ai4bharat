import { CheckupView } from "@/components/dashboard/CheckupView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkup | VedCode",
  description:
    "View your cognitive state, concept timelines, and architectural heatmaps.",
};

export default function CheckupPage() {
  return <CheckupView />;
}
