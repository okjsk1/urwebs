import { Link } from "react-router-dom";
import categoriesData from "../data/categories";

export default function MainLanding() {
  const categories = [...categoriesData].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col-reverse items-center gap-8 px-4 pt-12 pb-8 md:flex-row md:gap-12 md:pt-24 md:pb-16">
        <div className="text-center md:text-left md:flex-1">
          <h1 className="text-4xl font-bold">URWEBS</h1>
          <p className="mt-2 text-lg text-gray-700">분야별로 빠르게 시작하세요</p>
          <Link to="/start" className="mt-4 inline-block text-sm text-blue-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            나의 시작페이지로 이동
          </Link>
        </div>
        <figure className="w-full md:flex-1">
          <img
            src="/assets/favorites-sample.webp"
            alt="즐겨찾기 예시 레이아웃 스크린샷"
            loading="lazy"
            width={1280}
            height={720}
            srcSet="/assets/favorites-sample.webp 1280w, /assets/favorites-sample.webp 640w"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-auto rounded-lg shadow"
          />
          <figcaption className="mt-2 text-xs text-gray-500 text-center md:text-right">
            즐겨찾기를 이렇게 정리할 수 있어요
          </figcaption>
        </figure>
      </section>
      <section className="flex-1 px-4 pb-12">
        <div className="mx-auto grid max-w-5xl gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/${cat.slug}`}
              className="flex flex-col items-center rounded-lg border bg-white p-4 text-center shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-3xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="mt-2 font-medium">{cat.title}</span>
              {cat.description && (
                <span className="mt-1 text-sm text-gray-600">
                  {cat.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
