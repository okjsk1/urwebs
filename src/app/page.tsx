import { useState } from "react";
import { Link } from "react-router-dom";
import { starterPackSections } from "@/data/starterpacks";

export default function AppLandingPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    starterPackSections[0]?.slug ?? null,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-medium text-blue-500">URwebs 스타터팩</p>
        <h1 className="text-3xl font-bold text-slate-800">관심사에 맞는 대시보드를 바로 시작하세요</h1>
        <p className="text-sm text-slate-500">
          업무, 취미, 학습, 자기계발, 일상까지. 원하는 토픽을 선택하면 필요한 위젯이 자동으로 준비됩니다.
        </p>
      </header>
      <section className="space-y-4">
        {starterPackSections.map((section) => {
          const isExpanded = expandedSection === section.slug;
          return (
            <article
              key={section.slug}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setExpandedSection(isExpanded ? null : section.slug)}
                className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
              >
                <div>
                  <div className="text-lg font-semibold text-slate-800">{section.title}</div>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
                <span className="text-sm font-medium text-blue-500">
                  {isExpanded ? "접기" : "보기"}
                </span>
              </button>
              {isExpanded && section.groups && (
                <div className="space-y-6 border-t border-slate-100 px-6 py-6">
                  {section.groups.map((group) => (
                    <div key={group.slug} className="space-y-2">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">{group.title}</h3>
                        {group.description && (
                          <p className="text-xs text-slate-500">{group.description}</p>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.topics.map((topic) => (
                          <Link
                            key={topic.slug}
                            to={`/app/${section.slug}/${topic.slug}`}
                            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <span>{topic.title}</span>
                            <span className="text-xs text-blue-500">바로가기 →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
