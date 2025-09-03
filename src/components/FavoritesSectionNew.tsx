import React, { useState, useRef } from 'react'; // React, useState, useRef 훅을 가져옵니다.
import { FavoritesData, FavoriteFolder, Widget } from '../types'; // 데이터 타입 정의를 가져옵니다.
import { websites } from '../data/websites'; // 웹사이트 데이터 목록을 가져옵니다.
import { WeatherWidget } from './widgets/WeatherWidget'; // 날씨 위젯 컴포넌트를 가져옵니다.
import { MemoWidget } from './widgets/MemoWidget'; // 메모 위젯 컴포넌트를 가져옵니다.
import { TodoWidget } from './widgets/TodoWidget'; // 할일 위젯 컴포넌트를 가져옵니다.
import { CalendarWidget } from './widgets/CalendarWidget'; // 달력 위젯 컴포넌트를 가져옵니다.
import { DdayWidget } from './widgets/DdayWidget'; // D-Day 위젯 컴포넌트를 가져옵니다.
import { CalculatorWidget } from './widgets/CalculatorWidget'; // 계산기 위젯 컴포넌트를 가져옵니다.
import { BookmarkWidget } from './widgets/BookmarkWidget'; // 북마크 위젯 컴포넌트를 가져옵니다.
import { NewsWidget } from './widgets/NewsWidget'; // 뉴스 위젯 컴포넌트를 가져옵니다.

interface FavoritesSectionProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  showSampleImage: boolean;
  onShowGuide?: () => void; // 가이드 다시보기 함수 추가
}

interface SimpleWebsiteProps { // SimpleWebsite 컴포넌트의 props 타입을 정의합니다.
  websiteId: string; // 웹사이트 ID입니다.
  onRemove: (id: string) => void; // 웹사이트를 제거하는 함수입니다.
  onDragStart: (e: React.DragEvent) => void; // 드래그 시작 이벤트 핸들러입니다.
  onDragOver: (e: React.DragEvent) => void; // 드래그 오버 이벤트 핸들러입니다.
  onDragLeave: (e: React.DragEvent) => void; // 드래그 리브 이벤트 핸들러입니다.
  onDrop: (e: React.DragEvent) => void; // 드롭 이벤트 핸들러입니다.
  isDraggingOver?: boolean; // 현재 드래그 오버 상태인지 여부입니다.
}

function SimpleWebsite({ websiteId, onRemove, onDragStart, onDragOver, onDragLeave, onDrop, isDraggingOver }: SimpleWebsiteProps) {
  // websites와 localStorage에서 커스텀 사이트도 확인
  let website = websites.find(w => w.id === websiteId);
  
  if (!website) {
    try {
      const savedCustomSites = localStorage.getItem('sfu-custom-sites');
      if (savedCustomSites) {
        const customSites = JSON.parse(savedCustomSites);
        website = customSites.find((w: any) => w.id === websiteId);
      }
    } catch (e) {
      console.error('Failed to parse custom sites:', e);
    }
  }
  
  const dragRef = useRef<HTMLDivElement>(null);

  if (!website) return null;

  return (
    <div
      className={`sfu-favorite-item relative p-1 rounded shadow-sm border transition-all h-6 group ${isDraggingOver ? 'sfu-drop-zone' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      ref={dragRef}
    >
      <div className="flex items-center gap-1 h-full">
        <img
          src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=16`} // 웹사이트 파비콘을 가져옵니다.
          alt=""
          className="w-3 h-3 flex-shrink-0"
          onError={(e) => { // 파비콘 로드 실패 시 기본 이미지를 표시합니다.
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23e5e7eb"/></svg>';
          }}
        />
        <a
          href={website.url} // 웹사이트 URL로 연결합니다.
          target="_blank" // 새 탭에서 엽니다.
          rel="noopener noreferrer" // 보안 강화를 위해 rel 속성을 추가합니다.
          className="flex-1 text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors truncate dark:text-gray-200 dark:hover:text-blue-400"
        >
          {website.title} {/* 웹사이트 제목을 표시합니다. */}
        </a>
      </div>
      <button
        onClick={() => onRemove(websiteId)} // 클릭 시 즐겨찾기에서 웹사이트를 제거합니다.
        className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-500 text-white w-3 h-3 rounded-full text-xs flex items-center justify-center transition-opacity"
      >
        × {/* 제거 버튼 아이콘입니다. */}
      </button>
    </div>
  );
}

interface SimpleFolderProps { // SimpleFolder 컴포넌트의 props 타입을 정의합니다.
  folder: FavoriteFolder; // 폴더 데이터입니다.
  onRenameFolder: (folderId: string, newName: string) => void; // 폴더 이름을 변경하는 함수입니다.
  onDeleteFolder: (folderId: string) => void; // 폴더를 삭제하는 함수입니다.
  onDropWebsite: (websiteId: string, toFolderId: string) => void; // 웹사이트를 폴더에 드롭하는 함수입니다.
  onDragOverFolder: (e: React.DragEvent) => void; // 폴더 위로 드래그 오버될 때 호출됩니다.
  onDragLeaveFolder: (e: React.DragEvent) => void; // 폴더에서 드래그가 벗어날 때 호출됩니다.
  isDraggingOver?: boolean; // 현재 드래그 오버 상태인지 여부입니다.
  children: React.ReactNode; // 폴더 내에 포함될 자식 요소(SimpleWebsite)입니다.
}

function SimpleFolder({ folder, onRenameFolder, onDeleteFolder, onDropWebsite, onDragOverFolder, onDragLeaveFolder, isDraggingOver, children }: SimpleFolderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== folder.name) {
      onRenameFolder(folder.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const websiteId = e.dataTransfer.getData("websiteId") || e.dataTransfer.getData("text/plain");
      if (websiteId) {
        onDropWebsite(websiteId, folder.id);
      }
    } catch (err) {
      console.error("드롭 처리 실패:", err);
    }
  };

  const handleFolderDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("folderId", folder.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`border-2 border-dashed p-3 rounded-lg flex flex-col transition-all cursor-move ${isDraggingOver ? 'sfu-drop-zone' : 'bg-gray-50 dark:bg-gray-800 dark:border-gray-600'}`}
      draggable
      onDragStart={handleFolderDragStart}
      onDragOver={onDragOverFolder}
      onDragLeave={onDragLeaveFolder}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">📁</span>
        {isEditing ? ( // 수정 모드일 때
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName} // 입력 필드에 현재 수정 이름을 표시합니다.
              onChange={(e) => setEditName(e.target.value)} // 입력 값 변경 시 상태를 업데이트합니다.
              className="flex-1 text-xs font-medium border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleRename()} // 엔터 키를 누르면 이름 변경을 완료합니다.
              onBlur={handleRename} // 포커스를 잃으면 이름 변경을 완료합니다.
              autoFocus // 자동으로 포커스를 줍니다.
            />
          </div>
        ) : ( // 일반 모드일 때
          <h3
            className="text-xs font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex-1 dark:text-gray-200 dark:hover:text-blue-400"
            onClick={() => { // 클릭 시 수정 모드로 전환합니다.
              setIsEditing(true);
              setEditName(folder.name);
            }}
          >
            {folder.name} {/* 폴더 이름을 표시합니다. */}
          </h3>
        )}
        <button
          onClick={() => onDeleteFolder(folder.id)} // 클릭 시 폴더를 삭제합니다.
          className="text-red-500 hover:text-red-700 text-xs"
        >
          ✕ {/* 삭제 버튼 아이콘입니다. */}
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        {children} {/* 폴더 내의 웹사이트 항목들을 렌더링합니다. */}
      </div>
    </div>
  );
}

interface WidgetSelectorProps { // 위젯 선택 컴포넌트의 props입니다.
  onAddWidget: (type: string) => void; // 위젯 추가 함수입니다.
}

function WidgetSelector({ onAddWidget }: WidgetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false); // 드롭다운 메뉴가 열려있는지 여부입니다.

  React.useEffect(() => { // 외부 클릭을 감지하여 드롭다운을 닫습니다.
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const widgetTypes = [ // 위젯 타입 목록입니다.
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
          e.stopPropagation(); // 이벤트 버블링을 막아 드롭다운이 바로 닫히지 않게 합니다.
          setIsOpen(!isOpen); // 클릭 시 드롭다운을 열고 닫습니다.
        }}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        + 위젯 추가
      </button>

      {isOpen && ( // isOpen 상태일 때만 드롭다운 메뉴를 렌더링합니다.
        <div
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10 min-w-40 dark:bg-gray-800 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 드롭다운이 닫히지 않게 합니다.
        >
          {widgetTypes.map(widget => (
            <button
              key={widget.type}
              onClick={() => {
                onAddWidget(widget.type); // 위젯 추가 함수를 호출합니다.
                setIsOpen(false); // 위젯 추가 후 드롭다운을 닫습니다.
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span>{widget.icon}</span> {/* 위젯 아이콘을 표시합니다. */}
              <span>{widget.name}</span> {/* 위젯 이름을 표시합니다. */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleWidget({ widget, onRemove }: { // SimpleWidget 컴포넌트의 props입니다.
  widget: Widget; // 위젯 데이터입니다.
  onRemove: (id: string) => void; // 위젯 제거 함수입니다.
}) {
  const getWidgetHeight = () => { // 위젯 타입에 따라 높이를 반환하는 함수입니다.
    if (widget.type === 'weather-hourly') {
      return 'h-80';
    }
    if (widget.type === 'calendar') {
      return 'h-64';
    }
    return 'h-48';
  };

  return (
    <div className={`transition-opacity ${getWidgetHeight()}`}>
      <WidgetRenderer widget={widget} onRemove={onRemove} /> {/* 위젯 렌더링을 담당하는 컴포넌트를 호출합니다. */}
    </div>
  );
}

function WidgetRenderer({ widget, onRemove }: { widget: Widget; onRemove: (id: string) => void }) { // 위젯을 렌더링하는 컴포넌트입니다.
  switch (widget.type) { // 위젯 타입에 따라 다른 컴포넌트를 반환합니다.
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

export function FavoritesSectionNew({ favoritesData, onUpdateFavorites, showSampleImage, onShowGuide }: FavoritesSectionProps) {
  const [newFolderName, setNewFolderName] = useState(''); // 새 폴더 이름을 저장하는 상태입니다.
  const [showNewFolderInput, setShowNewFolderInput] = useState(false); // 새 폴더 입력창 표시 여부입니다.
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFromFolderId, setDraggedFromFolderId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);

  React.useEffect(() => { // 초기 즐겨찾기 상태를 확인하고 기본 폴더를 생성합니다.
    if ((favoritesData?.items?.length || 0) === 1 && (favoritesData?.folders?.length || 0) === 0) {
      const defaultFolder: FavoriteFolder = {
        id: 'default-folder-' + Date.now(),
        name: '자주 방문하는 사이트',
        items: favoritesData.items || []
      };

      onUpdateFavorites({
        ...favoritesData,
        items: [],
        folders: [defaultFolder]
      });
    }
  }, [favoritesData?.items?.length, favoritesData?.folders?.length, onUpdateFavorites]);

  const handleDragStart = (e: React.DragEvent, id: string, fromFolderId?: string) => { // 드래그 시작을 처리합니다.
    setDraggedId(id);
    setDraggedFromFolderId(fromFolderId || null);
    e.dataTransfer.setData("websiteId", id); // 드래그 데이터에 웹사이트 ID를 설정합니다.
    if (e.target instanceof HTMLElement) {
      const img = new Image();
      img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
      e.dataTransfer.setDragImage(img, 0, 0); // 투명한 드래그 이미지를 설정하여 기본 이미지를 숨깁니다.
    }
  };
  
  const handleDragOver = (e: React.DragEvent, overId: string) => { // 드래그 오버를 처리합니다.
    e.preventDefault();
    if (draggedId && draggedId !== overId) {
      setDragOverId(overId); // 드래그 오버 상태를 업데이트합니다.
    }
  };
  
  const handleDragLeave = () => { // 드래그가 영역을 벗어날 때 처리합니다.
    setDragOverId(null);
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverId(null);

    const categoryWebsiteId = e.dataTransfer.getData("text/plain");
    const favoriteWebsiteId = e.dataTransfer.getData("websiteId");
    const droppedFolderId = e.dataTransfer.getData("folderId");

    // 폴더 순서 변경 처리
    if (droppedFolderId && targetId && targetId !== droppedFolderId) {
      const newData = { ...favoritesData };
      const folders = [...(newData.folders || [])];
      const draggedIndex = folders.findIndex(f => f.id === droppedFolderId);
      const targetIndex = folders.findIndex(f => f.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedFolder] = folders.splice(draggedIndex, 1);
        folders.splice(targetIndex, 0, draggedFolder);
        newData.folders = folders;
        onUpdateFavorites(newData);
      }
      setDraggedFolderId(null);
      return;
    }

    const droppedId = favoriteWebsiteId || categoryWebsiteId;
    if (!droppedId) return;

    if (categoryWebsiteId) {
      // 카테고리에서 즐겨찾기로 직접 추가하는 로직
      if (favoritesData.items?.includes(categoryWebsiteId) || favoritesData.folders?.some(f => f.items.includes(categoryWebsiteId))) {
        setDraggedId(null);
        setDraggedFromFolderId(null);
        return;
      }
      
      const newData = { ...favoritesData };
      const targetFolderId = favoritesData.folders?.find(f => f.items.includes(targetId as string))?.id || (targetId && favoritesData.folders?.find(f => f.id === targetId)?.id) || null;
      
      if (targetFolderId) {
        const folderIndex = newData.folders.findIndex(f => f.id === targetFolderId);
        if (folderIndex !== -1) {
          newData.folders[folderIndex].items = [...(newData.folders[folderIndex].items || []), categoryWebsiteId];
        }
      } else {
        newData.items = [...(newData.items || []), categoryWebsiteId];
      }
      
      onUpdateFavorites(newData);
      setDraggedId(null);
      setDraggedFromFolderId(null);
      return;
    }

    if (favoriteWebsiteId) { // 즐겨찾기 내에서 드롭된 경우
      const sourceList: string[] = draggedFromFolderId ? favoritesData.folders.find(f => f.id === draggedFromFolderId)?.items || [] : favoritesData.items || [];
      const destList: string[] = targetId ? favoritesData.folders.find(f => f.id === targetId)?.items || [] : favoritesData.items || [];
      
      const newItems = Array.from(sourceList);
      const [movedItem] = newItems.splice(newItems.indexOf(favoriteWebsiteId), 1);
      
      const destinationIndex = destList.indexOf(targetId as string);
      
      let newDestList = Array.from(destList);
      if (targetId && destinationIndex !== -1) {
        newDestList.splice(destinationIndex, 0, movedItem);
      } else {
        newDestList.push(movedItem);
      }
      
      const newData = { ...favoritesData };
        
      if (draggedFromFolderId) {
        const sourceFolder = newData.folders.find(f => f.id === draggedFromFolderId);
        if (sourceFolder) sourceFolder.items = newItems;
      } else {
        newData.items = newItems;
      }
        
      if (targetId) {
        const destFolder = newData.folders.find(f => f.id === targetId);
        if (destFolder) {
          destFolder.items = newDestList;
          if (draggedFromFolderId && draggedFromFolderId !== targetId) {
            const originalFolder = newData.folders.find(f => f.id === draggedFromFolderId);
            if (originalFolder) {
              originalFolder.items = originalFolder.items.filter(id => id !== movedItem);
            } else {
              newData.items = newData.items.filter(id => id !== movedItem);
            }
          }
        } else {
          newData.items = newDestList;
        }
      } else {
        newData.items = newDestList;
      }
        
      newData.items = [...new Set(newData.items)];
      newData.folders.forEach(folder => {
        folder.items = [...new Set(folder.items)];
      });
        
      onUpdateFavorites(newData);
      setDraggedId(null);
      setDraggedFromFolderId(null);
    }
  };
  
  const moveWebsiteToFolder = (websiteId: string, toFolderId: string) => { // 웹사이트를 폴더로 이동시키는 함수입니다.
    const newData = { ...favoritesData };
    newData.items = (newData.items || []).filter(id => id !== websiteId);
    newData.folders = (newData.folders || []).map(folder => ({
      ...folder,
      items: folder.items.filter(id => id !== websiteId)
    }));
    const folderIndex = newData.folders.findIndex(f => f.id === toFolderId);
    if (folderIndex >= 0) {
      newData.folders[folderIndex].items.push(websiteId);
    }
    onUpdateFavorites(newData);
  };

  const createFolder = () => { // 새 폴더를 생성하는 함수입니다.
    if (newFolderName.trim()) {
      const newFolder: FavoriteFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        items: []
      };
      onUpdateFavorites({
        ...favoritesData,
        folders: [...(favoritesData.folders || []), newFolder]
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const addWidget = (type: string) => { // 위젯을 추가하는 함수입니다.
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as any,
      title: type,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 }
    };
    onUpdateFavorites({
      ...favoritesData,
      widgets: [...(favoritesData.widgets || []), newWidget]
    });
  };

  const removeWidget = (widgetId: string) => { // 위젯을 제거하는 함수입니다.
    onUpdateFavorites({
      ...favoritesData,
      widgets: (favoritesData.widgets || []).filter(w => w.id !== widgetId)
    });
  };

  const removeFromFavorites = (websiteId: string) => { // 즐겨찾기에서 항목을 제거하는 함수입니다.
    const newData = { ...favoritesData };
    newData.items = (newData.items || []).filter(id => id && id !== websiteId);
    newData.folders = (newData.folders || []).filter(folder => folder && folder.id).map(folder => ({
      ...folder,
      items: (folder?.items || []).filter(id => id && id !== websiteId)
    }));
    onUpdateFavorites(newData);
  };

  const renameFolder = (folderId: string, newName: string) => { // 폴더 이름을 변경하는 함수입니다.
    const newData = { ...favoritesData };
    newData.folders = (newData.folders || []).filter(folder => folder && folder.id);
    const folderIndex = newData.folders.findIndex(f => f.id === folderId);
    if (folderIndex >= 0) {
      newData.folders[folderIndex].name = newName;
      onUpdateFavorites(newData);
    }
  };

  const deleteFolder = (folderId: string) => { // 폴더를 삭제하는 함수입니다.
    const newData = { ...favoritesData };
    newData.folders = (newData.folders || []).filter(folder => folder && folder.id);
    newData.items = (newData.items || []).filter(id => id);
    const folderIndex = newData.folders.findIndex(f => f.id === folderId);
    if (folderIndex >= 0) {
      const folderItems = (newData.folders[folderIndex]?.items || []).filter(id => id);
      newData.items.push(...folderItems);
      newData.folders = newData.folders.filter(f => f.id !== folderId);
      onUpdateFavorites(newData);
    }
  };

  const handleGuideShow = () => { // '가이드 보기' 버튼 클릭 시 가이드를 다시 표시합니다.
    if (onShowGuide) {
      onShowGuide();
    } else {
      alert('가이드 기능이 준비 중입니다.');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-2 py-8 transition-colors duration-300">
      {showSampleImage && ( // showSampleImage prop이 true일 때만 가이드 이미지를 렌더링합니다.
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border dark:from-blue-700 dark:to-purple-700 dark:border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2 dark:text-white">🎯 즐겨찾기 활용 가이드</h3>
            <p className="text-sm text-gray-600 mb-3 dark:text-gray-200">사이트를 즐겨찾기에 추가하고 폴더로 정리해보세요!</p>
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-300">
              <span>📁 폴더 생성</span>
              <span>📋 위젯 추가</span>
              <span>🔖 북마크 관리</span>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-3 text-lg font-medium" style={{ color: 'var(--main-point)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            즐겨찾기 {/* 섹션 제목입니다. */}
          </h2>
          <button
            onClick={() => {
              const event = new CustomEvent('openAddSiteModal');
              window.dispatchEvent(event); // 'openAddSiteModal' 이벤트를 발생시켜 사이트 추가 모달을 엽니다.
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
          >
            + 사이트 추가
          </button>
        </div>
        <div className="flex gap-2">
          <WidgetSelector onAddWidget={addWidget} /> {/* 위젯 선택 컴포넌트를 렌더링합니다. */}
          <button
            onClick={() => setShowNewFolderInput(true)} // 클릭 시 새 폴더 입력창을 표시합니다.
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            + 폴더 추가
          </button>
          <button
            onClick={handleGuideShow} // 클릭 시 가이드를 다시 표시합니다.
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            📖 가이드 보기
          </button>
        </div>
      </div>
      {showNewFolderInput && ( // 새 폴더 입력창이 표시되어야 할 때 렌더링합니다.
        <div className="mb-4 p-3 bg-white rounded-lg border dark:bg-gray-800 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="폴더 이름"
              className="flex-1 px-3 py-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              onBlur={createFolder}
              autoFocus
            />
            <button
              onClick={createFolder} // 클릭 시 폴더 생성 함수를 호출합니다.
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              생성
            </button>
            <button
              onClick={() => setShowNewFolderInput(false)} // 클릭 시 입력창을 숨깁니다.
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
      {(favoritesData?.widgets?.length || 0) > 0 && ( // 위젯이 있을 때만 위젯 섹션을 렌더링합니다.
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 text-sm mb-3 dark:text-gray-200">🔧 위젯</h3>
          <div className="grid gap-4 grid-cols-6">
            {(favoritesData.widgets || []).filter(widget => widget && widget.id).map((widget) => (
              <SimpleWidget
                key={widget.id}
                widget={widget}
                onRemove={removeWidget} // 위젯 제거 함수를 전달합니다.
              />
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-1 space-y-3">
          <h3 className="font-medium text-gray-700 text-sm dark:text-gray-200">📌 즐겨찾기</h3>
          <div className="grid grid-cols-1 gap-2">
            {(favoritesData.items || []).filter(websiteId => websiteId).map((websiteId) => (
              <SimpleWebsite
                key={websiteId}
                websiteId={websiteId}
                onRemove={removeFromFavorites} // 즐겨찾기에서 제거하는 함수를 전달합니다.
                onDragStart={(e) => handleDragStart(e, websiteId)} // 드래그 시작 이벤트 핸들러
                onDragOver={(e) => handleDragOver(e, websiteId)} // 드래그 오버 이벤트 핸들러
                onDragLeave={handleDragLeave} // 드래그 리브 이벤트 핸들러
                onDrop={(e) => handleDrop(e, websiteId)} // 드롭 이벤트 핸들러
                isDraggingOver={dragOverId === websiteId} // 드래그 오버 상태를 전달합니다.
              />
            ))}
          </div>
        </div>
        <div className="col-span-5 space-y-3">
          <h3 className="font-medium text-gray-700 text-sm dark:text-gray-200">📂 폴더</h3>
          <div className="grid gap-3 grid-cols-5">
            {(favoritesData.folders || []).filter(folder => folder && folder.id).map((folder) => {
              const folderItems = (folder?.items || []).filter(websiteId => websiteId);
              return (
                <SimpleFolder
                  key={folder.id}
                  folder={folder}
                  onRenameFolder={renameFolder} // 폴더 이름 변경 함수
                  onDeleteFolder={deleteFolder} // 폴더 삭제 함수
                  onDropWebsite={moveWebsiteToFolder} // 웹사이트를 폴더로 드롭하는 함수
                  onDragOverFolder={(e) => handleDragOver(e, folder.id)} // 폴더 위로 드래그 오버될 때
                  onDragLeaveFolder={handleDragLeave} // 폴더에서 드래그가 벗어날 때
                  isDraggingOver={dragOverId === folder.id} // 드래그 오버 상태
                >
                  {folderItems.map((websiteId) => (
                    <SimpleWebsite
                      key={websiteId}
                      websiteId={websiteId}
                      onRemove={removeFromFavorites}
                      onDragStart={(e) => handleDragStart(e, websiteId, folder.id)} // 폴더 내 항목 드래그 시작 시 폴더 ID도 전달
                      onDragOver={(e) => handleDragOver(e, websiteId)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, websiteId)}
                      isDraggingOver={dragOverId === websiteId}
                    />
                  ))}
                  {folderItems.length === 0 && ( // 폴더가 비어있을 때 메시지를 표시합니다.
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
  );
}