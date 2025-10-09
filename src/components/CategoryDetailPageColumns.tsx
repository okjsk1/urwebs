import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { FolderPlus, X, Plus } from 'lucide-react';
import { WidgetSection } from './widgets/WidgetSection';
import { getCategoryData, type Site, type Folder, type CategoryData } from './data/categoryData';

interface CategoryDetailPageColumnsProps {
  categoryId: string;
  subCategory: string;
}

export function CategoryDetailPageColumns({ categoryId, subCategory }: CategoryDetailPageColumnsProps) {
  // 상태 관리
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedSite, setDraggedSite] = useState<string | null>(null);
  const [showAddSiteToFavorites, setShowAddSiteToFavorites] = useState(false);
  const [newFavoriteSite, setNewFavoriteSite] = useState({ name: '', url: '' });
  const [customFavoriteSites, setCustomFavoriteSites] = useState<Site[]>([]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [draggedSiteInFolder, setDraggedSiteInFolder] = useState<{folderId: string, siteId: string} | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverSite, setDragOverSite] = useState<{folderId: string, siteId: string} | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [data, setData] = useState(() => getCategoryData(categoryId, subCategory));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // 즐겨찾기 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites_${categoryId}`);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [categoryId]);

  // 폴더 로드 및 동적 업데이트
  useEffect(() => {
    const savedFolders = localStorage.getItem(`folders_${categoryId}`);
    const currentCategoryNames = data.categories.map(cat => cat.name);
    
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders);
      let updatedFolders = [...parsedFolders];
      
      // 추천 폴더들 동적 업데이트 (사용자가 수정하지 않은 폴더만)
      updatedFolders = updatedFolders.map((folder: Folder) => {
        // 추천 폴더이고 사용자가 수정하지 않은 경우만 업데이트
        if (folder.id.startsWith('recommended_') && !folder.isUserModified) {
          const categoryIndex = parseInt(folder.id.replace('recommended_', ''));
          const currentCategory = data.categories[categoryIndex];
          
          if (currentCategory) {
            return {
              ...folder,
              name: currentCategory.name, // 카테고리 이름으로 동적 업데이트
              sites: currentCategory.sites.map(site => site.id) // 모든 사이트로 업데이트
            };
          }
        }
        return folder;
      });
      
      // 새로운 카테고리가 추가된 경우 새 추천 폴더 생성 (모든 사이트 포함)
      const existingRecommendedCount = updatedFolders.filter(f => f.id.startsWith('recommended_')).length;
      if (existingRecommendedCount < data.categories.length) {
        const newRecommendedFolders = data.categories.slice(existingRecommendedCount).map((category, index) => ({
          id: `recommended_${existingRecommendedCount + index}`,
          name: category.name,
          sites: category.sites.map(site => site.id) // 모든 사이트 포함
        }));
        updatedFolders = [...updatedFolders, ...newRecommendedFolders];
      }
      
      setFolders(updatedFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
    } else {
      // 기본 추천 폴더 생성 (모든 사이트 포함)
      const initialFolders: Folder[] = data.categories.map((category, index) => ({
        id: `recommended_${index}`,
        name: category.name,
        sites: category.sites.map(site => site.id) // 모든 사이트 포함
      }));
      
      setFolders(initialFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(initialFolders));
    }
  }, [categoryId, data.categories]);

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 날씨 정보 가져오기
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeather({
          main: { temp: 22, humidity: 65 },
          weather: [{ description: '맑음', icon: '01d' }],
          name: '서울'
        });
      } catch (error) {
        console.log('날씨 정보를 가져올 수 없습니다.');
      }
    };
    fetchWeather();
  }, []);

  // 환율 정보 가져오기
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setExchangeRates({
          USD: 0.00075,
          EUR: 0.00069,
          JPY: 0.11
        });
      } catch (error) {
        console.log('환율 정보를 가져올 수 없습니다.');
      }
    };
    fetchExchangeRates();
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = (siteId: string) => {
    const newFavorites = new Set(favorites);
    const wasFavorite = newFavorites.has(siteId);
    
    if (wasFavorite) {
      newFavorites.delete(siteId);
    } else {
      newFavorites.add(siteId);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${categoryId}`, JSON.stringify([...newFavorites]));
  };

  // 폴더 생성
  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        sites: []
      };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  // 폴더 삭제
  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
  };

  // 폴더 이름 편집 시작
  const startEditFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  // 폴더 이름 편집 완료
  const saveEditFolder = () => {
    if (editingFolderName.trim() && editingFolderId) {
      const updatedFolders = folders.map(folder => {
        if (folder.id === editingFolderId) {
          return {
            ...folder,
            name: editingFolderName.trim(),
            isUserModified: true // 사용자가 수정했음을 표시
          };
        }
        return folder;
      });
      setFolders(updatedFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  // 폴더 이름 편집 취소
  const cancelEditFolder = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  // 사이트를 폴더에 추가
  const addSiteToFolder = (siteId: string, folderId: string) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          sites: [...folder.sites, siteId]
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
  };

  // 폴더에서 사이트 제거 (즐겨찾기로 이동)
  const removeSiteFromFolder = (siteId: string, folderId: string) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          sites: folder.sites.filter(id => id !== siteId)
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
    
    // 즐겨찾기에 추가
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.add(siteId);
      localStorage.setItem(`favorites_${categoryId}`, JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };


  // 드래그 앤 드롭 핸들러
  const handleDragStart = (siteId: string) => {
    setDraggedSite(siteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (draggedSite) {
      // 즐겨찾기에서 폴더로 이동
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(draggedSite);
        localStorage.setItem(`favorites_${categoryId}`, JSON.stringify([...newFavorites]));
        return newFavorites;
      });
      
      addSiteToFolder(draggedSite, folderId);
      setDraggedSite(null);
    }
  };

  // 폴더 순서 변경 핸들러
  const handleFolderDragStart = (folderId: string) => {
    setDraggedFolder(folderId);
  };

  const handleFolderDrop = (targetFolderId: string) => {
    if (draggedFolder && draggedFolder !== targetFolderId) {
      const draggedIndex = folders.findIndex(f => f.id === draggedFolder);
      const targetIndex = folders.findIndex(f => f.id === targetFolderId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newFolders = [...folders];
        const [draggedFolderObj] = newFolders.splice(draggedIndex, 1);
        newFolders.splice(targetIndex, 0, draggedFolderObj);
        
        // 폴더 순서 변경 시 모든 폴더를 사용자 수정으로 표시
        const modifiedFolders = newFolders.map(f => ({ ...f, isUserModified: true }));
        
        setFolders(modifiedFolders);
        localStorage.setItem(`folders_${categoryId}`, JSON.stringify(modifiedFolders));
      }
    }
    setDraggedFolder(null);
    setDragOverFolder(null);
  };

  // 폴더 내 사이트 순서 변경 핸들러
  const handleSiteInFolderDragStart = (folderId: string, siteId: string) => {
    setDraggedSiteInFolder({ folderId, siteId });
  };

  const handleSiteInFolderDrop = (targetFolderId: string, targetSiteId: string) => {
    if (draggedSiteInFolder && draggedSiteInFolder.folderId === targetFolderId) {
      const folder = folders.find(f => f.id === targetFolderId);
      if (folder) {
        const draggedIndex = folder.sites.indexOf(draggedSiteInFolder.siteId);
        const targetIndex = folder.sites.indexOf(targetSiteId);
        
        if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
          const newFolders = folders.map(f => {
            if (f.id === targetFolderId) {
              const newSites = [...f.sites];
              const [draggedSite] = newSites.splice(draggedIndex, 1);
              newSites.splice(targetIndex, 0, draggedSite);
              return { ...f, sites: newSites, isUserModified: true }; // 사용자 수정으로 표시
            }
            return f;
          });
          
          setFolders(newFolders);
          localStorage.setItem(`folders_${categoryId}`, JSON.stringify(newFolders));
        }
      }
    }
    setDraggedSiteInFolder(null);
    setDragOverSite(null);
  };

  // 폴더가 없는 즐겨찾기 사이트들 가져오기
  const getUnfolderedSites = () => {
    const folderedSites = new Set(folders.flatMap(f => f.sites));
    return Array.from(favorites).filter(siteId => !folderedSites.has(siteId));
  };

  // 모든 사이트를 가져오는 함수
  const getAllSites = () => {
    return [...data.categories.flatMap(cat => cat.sites), ...customFavoriteSites];
  };

  // 사용자 추가 사이트를 즐겨찾기에 추가
  const addSiteToFavorites = () => {
    if (newFavoriteSite.url.trim()) {
      let siteName = newFavoriteSite.name.trim();
      if (!siteName) {
        try {
          const url = new URL(newFavoriteSite.url);
          siteName = url.hostname.replace('www.', '');
        } catch {
          siteName = '사용자 사이트';
        }
      }

      const newSite: Site = {
        id: `custom_${Date.now()}`,
        name: siteName,
        description: '사용자가 추가한 사이트',
        url: newFavoriteSite.url.trim()
      };

      setCustomFavoriteSites(prev => [...prev, newSite]);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.add(newSite.id);
        localStorage.setItem(`favorites_${categoryId}`, JSON.stringify([...newFavorites]));
        return newFavorites;
      });

      setNewFavoriteSite({ name: '', url: '' });
      setShowAddSiteToFavorites(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 1. 즐겨찾기 섹션 */}
      <div className="mb-8">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900">즐겨찾기</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {getUnfolderedSites().map((siteId) => {
            const site = getAllSites().find(s => s.id === siteId);
            if (!site) return null;
            
            return (
              <div
                key={site.id}
                className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
                onClick={() => window.open(site.url, '_blank')}
                draggable
                onDragStart={() => handleDragStart(site.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=16`}
                      alt=""
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect width="16" height="16" fill="%23e5e7eb"/%3E%3Ctext x="8" y="12" text-anchor="middle" font-size="10" fill="%236b7280"%3E🌐%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 flex-1 min-w-0">
                      {site.name}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(site.id);
                    }}
                    className="text-yellow-500 hover:text-yellow-600 transition-colors"
                  >
                    <span className="text-sm">⭐</span>
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* 즐겨찾기에 사이트 추가 버튼 */}
          <div 
            className="bg-white hover:bg-gray-50 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md group"
            onClick={() => setShowAddSiteToFavorites(true)}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 flex-1 min-w-0">
                사이트 추가
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 폴더 섹션 */}
      {folders.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {folders.map((folder, folderIndex) => (
              <div
                key={folder.id}
                className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all duration-200 relative ${
                  draggedFolder === folder.id 
                    ? 'opacity-30 scale-95 shadow-lg border-blue-400 cursor-grabbing' 
                    : dragOverFolder === folder.id && draggedFolder && draggedFolder !== folder.id
                    ? 'border-blue-400 bg-blue-50 scale-105'
                    : hoveredFolder === folder.id
                    ? 'shadow-xl border-blue-300'
                    : 'border-gray-200 hover:border-gray-300 cursor-grab'
                }`}
                draggable
                onDragStart={() => handleFolderDragStart(folder.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedFolder && draggedFolder !== folder.id) {
                    setDragOverFolder(folder.id);
                  }
                  handleDragOver(e);
                }}
                onDragLeave={() => {
                  setDragOverFolder(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedFolder) {
                    handleFolderDrop(folder.id);
                  } else if (draggedSite) {
                    handleDrop(folder.id);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  {editingFolderId === folder.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-bold text-gray-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEditFolder();
                          if (e.key === 'Escape') cancelEditFolder();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEditFolder}
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="저장"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditFolder}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="취소"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h4 
                      className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex-1"
                      onDoubleClick={() => startEditFolder(folder.id, folder.name)}
                      title="더블클릭하여 이름 편집"
                    >
                      {folder.name}
                    </h4>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="폴더 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  className="space-y-2 overflow-hidden transition-all duration-300"
                  onMouseEnter={() => setHoveredFolder(folder.id)}
                  onMouseLeave={() => setHoveredFolder(null)}
                >
                  {(hoveredFolder === folder.id ? folder.sites : folder.sites.slice(0, 3)).map((siteId, siteIndex) => {
                    const site = getAllSites().find(s => s.id === siteId);
                    if (!site) return null;
                    return (
                      <div
                        key={siteId}
                        className={`bg-gray-50 hover:bg-blue-50 p-2 rounded transition-all duration-200 border-2 relative ${
                          draggedSiteInFolder?.folderId === folder.id && draggedSiteInFolder?.siteId === siteId 
                            ? 'opacity-30 scale-95 shadow-md border-blue-400 cursor-grabbing' 
                            : dragOverSite?.folderId === folder.id && dragOverSite?.siteId === siteId && draggedSiteInFolder && draggedSiteInFolder.siteId !== siteId
                            ? 'border-blue-400 bg-blue-100 scale-105'
                            : 'border-transparent hover:border-gray-300 cursor-grab'
                        }`}
                        draggable
                        onDragStart={() => handleSiteInFolderDragStart(folder.id, siteId)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedSiteInFolder && draggedSiteInFolder.folderId === folder.id && draggedSiteInFolder.siteId !== siteId) {
                            setDragOverSite({ folderId: folder.id, siteId: siteId });
                          }
                        }}
                        onDragLeave={() => {
                          setDragOverSite(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleSiteInFolderDrop(folder.id, siteId);
                        }}
                        onMouseEnter={() => {
                          setHoveredSite(site.id);
                          // 기존 타임아웃이 있으면 취소
                          if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                          }
                          // 0.5초 후에 툴팁 표시
                          const timeout = setTimeout(() => {
                            setShowTooltip(site.id);
                          }, 500);
                          setHoverTimeout(timeout);
                        }}
                        onMouseLeave={() => {
                          setHoveredSite(null);
                          setShowTooltip(null);
                          // 타임아웃 취소
                          if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                            setHoverTimeout(null);
                          }
                        }}
                        onClick={() => window.open(site.url, '_blank')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=16`}
                              alt=""
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {site.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSiteFromFolder(siteId, folder.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* 사이트 설명 툴팁 */}
                        {showTooltip === site.id && (
                          <div className="absolute bottom-full left-full ml-2 z-50">
                            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg border">
                              <div className="font-semibold text-white mb-1">{site.name}</div>
                              <div className="text-gray-200 leading-relaxed">{site.description}</div>
                              <div className="text-gray-400 text-xs mt-2 break-all">{site.url}</div>
                              {/* 화살표 */}
                              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {folder.sites.length > 3 && hoveredFolder !== folder.id && (
                    <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-200">
                      +{folder.sites.length - 3}개 더 보기
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* 새 폴더 추가 버튼 */}
            <div 
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
              onClick={() => setShowCreateFolder(true)}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto transition-colors">
                  <FolderPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 group-hover:text-blue-600 mb-1 transition-colors">새 폴더</h3>
                <p className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">클릭하여 추가</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 통계 정보 */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">카테고리 정보</h3>
          <p className="text-gray-600">
            <span className="font-bold text-pink-600">{data.categories.length}</span>개 분야에서 
            <span className="font-bold text-rose-600 ml-1">
              {data.categories.reduce((total, cat) => total + cat.sites.length, 0)}
            </span>개의 사이트를 운영 중입니다.
          </p>
        </div>
      </div>

      {/* 위젯 섹션 */}
      <WidgetSection 
        currentTime={currentTime}
        weather={weather}
        exchangeRates={exchangeRates}
      />

      {/* 모달들 */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">새 폴더 만들기</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="폴더 이름을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSiteToFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">사이트 추가</h3>
            <input
              type="text"
              value={newFavoriteSite.name}
              onChange={(e) => setNewFavoriteSite(prev => ({ ...prev, name: e.target.value }))}
              placeholder="사이트 이름 (선택사항)"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="url"
              value={newFavoriteSite.url}
              onChange={(e) => setNewFavoriteSite(prev => ({ ...prev, url: e.target.value }))}
              placeholder="사이트 URL"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddSiteToFavorites(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={addSiteToFavorites}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
