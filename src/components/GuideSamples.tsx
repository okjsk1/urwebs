import { useEffect, useState } from "react";
import samples from "@/config/guideSamples";
import { Skeleton } from "./ui/skeleton";

interface Sample {
  src: string;
  title: string;
  caption?: string;
}

/** 부모가 show=false를 넘기면 DOM 자체를 만들지 않음 */
export default function GuideSamples({ show }: { show: boolean }) {
  if (!show) return null;
  return <GuideSamplesBody />;
}

function GuideSamplesBody() {
  const [open, setOpen] = useState<Sample | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <section
      id="guide-samples-section"
      className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 my-10"
    >
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">사용 가이드 샘플</h2>
          <p className="text-sm text-muted-foreground">폴더와 위젯을 이렇게 정리해 보세요</p>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {samples.map((it) => (
          <SampleCard key={it.src} sample={it} onOpen={(s) => setOpen(s)} />
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setOpen(null)}
        >
          <img
            src={open.src}
            alt={open.title}
            className="max-h-[90vh] max-w-[1152px] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

function SampleCard({ sample, onOpen }: { sample: Sample; onOpen: (s: Sample) => void }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <figure className="flex-shrink-0 w-72 sm:w-auto rounded-xl border bg-card" key={sample.src}>
      <button
        onClick={() => onOpen(sample)}
        className="block w-full overflow-hidden rounded-t-xl relative"
        aria-label={`${sample.title} 확대 보기`}
      >
        {!error && (
          <>
            <img
              src={sample.src}
              alt={sample.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`aspect-[16/9] w-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {!loaded && (
              <Skeleton className="absolute inset-0 aspect-[16/9] w-full" />
            )}
          </>
        )}
        {error && (
          <div className="aspect-[16/9] w-full bg-muted flex items-center justify-center text-muted-foreground">
            이미지를 불러오지 못했습니다
          </div>
        )}
      </button>
      <figcaption className="p-3">
        <div className="text-sm font-medium">{sample.title}</div>
        {sample.caption && <div className="text-xs text-muted-foreground">{sample.caption}</div>}
      </figcaption>
    </figure>
  );
}
