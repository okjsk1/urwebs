import { Navigate, useParams } from "react-router-dom";
import StarterPackPage from "@/app/[section]/[topic]/page";

export default function StarterPackRoute() {
  const params = useParams<{ section: string; topic: string }>();
  const section = params.section ?? "";
  const topic = params.topic ?? "";

  if (!section || !topic) {
    return <Navigate to="/app" replace />;
  }

  return <StarterPackPage sectionSlug={section} topicSlug={topic} />;
}
