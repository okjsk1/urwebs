import { Link } from "react-router-dom";

export default function StocksHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-blue-600 hover:underline">
          &larr; 메인
        </Link>
        <h1 className="mb-8 mt-4 text-3xl font-bold">증권</h1>
        <div className="space-y-4">
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">관심 종목</h2>
            <p className="text-sm text-gray-600">
              추적 중인 종목을 관리합니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">시장 요약</h2>
            <p className="text-sm text-gray-600">
              주요 지수와 시장 흐름을 확인합니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">학습/전략</h2>
            <p className="text-sm text-gray-600">
              투자 학습 자료와 전략을 모읍니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

