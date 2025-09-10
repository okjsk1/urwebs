import { Link } from "react-router-dom";

export default function MainLanding() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 text-center">
      <h1 className="text-3xl font-bold">서비스 선택</h1>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Link
          to="/architecture"
          className="rounded border bg-white px-6 py-3 text-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          건축학과
        </Link>
        <Link
          to="/realestate"
          className="rounded border bg-white px-6 py-3 text-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          부동산
        </Link>
        <Link
          to="/stocks"
          className="rounded border bg-white px-6 py-3 text-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          증권
        </Link>
      </div>
      <Link to="/start" className="mt-8 text-sm text-blue-600 underline">
        나의 시작페이지로 이동
      </Link>
    </main>
  );
}

