import { redirect } from "next/navigation";

// AI Öğretmen opens straight into the live lesson (founder decision
// 08.07.2026); the push-to-talk fallback lives at /dashboard/speaking/push.
export default function SpeakingIndex() {
  redirect("/dashboard/speaking/live");
}
