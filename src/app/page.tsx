import { Link } from "react-router-dom";
import { starterPackSections } from "@/data/starterpacks";

export default function AppLandingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-medium text-blue-500">URwebs 스타터팩</p>
        <h1 className="text-3xl font-bold text-slate-800">관심사에 맞는 대시보드를 바로 시작하세요</h1>
        <p className="text-sm text-slate-500">
          업무, 취미, 학습, 자기계발, 일상까지. 원하는 토픽을 선택하면 필요한 위젯이 자동으로 준비됩니다.
        </p>
      </header>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {starterPackSections.map((section) => (
          <article key={section.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{section.description}</p>
            <div className="mt-4 space-y-2">
              {section.topics.map((topic) => (
                <Link
                  key={topic.slug}
                  to={`/app/${section.slug}/${topic.slug}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>{topic.title}</span>
                  <span className="text-xs text-blue-500">바로가기 →</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
