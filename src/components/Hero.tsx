import React from "react";

interface HeroProps {
  onStart: () => void;
  onPreview: () => void;
}

export function Hero({ onStart, onPreview }: HeroProps) {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">쓸 만한 웹이 한 곳에</h1>
      <p className="text-lg text-gray-600 mb-6">
        로그인 없이 바로 쓰는 소스 모음. 먼저 구경해보세요.
      </p>
      <div className="flex justify-center gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          onClick={onStart}
          type="button"
        >
          즐겨찾기 시작
        </button>
        <button
          className="border px-6 py-2 rounded"
          onClick={onPreview}
          type="button"
        >
          스타터 세트 미리보기
        </button>
      </div>
    </section>
  );
}
