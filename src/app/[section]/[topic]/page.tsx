import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WidgetGrid } from "@/components/dashboard/WidgetGrid";
import { WidgetRenderer } from "@/components/dashboard/WidgetRenderer";
import { findGroup, findSection, findTopic } from "@/data/starterpacks";

interface StarterPackPageProps {
  sectionSlug: string;
  topicSlug: string;
}

export default function StarterPackPage({ sectionSlug, topicSlug }: StarterPackPageProps) {
  const section = findSection(sectionSlug);
  const topic = findTopic(sectionSlug, topicSlug);

  if (!section || !topic) {
    return (
      <DashboardLayout title="스타터팩을 찾을 수 없습니다">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          선택한 섹션 또는 토픽이 존재하지 않습니다.
        </div>
      </DashboardLayout>
    );
  }

  const group = findGroup(sectionSlug, topicSlug);
  const pageTitle = group
    ? `${section.title} · ${topic.title} · ${group.title}`
    : `${section.title} · ${topic.title}`;
  const description = group?.description ?? topic.description;

  return (
    <DashboardLayout title={pageTitle} description={description}>
      <WidgetGrid>
        <WidgetRenderer section={section} topic={topic} widgets={topic.widgets} />
      </WidgetGrid>
    </DashboardLayout>
  );
}
