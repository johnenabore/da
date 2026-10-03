import type { Metadata } from "next";
import { AllWork } from "@/components/work/all-work";

export const metadata: Metadata = { title: "All work" };

export default function WorkPage() {
  return <AllWork />;
}
