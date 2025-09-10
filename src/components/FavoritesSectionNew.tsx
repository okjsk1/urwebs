import React, { useState, useRef, useMemo } from 'react';
import { FavoritesData, FavoriteFolder, Widget, SortMode } from '../types';
import { websites } from '../data/websites';
import { WeatherWidget } from './widgets/WeatherWidget';
import { MemoWidget } from './widgets/MemoWidget';
import { TodoWidget } from './widgets/TodoWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { DdayWidget } from './widgets/DdayWidget';
import { CalculatorWidget } from './widgets/CalculatorWidget';
import { BookmarkWidget } from './widgets/BookmarkWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { trackVisit, buildFrequencyMap } from '../utils/visitTrack';
import { sortByMode } from '../utils/sorters';
import { toast } from 'sonner';
import { Favicon } from './Favicon';
import { GhostBtn, IconStarPlus, IconFolderPlus } from './ui/ghost-btn';
import { saveBookmark } from '../services/bookmarks';

interface FavoritesSectionProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  onShowGuide?: () => void;
  onSaveData?: () => void;
  isLoggedIn?: boolean;
  onRequestLogin?: () => void;
}

/* =========================
   단일 즐겨찾기 아이템 (왼쪽 리스트/폴더 내부 공통)
========================= */
interface SimpleWebsiteProps {
  websiteId: string;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDraggingOver?: boolean;
}

function SimpleWebsite({
  websiteId,
  onRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDraggingOver,
}: SimpleWebsiteProps) {
  // 기본 사이트 → 커스텀 사이트(로컬스토리지) 순으로 조회
  let website = websites.find((w) => w.id === websiteId) || undefined;

  if (!website) {
    try {
      const saved = localStorage.getItem('urwebs-custom-sites');
      if (saved) {
        const customSites = JSON.parse(saved) as any[];
        website = customSites.find((w) => w.id === websiteId);
      }
    } catch (e) {
      console.error('Failed to parse custom sites:', e);
    }
  }

  const dragRef = useRef<HTMLDivElement>(null);
  if (!website) return null;

  return (
    <div
      data-bookmark-item /* ✅ 보험: 즐겨찾기 항목 표시용 데이터 속성 */
      className={`urwebs-favorite-item flex items-center p-1 rounded shadow-sm border transition-all h-6 group ${
        isDraggingOver ? 'urwebs-drop-zone' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      ref={dragRef}
    >
      <div className="left flex items-center gap-1 flex-1 min-w-0 h-full">
        <Favicon domain={website.url} size={12} className="w-3 h-3 flex-shrink-0" />
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 truncate text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors dark:text-gray-200 dark:hover:text-blue-400"
          title={website.title}
          onClick={() => trackVisit(website.id)}
        >
          {website.title}
        </a>
      </div>

      <button
        onClick={() => onRemove(websiteId)}
        className="favorite ml-auto opacity-0 group-hover:opacity-100 bg-red-500 text-white w-3 h-3 rounded-full text-[10px] leading-[10px] flex items-center justify-center transition-opacity"
        aria-label="즐겨찾기에서 제거"
        type="button"
      >
        ×
      </button>
    </div>
  );
}

/* =========================
   폴더 카드
========================= */
interface SimpleFolderProps {
  folder: FavoriteFolder;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDropWebsite: (websiteId: string, toFolderId: string) => void;
  onDragOverFolder: (e: React.DragEvent) => void;
  onDragLeaveFolder: (e: React.DragEvent) => void;
  isDraggingOver?: boolean;
  onChangeSortMode: (folderId: string, mode: SortMode) => void; // [sorting]
  children: React.ReactNode;
}

function SimpleFolder({
  folder,
  onRenameFolder,
  onDeleteFolder,
  onDropWebsite,
  onDragOverFolder,
  onDragLeaveFolder,
  isDraggingOver,
  onChangeSortMode, // [sorting]
  children,
}: SimpleFolderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleRename = () => {
    const value = editName.trim();
    if (value && value !== folder.name) {
      onRenameFolder(folder.id, value);
    }
    setIsEditing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const websiteId =
        e.dataTransfer.getData('websiteId') ||
        e.dataTransfer.getData('text/plain');
      if (websiteId) onDropWebsite(websiteId, folder.id);
    } catch (err) {
      console.error('드롭 처리 실패:', err);
    }
  };

  const handleFolderDragStart = (e: React.DragEvent) => {
    try {
      e.dataTransfer.setData('folderId', folder.id);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.warn('Folder drag start failed:', err);
    }
  };

  return (
    <div
      className={`folder-card border-2 border-dashed p-3 rounded-lg flex flex-col transition-all cursor-move ${
        isDraggingOver
          ? 'urwebs-drop-zone'
          : 'bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
      }`}
      draggable
      onDragStart={handleFolderDragStart}
      onDragOver={onDragOverFolder}
      onDragLeave={onDragLeaveFolder}
      onDrop={handleDrop}
    >
      <div className="controls flex items-center gap-2 mb-2">
        <span className="text-sm">📁</span>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 border rounded px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onBlur={handleRename}
              autoFocus
            />
          </div>
        ) : (
          <h3
            className="title text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex-1 dark:text-gray-200 dark:hover:text-blue-400"
            onClick={() => {
              setIsEditing(true);
              setEditName(folder.name);
            }}
            title="클릭하여 이름 변경"
          >
            {folder.name}
          </h3>
        )}

        {/* [sorting] */}
        <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
          정렬:
          <select
            value={folder.sortMode || 'manual'}
            onChange={(e) =>
              onChangeSortMode(folder.id, e.target.value as SortMode)
            }
            className="border rounded px-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            aria-label="정렬 모드 선택"
          >
            <option value="manual">수동</option>
            <option value="alpha">이름순</option>
            <option value="freq">접속순</option>
          </select>
        </label>

        <button
          onClick={() => onDeleteFolder(folder.id)}
          className="text-red-500 hover:text-red-700 text-xs"
          type="button"
          aria-label="폴더 삭제"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1">{children}</div>
    </div>
  );
}

/* =========================
   위젯 선택 드롭다운
========================= */
interface WidgetSelectorProps {
  onAddWidget: (type: string) => void;
}

function WidgetSelector({ onAddWidget }: WidgetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const widgetTypes = [
    { type: 'weather', icon: '🌤️', name: '네이버 날씨' },
    { type: 'weather-weekly', icon: '📅', name: '요일별 날씨' },
    { type: 'weather-hourly', icon: '🕐', name: '시간대별 날씨' },
    { type: 'memo', icon: '📝', name: '메모' },
    { type: 'todo', icon: '✅', name: '할 일' },
    { type: 'calendar', icon: '📅', name: '달력' },
    { type: 'dday', icon: '⏰', name: 'D-Day' },
    { type: 'calculator', icon: '🔢', name: '계산기' },
    { type: 'bookmark', icon: '📖', name: '북마크' },
    { type: 'news', icon: '📰', name: '뉴스' },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        type="button"
      >
        + 위젯 추가
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10 min-w-40 dark:bg-gray-800 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {widgetTypes.map((w) => (
            <button
              key={w.type}
              onClick={() => {
                onAddWidget(w.type);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700"
              type="button"
            >
              <span>{w.icon}</span>
              <span>{w.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   위젯 렌더러 (래퍼 포함)
========================= */
function SimpleWidget({
  widget,
  onRemove,
}: {
  widget: Widget;
  onRemove: (id: string) => void;
}) {
  const getWidgetHeight = () => {
    if (widget.type === 'weather-hourly') return 'h-80';
    if (widget.type === 'calendar') return 'h-64';
    return 'h-48';
  };

  return (
    <div className={`transition-opacity ${getWidgetHeight()}`}>
      <WidgetRenderer widget={widget} onRemove={onRemove} />
    </div>
  );
}

function WidgetRenderer({
  widget,
  onRemove,
}: {
  widget: Widget;
  onRemove: (id: string) => void;
}) {
  switch (widget.type) {
    case 'weather':
      return <WeatherWidget id={widget.id} onRemove={onRemove} />;
    case 'weather-weekly':
      return <WeatherWidget id={widget.id} onRemove={onRemove} type="weekly" />;
    case 'weather-hourly':
      return <WeatherWidget id={widget.id} onRemove={onRemove} type="hourly" />;
    case 'memo':
      return <MemoWidget id={widget.id} onRemove={onRemove} />;
    case 'todo':
      return <TodoWidget id={widget.id} onRemove={onRemove} />;
    case 'calendar':
      return <CalendarWidget id={widget.id} onRemove={onRemove} />;
    case 'dday':
      return <DdayWidget id={widget.id} onRemove={onRemove} />;
    case 'calculator':
      return <CalculatorWidget id={widget.id} onRemove={onRemove} />;
    case 'bookmark':
      return <BookmarkWidget id={widget.id} onRemove={onRemove} />;
    case 'news':
      return <NewsWidget id={widget.id} onRemove={onRemove} />;
    default:
      return null;
  }
}

/* =========================
   FavoritesSectionNew
========================= */
export function FavoritesSectionNew({
  favoritesData,
  onUpdateFavorites,
  onShowGuide,
  onSaveData,
  isLoggedIn,
  onRequestLogin,
}: FavoritesSectionProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFromFolderId, setDraggedFromFolderId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function onAddFavorite() {
    const title = document.title;
    const url = window.location.href;
    saveBookmark({ title, url, favicon: null, folderId: null })
      .then((r) => {
        if (r.mode === 'guest')
          toast('로그인 없이 임시로 담았어요. 로그인하면 저장됩니다.');
        else toast('즐겨찾기에 추가했어요!');
      })
      .catch(() => toast('저장 실패: 잠시 후 다시 시도해주세요.'));
  }

  function onAddFolder() {
    setShowNewFolderInput(true);
  }

  const handleDragStart = (e: React.DragEvent, id: string, fromFolderId?: string) => {
    setDraggedId(id);
    setDraggedFromFolderId(fromFolderId || null);
    try {
      e.dataTransfer.setData('websiteId', id);

      // 드래그 미리보기 숨김(투명 픽셀)
      if (e.target instanceof HTMLElement) {
        const img = new Image();
        img.src =
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        e.dataTransfer.setDragImage(img, 0, 0);
      }
    } catch (err) {
      console.warn('Drag start failed:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== overId) setDragOverId(overId);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverId(null);

    let categoryWebsiteId = '';
    let favoriteWebsiteId = '';
    try {
      categoryWebsiteId = e.dataTransfer.getData('text/plain');
      favoriteWebsiteId = e.dataTransfer.getData('websiteId');
    } catch (err) {
      console.warn('Drop failed:', err);
      return;
    }

    const droppedId = favoriteWebsiteId || categoryWebsiteId;
    if (!droppedId) return;

    // 카테고리 → 즐겨찾기/폴더
    if (categoryWebsiteId) {
      // 이미 있으면 skip
      if (
        favoritesData.items?.includes(categoryWebsiteId) ||
        favoritesData.folders?.some((f) => f.items.includes(categoryWebsiteId))
      ) {
        setDraggedId(null);
        setDraggedFromFolderId(null);
        return;
      }

      const newData = { ...favoritesData };
      if (targetId) {
        const folderIdx = newData.folders.findIndex((f) => f.id === targetId);
        if (folderIdx !== -1) {
          const items = newData.folders[folderIdx].items || [];
          newData.folders[folderIdx].items = [...items, categoryWebsiteId];
        } else {
          newData.items = [...(newData.items || []), categoryWebsiteId];
        }
      } else {
        newData.items = [...(newData.items || []), categoryWebsiteId];
      }

      onUpdateFavorites(newData);
      toast.success('즐겨찾기에 추가되었습니다.');
      setDraggedId(null);
      setDraggedFromFolderId(null);
      return;
    }

    // 즐겨찾기 내부 이동
    if (favoriteWebsiteId) {
      const sourceList: string[] = draggedFromFolderId
        ? favoritesData.folders.find((f) => f.id === draggedFromFolderId)?.items || []
        : favoritesData.items || [];

      const destList: string[] = targetId
        ? favoritesData.folders.find((f) => f.id === targetId)?.items || []
        : favoritesData.items || [];

      const newSource = Array.from(sourceList);
      const idx = newSource.indexOf(favoriteWebsiteId);
      if (idx === -1) return;
      const [moved] = newSource.splice(idx, 1);

      const newDest = Array.from(destList);
      newDest.push(moved);

      const newData = { ...favoritesData };

      if (draggedFromFolderId) {
        const srcFolder = newData.folders.find((f) => f.id === draggedFromFolderId);
        if (srcFolder) srcFolder.items = newSource;
      } else {
        newData.items = newSource;
      }

      if (targetId) {
        const destFolder = newData.folders.find((f) => f.id === targetId);
        if (destFolder) destFolder.items = newDest;
        else newData.items = newDest;
      } else {
        newData.items = newDest;
      }

      // 중복 제거
      newData.items = [...new Set(newData.items)];
      newData.folders.forEach((f) => (f.items = [...new Set(f.items)]));

      onUpdateFavorites(newData);
      setDraggedId(null);
      setDraggedFromFolderId(null);
    }
  };

  const moveWebsiteToFolder = (websiteId: string, toFolderId: string) => {
    const newData = { ...favoritesData };
    newData.items = (newData.items || []).filter((id) => id !== websiteId);
    newData.folders = (newData.folders || []).map((folder) => ({
      ...folder,
      items: folder.items.filter((id) => id !== websiteId),
    }));
    const folderIndex = newData.folders.findIndex((f) => f.id === toFolderId);
    if (folderIndex >= 0) newData.folders[folderIndex].items.push(websiteId);
    onUpdateFavorites(newData);
  };

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;

    const newFolder: FavoriteFolder = {
      id: Date.now().toString(),
      name,
      items: [],
    };

    onUpdateFavorites({
      ...favoritesData,
      folders: [...(favoritesData.folders || []), newFolder],
    });

    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as any,
      title: type,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
    };

    onUpdateFavorites({
      ...favoritesData,
      widgets: [...(favoritesData.widgets || []), newWidget],
    });
  };

  const removeWidget = (widgetId: string) => {
    onUpdateFavorites({
      ...favoritesData,
      widgets: (favoritesData.widgets || []).filter((w) => w.id !== widgetId),
    });
  };

  const removeFromFavorites = (websiteId: string) => {
    try {
      const newData = { ...favoritesData };
      newData.items = (newData.items || []).filter((id) => id && id !== websiteId);
      newData.folders = (newData.folders || [])
        .filter((folder) => folder && folder.id)
        .map((folder) => ({
          ...folder,
          items: (folder?.items || []).filter((id) => id && id !== websiteId),
        }));

      onUpdateFavorites(newData);
      toast.success('즐겨찾기에서 제거되었습니다.');
    } catch (e) {
      toast.error('즐겨찾기 제거에 실패했습니다.');
    }
  };

  const renameFolder = (folderId: string, newName: string) => {
    const newData = { ...favoritesData };
    newData.folders = (newData.folders || []).filter((f) => f && f.id);
    const idx = newData.folders.findIndex((f) => f.id === folderId);
    if (idx >= 0) {
      newData.folders[idx].name = newName;
      onUpdateFavorites(newData);
    }
  };

  const deleteFolder = (folderId: string) => {
    const newData = { ...favoritesData };
    newData.folders = (newData.folders || []).filter((f) => f && f.id);
    newData.items = (newData.items || []).filter((id) => id);

    const idx = newData.folders.findIndex((f) => f.id === folderId);
    if (idx >= 0) {
      const movedBack = (newData.folders[idx]?.items || []).filter((id) => id);
      newData.items.push(...movedBack);
      newData.folders = newData.folders.filter((f) => f.id !== folderId);
      onUpdateFavorites(newData);
    }
  };

  const changeItemsSortMode = (mode: SortMode) => {
    onUpdateFavorites({ ...favoritesData, itemsSortMode: mode });
  };

  const changeFolderSortMode = (folderId: string, mode: SortMode) => {
    const newFolders = (favoritesData.folders || []).map((f) =>
      f.id === folderId ? { ...f, sortMode: mode } : f
    );
    onUpdateFavorites({ ...favoritesData, folders: newFolders });
  };

  const titleMap = useMemo(() => {
    const map: Record<string, string> = {};
    websites.forEach((w) => {
      map[w.id] = w.title;
    });
    try {
      const saved = localStorage.getItem('urwebs-custom-sites');
      if (saved) {
        const customSites = JSON.parse(saved) as any[];
        customSites.forEach((w) => {
          if (w && w.id) map[w.id] = w.title;
        });
      }
    } catch (e) {
      console.warn('Failed to parse custom sites:', e);
    }
    return map;
  }, []);

  const freqMap = buildFrequencyMap(); // [sorting]

  const rootItems = sortByMode(
    Array.isArray(favoritesData.items)
      ? favoritesData.items.filter(Boolean)
      : [],
    favoritesData.itemsSortMode || 'manual',
    freqMap,
    titleMap,
  ); // [sorting]

  const handleGuideShow = () => {
    if (onShowGuide) onShowGuide();
    else alert('가이드 기능이 준비 중입니다.');
  };

  return (
    <section
      id="favorites-section"
      className="mx-auto max-w-[1200px] px-4 lg:px-6 py-8 transition-colors duration-300"
    >
      {/* 헤더 버튼 그룹 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2
            className="flex items-center gap-3 text-lg font-medium"
            style={{ color: 'var(--main-point)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            즐겨찾기
          </h2>

          <button
            onClick={() => {
              const event = new CustomEvent('openAddSiteModal');
              window.dispatchEvent(event);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
            type="button"
            aria-label="사이트 추가"
          >
            + 사이트 추가
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isLoggedIn) onSaveData && onSaveData();
              else onRequestLogin && onRequestLogin();
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            type="button"
          >
            💾 {isLoggedIn ? '저장하기' : '로그인하여 저장'}
          </button>

          <WidgetSelector onAddWidget={addWidget} />

          <button
            onClick={() => setShowNewFolderInput(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            type="button"
          >
            + 폴더 추가
          </button>

          <button
            onClick={handleGuideShow}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            type="button"
          >
            📖 가이드 보기
          </button>
        </div>
      </div>

      {/* 새 폴더 입력 */}
      {showNewFolderInput && (
        <div className="mb-4 p-3 bg-white rounded-lg border dark:bg-gray-800 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="폴더 이름"
              className="flex-1 px-3 py-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              onBlur={createFolder}
              autoFocus
            />
            <button
              onClick={createFolder}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              type="button"
            >
              생성
            </button>
            <button
              onClick={() => setShowNewFolderInput(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              type="button"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 즐겨찾기 & 폴더 (위젯 포함) */}
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        {(favoritesData?.widgets?.length || 0) > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 text-sm mb-3 dark:text-gray-200">
              🔧 위젯
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-x-4 gap-y-6">
              {(favoritesData.widgets || [])
                .filter((w) => w && w.id)
                .map((w) => (
                  <SimpleWidget key={w.id} widget={w} onRemove={removeWidget} />
                ))}
            </div>
          </div>
        )}

        <div className="toolbar btn-group mb-4">
          <GhostBtn icon={<IconStarPlus />} hint="Ctrl+D" onClick={onAddFavorite}>
            이 페이지를 즐겨찾기에 추가
          </GhostBtn>
          <GhostBtn icon={<IconFolderPlus />} onClick={onAddFolder}>
            폴더 추가
          </GhostBtn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-x-4 gap-y-6">
          {/* 즐겨찾기 리스트 */}
          <div className="col-span-1 space-y-2 lg:space-y-3 md:col-span-1 xl:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700 text-sm dark:text-gray-200">
                📌 즐겨찾기
            </h3>
            {/* [sorting] */}
            <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
              정렬:
              <select
                value={favoritesData.itemsSortMode || 'manual'}
                onChange={(e) => changeItemsSortMode(e.target.value as SortMode)}
                className="border rounded px-1 py-0.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                aria-label="정렬 모드 선택"
              >
                <option value="manual">수동</option>
                <option value="alpha">이름순</option>
                <option value="freq">접속순</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {rootItems.map((id) => (
              <SimpleWebsite
                key={id}
                websiteId={id}
                onRemove={removeFromFavorites}
                onDragStart={(e) => handleDragStart(e, id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, id)}
                isDraggingOver={dragOverId === id}
              />
            ))}
          </div>
        </div>

          {/* 폴더들 */}
          <div className="space-y-2 lg:space-y-3 md:col-span-2 xl:col-span-5">
            <h3 className="font-medium text-gray-700 text-sm dark:text-gray-200">
              📂 폴더
            </h3>
            <div className="cards-6cols">
              {Array.isArray(favoritesData.folders) &&
                favoritesData.folders
                  .filter(Boolean)
                  .map((folder) => {
                    const folderItems = Array.isArray(folder?.items)
                      ? folder.items.filter(Boolean)
                      : [];
                    const sortedItems = sortByMode(
                      folderItems,
                      folder.sortMode || 'manual',
                      freqMap,
                      titleMap,
                    ); // [sorting]
                    return (
                      <SimpleFolder
                        key={folder.id}
                        folder={folder}
                        onRenameFolder={renameFolder}
                        onDeleteFolder={deleteFolder}
                        onDropWebsite={moveWebsiteToFolder}
                        onDragOverFolder={(e) => handleDragOver(e, folder.id)}
                        onDragLeaveFolder={handleDragLeave}
                        isDraggingOver={dragOverId === folder.id}
                        onChangeSortMode={changeFolderSortMode} // [sorting]
                      >
                        {sortedItems.map((id) => (
                          <SimpleWebsite
                            key={id}
                            websiteId={id}
                            onRemove={removeFromFavorites}
                            onDragStart={(e) => handleDragStart(e, id, folder.id)}
                            onDragOver={(e) => handleDragOver(e, id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, id)}
                            isDraggingOver={dragOverId === id}
                          />
                        ))}

                        {sortedItems.length === 0 && (
                          <p className="text-xs text-gray-500 italic dark:text-gray-400">
                            폴더가 비어있습니다
                          </p>
                        )}
                      </SimpleFolder>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
