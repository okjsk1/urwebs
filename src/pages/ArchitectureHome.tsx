import { Link } from "react-router-dom";

export default function ArchitectureHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-blue-600 hover:underline">
          &larr; 메인
        </Link>
        <h1 className="mb-8 mt-4 text-3xl font-bold">건축학과</h1>
        <div className="space-y-4">
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">자료</h2>
            <p className="text-sm text-gray-600">
              건축 학생을 위한 자료가 모일 예정입니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">사이트</h2>
            <p className="text-sm text-gray-600">
              유용한 사이트 링크들을 준비합니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">도구</h2>
            <p className="text-sm text-gray-600">
              학습과 설계에 도움이 되는 도구를 소개할 예정입니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

