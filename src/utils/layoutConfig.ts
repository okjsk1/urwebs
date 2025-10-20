// 공통 레이아웃 설정 - 편집/공개 페이지가 동일한 그리드 규칙 사용
export const COLS = 8;
export const SPACING = 12;          // spacing - DraggableDashboardGrid와 동일하게 수정
export const GRID_H = 140;          // cellHeight (공개 페이지와 동일하게)
export const COL_INNER = 150;       // subCellWidth * SUB_COLUMNS + SPACING*(SUB_COLUMNS-1)
export const COL_TRACK = COL_INNER + SPACING;

// px -> grid 변환
export const toGridX = (px: number) => Math.max(0, Math.round(px / COL_TRACK));
export const toGridY = (py: number) => Math.max(0, Math.round(py / GRID_H));
export const toGridW = (px: number) => Math.max(1, Math.round((px + SPACING) / (COL_INNER + SPACING)));
export const toGridH = (px: number) => Math.max(1, Math.round((px + SPACING) / (GRID_H + SPACING)));

// grid -> px 변환
export const colToX = (col: number) => col * COL_TRACK;
export const rowToY = (row: number) => row * GRID_H;
export const gridWToPx = (w: number) => w * COL_INNER + (w - 1) * SPACING;
export const gridHToPx = (h: number) => h * GRID_H + (h - 1) * SPACING;

// 그리드 스냅핑
export const snapColIndex = (px: number) => Math.max(0, Math.min(Math.round(px / COL_TRACK), COLS - 1));
export const snapX = (px: number) => colToX(snapColIndex(px));
export const snapY = (py: number) => Math.max(0, Math.round(py / GRID_H) * GRID_H);
