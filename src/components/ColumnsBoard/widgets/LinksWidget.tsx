import { Link, ExternalLink } from 'lucide-react';

export function LinksWidget() {
  const links = [
    { name: '네이버', url: 'https://naver.com', icon: '🔍', color: 'bg-green-50' },
    { name: '구글', url: 'https://google.com', icon: '🌐', color: 'bg-blue-50' },
    { name: '유튜브', url: 'https://youtube.com', icon: '📺', color: 'bg-red-50' },
    { name: '깃허브', url: 'https://github.com', icon: '💻', color: 'bg-gray-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} p-3 rounded-lg hover:shadow-md transition-all group`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
              {link.name}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
































