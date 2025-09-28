import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star } from 'lucide-react';

interface SiteCardProps {
  name: string;
  description: string;
  url: string;
  tags?: string[];
  category: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function SiteCard({ name, description, url, tags, category, isFavorite = false, onToggleFavorite }: SiteCardProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname;
      
      // 특정 사이트들의 파비콘 매핑
      const faviconMapping: { [key: string]: string } = {
        'finance.naver.com': 'naver.com',
        'finance.daum.net': 'daum.net',
        'land.naver.com': 'naver.com',
        'studio.youtube.com': 'youtube.com',
        'gaming.youtube.com': 'youtube.com',
        'www.youtube.com/live': 'youtube.com',
        'creatoracademy.youtube.com': 'youtube.com',
        'help.autodesk.com': 'autodesk.com',
        'securities.miraeasset.com': 'miraeasset.com',
        'owner.dabangapp.com': 'dabangapp.com',
        'tossinvest.com': 'toss.im',
        'securities.kakaopay.com': 'kakaopay.com',
        'www.archdaily.com/tag/korea': 'archdaily.com'
      };
      
      // 매핑된 도메인이 있으면 사용
      const mappedDomain = faviconMapping[domain] || faviconMapping[urlObj.href];
      if (mappedDomain) {
        domain = mappedDomain;
      }
      
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 h-40 cursor-pointer group flex flex-col hover:transform hover:scale-105" onClick={handleClick}>
      {/* 사이트 이름과 즐겨찾기 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img 
            src={getFaviconUrl(url)} 
            alt="" 
            className="w-5 h-5 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h4 className="font-bold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">{name}</h4>
        </div>
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 h-6 w-6 flex-shrink-0 hover:bg-yellow-50 rounded-full"
          >
            <Star 
              className={`w-4 h-4 border border-gray-300 rounded ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`} 
            />
          </Button>
        )}
      </div>
      
      {/* URL 표시 */}
      <div className="text-xs text-blue-600 mb-2 truncate bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-mono">
        🔗 {getDisplayUrl(url)}
      </div>
      
      {/* 요약 설명 */}
      <p className="text-xs text-gray-700 mb-3 line-clamp-2 leading-relaxed flex-1 bg-gray-50 p-2 rounded-md">
        {description}
      </p>
      
      {/* 태그들 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1 h-5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full border border-blue-200">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}