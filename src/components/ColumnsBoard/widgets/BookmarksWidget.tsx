import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SiteAvatar } from '../../../components/common/SiteAvatar';

export function BookmarksWidget() {
  const bookmarks = [
    { name: 'React 공식 문서', url: 'https://react.dev' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <a
          key={bookmark.name}
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-2">
            <SiteAvatar url={bookmark.url} name={bookmark.name} size={24} />
            <span className="text-sm font-medium text-gray-700">{bookmark.name}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

































