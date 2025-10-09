import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Music, Play, Pause, SkipForward, SkipBack, Quote } from 'lucide-react';

// 음악 플레이어 위젯
export const MusicWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [currentTrack, setCurrentTrack] = useState({
    title: '샘플 곡',
    artist: '샘플 아티스트',
    isPlaying: false
  });

  const [playlist, setPlaylist] = useState([
    { id: 1, title: '인기곡 1', artist: '아티스트 A' },
    { id: 2, title: '인기곡 2', artist: '아티스트 B' },
    { id: 3, title: '인기곡 3', artist: '아티스트 C' }
  ]);

  const playTrack = (track: any) => {
    setCurrentTrack({ ...track, isPlaying: true });
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div className="text-sm font-medium text-gray-800">{currentTrack.title}</div>
        <div className="text-xs text-gray-600">{currentTrack.artist}</div>
      </div>
      
      <div className="flex gap-2 justify-center mb-3">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <SkipBack className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0"
          onClick={() => setCurrentTrack(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        >
          {currentTrack.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <SkipForward className="w-3 h-3" />
        </Button>
      </div>

      {/* 음악 플랫폼 연동 */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 text-center">음악 플랫폼</div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            onClick={() => window.open('https://www.melon.com', '_blank')}
          >
            🍈 멜론
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
            onClick={() => window.open('https://music.youtube.com', '_blank')}
          >
            🎵 유튜브 뮤직
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            onClick={() => window.open('https://www.spotify.com', '_blank')}
          >
            🎧 스포티파이
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
            onClick={() => window.open('https://www.apple.com/apple-music/', '_blank')}
          >
            🍎 애플 뮤직
          </Button>
        </div>
      </div>

      {/* 재생 목록 */}
      <div className="space-y-1">
        <div className="text-xs text-gray-500 text-center">최근 재생</div>
        <div className="space-y-1">
          {playlist.map((track, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer"
              onClick={() => playTrack(track)}
            >
              <div>
                <div className="font-medium text-gray-800">{track.title}</div>
                <div className="text-gray-500">{track.artist}</div>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Play className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 명언 & 격언 위젯
export const QuoteWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      text: "성공은 준비된 자에게 찾아오는 기회다.",
      author: "루이 파스퇴르",
      category: "성공"
    },
    {
      id: 2,
      text: "미래는 지금 시작된다.",
      author: "마하트마 간디",
      category: "미래"
    },
    {
      id: 3,
      text: "꿈을 이루고 싶다면 먼저 깨어나라.",
      author: "토니 로빈스",
      category: "꿈"
    }
  ]);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', category: '' });

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const addQuote = () => {
    if (newQuote.text.trim() && newQuote.author.trim()) {
      const quote = {
        id: Date.now(),
        text: newQuote.text.trim(),
        author: newQuote.author.trim(),
        category: newQuote.category.trim() || '기타'
      };
      setQuotes([...quotes, quote]);
      setNewQuote({ text: '', author: '', category: '' });
    }
  };

  const deleteQuote = (id: number) => {
    setQuotes(quotes.filter(q => q.id !== id));
    if (currentQuoteIndex >= quotes.length - 1) {
      setCurrentQuoteIndex(Math.max(0, quotes.length - 2));
    }
  };

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">💭</div>
        <h4 className="font-semibold text-sm text-gray-800">명언 & 격언</h4>
        <p className="text-xs text-gray-500">영감을 주는 명언들</p>
      </div>

      {quotes.length > 0 && currentQuote && (
        <div className="space-y-3">
          {/* 현재 명언 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-800 mb-2 italic">
              "{currentQuote.text}"
            </div>
            <div className="text-xs text-gray-600 text-right">
              - {currentQuote.author}
            </div>
            <div className="text-xs text-blue-600 text-center mt-2">
              {currentQuote.category}
            </div>
          </div>

          {/* 네비게이션 */}
          <div className="flex justify-between items-center">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={prevQuote}
              disabled={quotes.length <= 1}
            >
              ←
            </Button>
            <span className="text-xs text-gray-500">
              {currentQuoteIndex + 1} / {quotes.length}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={nextQuote}
              disabled={quotes.length <= 1}
            >
              →
            </Button>
          </div>

          {/* 편집 모드에서 명언 관리 */}
          {isEditMode && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">새 명언 추가</div>
              <input
                type="text"
                value={newQuote.text}
                onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                placeholder="명언 내용"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newQuote.author}
                onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                placeholder="작가명"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newQuote.category}
                onChange={(e) => setNewQuote(prev => ({ ...prev, category: e.target.value }))}
                placeholder="카테고리 (선택사항)"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <Button 
                size="sm" 
                className="w-full h-6 text-xs"
                onClick={addQuote}
              >
                명언 추가
              </Button>
              
              {quotes.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full h-6 text-xs text-red-600 hover:text-red-700"
                  onClick={() => deleteQuote(currentQuote.id)}
                >
                  현재 명언 삭제
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {quotes.length === 0 && (
        <div className="text-center text-gray-500 text-xs">
          명언이 없습니다.
          {isEditMode && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">새 명언 추가</div>
              <input
                type="text"
                value={newQuote.text}
                onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                placeholder="명언 내용"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded mt-1"
              />
              <input
                type="text"
                value={newQuote.author}
                onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                placeholder="작가명"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded mt-1"
              />
              <Button 
                size="sm" 
                className="w-full h-6 text-xs mt-2"
                onClick={addQuote}
              >
                명언 추가
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
