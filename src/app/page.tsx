import { useState } from "react";
import { Link } from "react-router-dom";
import { starterPackSections } from "@/data/starterpacks";

export default function AppLandingPage() {
  const [openSection, setOpenSection] = useState<string | null>(
    starterPackSections.length > 0 ? starterPackSections[0]!.slug : null,
  );

  const handleToggle = (slug: string) => {
    setOpenSection((current) => (current === slug ? null : slug));
  };

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
          const isOpen = openSection === section.slug;
          return (
            <article key={section.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => handleToggle(section.slug)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
              >
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
                <span className="text-sm font-medium text-blue-500">{isOpen ? "접기" : "펼치기"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {section.topics.map((topic) => (
                      <Link
                        key={topic.slug}
                        to={`/app/${section.slug}/${topic.slug}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div>
                          <p className="font-medium">{topic.title}</p>
                          {topic.description && <p className="mt-1 text-xs text-slate-500">{topic.description}</p>}
                        </div>
                        <span className="text-xs font-semibold text-blue-500">바로가기 →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
