import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  Zap,
  Globe,
  CheckSquare
} from 'lucide-react';

interface HomeCenterProps {
  onCategorySelect?: (categoryId: string, subCategory?: string) => void;
}

export function HomeCenter({ onCategorySelect }: HomeCenterProps) {
  const navigate = useNavigate();

  // 애니메이션 variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const slideInVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] uw-container py-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Above the fold 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측 메인 히어로 섹션 (7컬럼) */}
          <motion.div 
            variants={slideInVariants}
            className="lg:col-span-7"
          >
            <div className="uw-section h-full min-h-[400px] flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <motion.h1 
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                >
                  나만의{' '}
                  <span className="text-blue-600 dark:text-blue-400">시작페이지</span>를{' '}
                  <span className="text-purple-600 dark:text-purple-400">만들어보세요</span>
                </motion.h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                >
                  위젯을 자유롭게 배치하고 공유하는 나만의 대시보드
                </motion.p>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <button
                    onClick={() => navigate('/mypage')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    지금 시작하기
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/pages')}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe className="w-5 h-5" />
                    다른 페이지 둘러보기
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* 우측 온보딩 섹션 (5컬럼) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5"
          >
            <div className="uw-section h-full min-h-[400px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                빠른 시작 가이드
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">위젯 추가</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">원하는 위젯을 선택하고 크기를 조정하세요</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">드래그 앤 드롭</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">위젯을 원하는 위치로 자유롭게 이동하세요</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">공유하기</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">완성된 페이지를 다른 사람들과 공유하세요</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 트렌딩 섹션 */}
        <motion.div variants={itemVariants}>
          <div className="uw-section">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              인기 위젯 미리보기
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* 날씨 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">날씨 위젯</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 text-white flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-6 h-6" />
                    <span className="text-xs opacity-90">서울</span>
                  </div>
                  <div className="text-2xl font-bold">22°C</div>
                  <div className="text-xs opacity-90">맑음</div>
                </div>
              </motion.div>

              {/* 할 일 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">할 일 위젯</p>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">할 일</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="w-3 h-3 border-2 border-gray-300 rounded"></div>
                      <span>오늘 할 일 1</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="w-3 h-3 border-2 border-gray-300 rounded"></div>
                      <span>오늘 할 일 2</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 환율 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">환율 위젯</p>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">환율</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">USD</span>
                      <span className="font-semibold text-gray-900 dark:text-white">1,300원</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">EUR</span>
                      <span className="font-semibold text-gray-900 dark:text-white">1,400원</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 뉴스 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">뉴스 위젯</p>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">뉴스</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      오늘의 주요 뉴스 헤드라인...
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      또 다른 뉴스 기사...
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 영어 학습 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">영어 학습 위젯</p>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">영어 학습</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">Serendipity</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">[serənˈdipəti]</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">우연히 좋은 일을 발견하는 것</div>
                  </div>
                </div>
              </motion.div>

              {/* 암호화폐 위젯 */}
              <motion.div
                variants={itemVariants}
                className="uw-card p-4 hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden flex flex-col"
                onClick={() => navigate('/mypage')}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">암호화폐 위젯</p>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">암호화폐</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">BTC</span>
                      <span className="font-semibold text-gray-900 dark:text-white">$45,000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">ETH</span>
                      <span className="font-semibold text-gray-900 dark:text-white">$3,200</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
