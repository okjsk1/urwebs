import React, { useEffect, useMemo, useRef, useState } from "react";

const DESKTOP_WIDTH = 1280;

type Arrow = "top" | "bottom" | "left" | "right";

type StepDef = {
  id: number;
  title: string;
  description: string;
  findTarget: () => HTMLElement | null;
  preferredArrow?: Arrow;
};

interface UserGuideProps {
  onClose: () => void;
}

export function UserGuide({ onClose }: UserGuideProps) {
  const [idx, setIdx] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [arrow, setArrow] = useState<Arrow>("top");
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [overlayReady, setOverlayReady] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const observerRef = useRef<MutationObserver | null>(null);
  const resizeHandlerRef = useRef<() => void>(() => {});
  const rafRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);

  // ---------- helpers ----------
  const norm = (s: string) => (s || "").replace(/\s+/g, " ").trim();

  const queryByText = (selectors: string, needle: string) => {
    const nodes = document.querySelectorAll<HTMLElement>(selectors);
    const want = norm(needle);
    for (const n of Array.from(nodes)) {
      const txt = norm(n.innerText || n.textContent || "");
      if (txt.includes(want)) return n;
    }
    return null;
  };

  const nearestColumnByHeading = (...candidates: string[]) => {
    const heading =
      queryByText("h1,h2,h3,div,span", candidates[0]) ||
      (candidates[1] ? queryByText("h1,h2,h3,div,span", candidates[1]) : null);
    if (!heading) return null;
    let p: HTMLElement | null = heading as HTMLElement;
    for (let i = 0; i < 6 && p; i++) {
      if (p.classList && /col-span-|grid|space-y-|grid-cols-|container|content/.test(p.className)) {
        return p;
      }
      p = p.parentElement;
    }
    return heading as HTMLElement;
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // ---------- steps ----------
  const steps: StepDef[] = useMemo(
    () => [
      {
        id: 1,
        title: "사이트 설명 보기",
        description: "오른쪽 상단 토글을 켜면 각 사이트의 설명이 보입니다.",
        findTarget: () =>
          document.querySelector<HTMLElement>('[data-guide="desc-toggle"]') ||
          document.querySelector<HTMLElement>('label[for="description-toggle"]') ||
          document.querySelector<HTMLElement>("#description-toggle")?.parentElement ||
          queryByText("label,div,span,button", "사이트 설명 보기"),
      },
      {
        id: 2,
        title: "사이트 추가",
        description: "‘사이트 추가’ 버튼으로 내 링크를 추가해보세요.",
        findTarget: () =>
          document.querySelector<HTMLElement>('[data-guide="add-site"]') ||
          queryByText("button,a", "사이트 추가") ||
          queryByText("button,a", "+ 사이트 추가") ||
          queryByText("button,a", "+사이트 추가"),
      },
      {
        id: 3,
        title: "즐겨찾기 관리",
        description: "좌측 ‘즐겨찾기’ 목록에서 항목을 드래그해 폴더로 옮길 수 있어요.",
        findTarget: () =>
          document.querySelector<HTMLElement>('[data-guide="fav-col"]') ||
          nearestColumnByHeading("📌 즐겨찾기", "즐겨찾기"),
      },
      {
        id: 4,
        title: "폴더 정리",
        description: "‘폴더’ 영역에서 폴더를 만들거나 이름을 바꿔보세요.",
        findTarget: () =>
          document.querySelector<HTMLElement>('[data-guide="folder-col"]') ||
          nearestColumnByHeading("📂 폴더", "폴더"),
      },
      {
        id: 5,
        title: "저장하기",
        description: "로그인해서 즐겨찾기/설정을 저장하면 다음에도 그대로 쓸 수 있어요.",
        findTarget: () =>
          document.querySelector<HTMLElement>('[data-guide="save"]') ||
          queryByText("button", "저장하기") ||
          queryByText("button", "로그인하여 저장"),
      },
    ],
    []
  );

  const getStep = (i = idx) => steps[i];

  // ---------- layout ----------
  const placeTooltip = (el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = DESKTOP_WIDTH;
    const vh = window.innerHeight;
    const margin = 12;
    const w = 320; // 예상 카드 폭
    const h = 160; // 예상 카드 높이

    // 대상 기준 자동 배치
    let a: Arrow = "top";
    if (rect.bottom + h + margin < vh) a = "bottom";
    else if (rect.top - h - margin > 0) a = "top";
    else if (rect.right + w + margin < vw) a = "right";
    else a = "left";

    let top = rect.top + window.scrollY;
    let left = rect.left + window.scrollX;

    if (a === "bottom") {
      top = rect.bottom + window.scrollY + margin;
      left = rect.left + window.scrollX + rect.width / 2 - w / 2;
    } else if (a === "top") {
      top = rect.top + window.scrollY - h - margin;
      left = rect.left + window.scrollX + rect.width / 2 - w / 2;
    } else if (a === "right") {
      top = rect.top + window.scrollY + rect.height / 2 - h / 2;
      left = rect.right + window.scrollX + margin;
    } else {
      top = rect.top + window.scrollY + rect.height / 2 - h / 2;
      left = rect.left + window.scrollX - w - margin;
    }

    // 화면 밖 방지
    left = clamp(left, window.scrollX + 8, window.scrollX + vw - w - 8);
    top = clamp(top, window.scrollY + 8, window.scrollY + vh - h - 8);

    setArrow(a);
    setTooltipPos({ top, left });
  };

  const measureAndPlace = (el: HTMLElement | null) => {
    if (!el) return;
    // 강조 대상에 가이드 표시될 동안 가급적 스크롤-인
    el.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "smooth" });
    placeTooltip(el);
    setOverlayReady(true);
  };

  // 대상 기다리기(최대 1초 관찰), 못 찾으면 notFound 표시
  const resolveTarget = () =>
    new Promise<HTMLElement | null>((resolve) => {
      const tryNow = () => getStep().findTarget();
      const first = tryNow();
      if (first) return resolve(first);

      let resolved = false;
      const done = (el: HTMLElement | null) => {
        if (resolved) return;
        resolved = true;
        if (observerRef.current) observerRef.current.disconnect();
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        resolve(el);
      };

      observerRef.current = new MutationObserver(() => {
        const el = tryNow();
        if (el) done(el);
      });
      observerRef.current.observe(document.body, { childList: true, subtree: true, attributes: true });

      // 1초 timeout
      rafRef.current = window.setTimeout(() => done(null), 1000) as unknown as number;
    });

  // ---------- effects ----------
  useEffect(() => {
    // 배너 3초 후 자동 숨김
    bannerTimerRef.current = window.setTimeout(() => setShowBanner(false), 3000) as unknown as number;
    return () => {
      if (bannerTimerRef.current != null) clearTimeout(bannerTimerRef.current as unknown as number);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setOverlayReady(false);
    setNotFound(false);

    resolveTarget().then((el) => {
      if (!mounted) return;
      setTarget(el);
      if (el) {
        measureAndPlace(el);
      } else {
        setNotFound(true);
        setOverlayReady(true);
      }
    });

    return () => {
      mounted = false;
      if (observerRef.current) observerRef.current.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // 리사이즈/스크롤시 위치 갱신
  useEffect(() => {
    const handler = () => placeTooltip(target);
    resizeHandlerRef.current = handler;
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [target]);

  // 다음/이전/닫기
  const next = () => {
    setShowBanner(false);
    if (idx < steps.length - 1) setIdx(idx + 1);
    else onClose();
  };
  const prev = () => {
    setShowBanner(false);
    if (idx > 0) setIdx(idx - 1);
  };
  const skip = () => {
    setShowBanner(false);
    next();
  };

  // ---------- render ----------
  if (!overlayReady) return null;

  const rect = target?.getBoundingClientRect();
  const highlightStyle: React.CSSProperties | undefined = rect
    ? {
        position: "absolute",
        top: rect.top + window.scrollY - 6,
        left: rect.left + window.scrollX - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        border: "2px dashed #3b82f6",
        borderRadius: "8px",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
        pointerEvents: "none",
        zIndex: 9999,
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-[9999]" aria-live="polite">
      {/* 시멘틱 배경 (클릭 닫기) */}
      <div
        className="absolute inset-0"
        style={{ background: "transparent" }}
        onClick={onClose}
      />

      {/* 1분 배너 */}
      {showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000]">
          <div className="px-4 py-2 rounded-full bg-black/70 text-white text-xs shadow">
            ⏱️ 1분이면 끝나요!
          </div>
        </div>
      )}

      {/* 하이라이트 박스 + 펄스 포인터 */}
      {rect && (
        <>
          <div style={highlightStyle} />
        </>
      )}

      {/* 대상 못 찾았을 때 안내 */}
      {notFound && (
        <div
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4 max-w-sm"
          style={{
            top: window.scrollY + 100,
            left: window.scrollX + (DESKTOP_WIDTH - 320) / 2,
            width: 320,
            zIndex: 10001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {getStep().title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            현재 화면에서 이 단계의 대상을 찾지 못했어요. 화면을 조금 스크롤/펼침한 뒤
            <span className="font-medium"> ‘다시 시도’</span>를 눌러보세요.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={prev}
              disabled={idx === 0}
            >
              이전
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setOverlayReady(false);
                setNotFound(false);
                // 재시도
                setTimeout(() => setOverlayReady(true), 0);
              }}
            >
              다시 시도
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={skip}
            >
              건너뛰기
            </button>
            <button
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={next}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 툴팁 카드 */}
      {!notFound && (
        <div
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: 320,
            zIndex: 10001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 화살표 */}
          <div
            className={`absolute w-0 h-0 border-8 ${
              arrow === "top"
                ? "border-b-white dark:border-b-gray-800 border-x-transparent border-t-transparent -top-4 left-1/2 -translate-x-1/2"
                : arrow === "bottom"
                ? "border-t-white dark:border-t-gray-800 border-x-transparent border-b-transparent -bottom-4 left-1/2 -translate-x-1/2"
                : arrow === "left"
                ? "border-r-white dark:border-r-gray-800 border-y-transparent border-l-transparent -left-4 top-1/2 -translate-y-1/2"
                : "border-l-white dark:border-l-gray-800 border-y-transparent border-r-transparent -right-4 top-1/2 -translate-y-1/2"
            }`}
          />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getStep().title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
            {getStep().description}
          </p>

          {/* 진행 인디케이터 */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === idx ? "bg-blue-500" : i < idx ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBanner(false);
                  onClose();
                }}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                건너뛰기
              </button>
              <button
                onClick={next}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {idx === steps.length - 1 ? "완료" : "다음"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
