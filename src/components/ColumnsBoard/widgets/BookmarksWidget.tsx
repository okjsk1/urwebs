import { Star, ExternalLink } from 'lucide-react';

export function BookmarksWidget() {
  const bookmarks = [
    { name: 'React 공식 문서', url: 'https://react.dev', icon: '⚛️' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: '🎨' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📚' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💬' },
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
            <span className="text-lg">{bookmark.icon}</span>
            <span className="text-sm font-medium text-gray-700">{bookmark.name}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

































