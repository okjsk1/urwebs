// src/pages/MainLanding.tsx
import React from "react";
import { Link } from "react-router-dom";
import categoriesData from "../data/categories";
import { insurancePersonaItems } from "@/modules/insurance/PersonaPicker";

export default function MainLanding() {
  const categories = [...categoriesData].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <main className="min-h-screen flex flex-col">
      {/* 히어로 영역: 좌 텍스트 / 우 샘플 이미지 (모바일은 스택) */}
      <section className="flex flex-col-reverse items-center gap-8 px-4 pt-12 pb-8 md:flex-row md:gap-12 md:pt-24 md:pb-16">
        <div className="text-center md:text-left md:flex-1">
          <h1 className="text-4xl font-bold">URWEBS</h1>
          <p className="mt-2 text-lg text-gray-700">분야별로 빠르게 시작하세요</p>
          <Link
            to="/category/architecture"
            className="mt-4 inline-block text-sm text-blue-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            나의 시작페이지로 이동
          </Link>
          <Link
            to="/personas"
            className="mt-2 inline-block text-sm text-blue-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            페르소나 구분 보기
          </Link>
        </div>

        <figure className="w-full md:flex-1">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Question_mark.svg"
            alt="즐겨찾기 예시 레이아웃 스크린샷"
            loading="lazy"
            width={1280}
            height={720}
            className="w-full h-auto rounded-lg shadow"
          />
          <figcaption className="mt-2 text-xs text-gray-500 text-center md:text-right">
            즐겨찾기를 이렇게 정리할 수 있어요
          </figcaption>
        </figure>
      </section>

      {/* 분야 선택 그리드: auto-fit/minmax로 N개 확장 대응 */}
      <section className="flex-1 px-4 pb-12">
        <div className="mx-auto grid max-w-5xl gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {categories.map((cat) => {
            const content = (
              <>
                <span className="text-3xl" aria-hidden="true">
                  {cat.icon ?? cat.emoji}
                </span>
                <span className="mt-2 font-medium">{cat.title}</span>
                {cat.description && (
                  <span className="mt-1 text-sm text-gray-600">
                    {cat.description}
                  </span>
                )}
              </>
            );
            const className =
              "flex flex-col items-center rounded-lg border bg-white p-4 text-center shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

            // 보험 카테고리는 호버 시 바로 페르소나 선택을 표시
            if (cat.slug === "insurance") {
              return (
                <div key={cat.slug} className="relative group">
                  <div className={className}>{content}</div>
                  <div className="absolute inset-0 hidden group-hover:flex flex-col items-center justify-center gap-2 rounded-lg border bg-white p-4 shadow">
                    {insurancePersonaItems.map((it) => (
                      <Link
                        key={it.key}
                        to={`/category/insurance/${it.key}`}
                        className="px-2 py-1 hover:underline"
                      >
                        <span className="mr-1">{it.icon}</span>
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            // href가 http로 시작하면 외부 링크, 아니면 내부 라우팅
            if (cat.href?.startsWith("http")) {
              return (
                <a
                  key={cat.slug}
                  href={cat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={cat.slug}
                to={cat.href ?? `/category/${cat.slug}`}
                className={`${className}${cat.disabled ? " opacity-50 pointer-events-none" : ""}`}
                aria-disabled={cat.disabled}
                onClick={(e) => {
                  if (cat.disabled) {
                    e.preventDefault();
                  }
                }}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
