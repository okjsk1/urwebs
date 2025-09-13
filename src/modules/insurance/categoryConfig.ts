// 기존 categoryConfig를 건드리지 않고 런타임에 항목만 주입
// (모듈이 객체를 export하면 참조를 통해 확장 가능)
try {
  // 프로젝트에 맞는 경로로 조정 필요할 수 있음
  // 가장 흔한 위치: "@/data/websites" 또는 "../data/websites"
  // 우선 순서대로 시도
  let cfg: any;
  try { cfg = require("@/data/websites"); } catch {}
  if (!cfg) { try { cfg = require("../../data/websites"); } catch {} }
  if (!cfg) { try { cfg = require("../../../data/websites"); } catch {} }

  const categoryConfig = cfg?.categoryConfig;
  if (categoryConfig && !categoryConfig["보험"]) {
    categoryConfig["보험"] = { icon: "🛡️", color: "#0EA5E9" };
  }
} catch {
  // 조용히 패스: 아이콘이 없어도 카드 자체는 렌더되도록
}
export {};
