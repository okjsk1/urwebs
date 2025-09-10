import { Link } from "react-router-dom";

export default function RealEstateHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-blue-600 hover:underline">
          &larr; 메인
        </Link>
        <h1 className="mb-8 mt-4 text-3xl font-bold">부동산</h1>
        <div className="space-y-4">
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">매물/시세</h2>
            <p className="text-sm text-gray-600">
              부동산 매물과 시세 정보를 확인합니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">지도/입지</h2>
            <p className="text-sm text-gray-600">
              위치와 주변 환경을 살펴봅니다.
            </p>
          </section>
          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">정책/뉴스</h2>
            <p className="text-sm text-gray-600">
              부동산 관련 정책과 뉴스를 모아봅니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

