import React from 'react';

type Props = {
  widget?: any;
  isEditMode?: boolean;
  updateWidget?: (id: string, next: any) => void;
};

export const SocialWidget: React.FC<Props> = () => {
  const links = [
    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', color: 'text-sky-500' },
    { name: 'Instagram', url: 'https://instagram.com', icon: '📷', color: 'text-pink-500' },
    { name: 'Facebook', url: 'https://facebook.com', icon: '📘', color: 'text-blue-600' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '▶', color: 'text-red-600' },
  ];

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2">
        {links.map((s) => (
          <button
            key={s.name}
            onClick={() => window.open(s.url, '_blank')}
            className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md text-left"
          >
            <div className={`text-lg ${s.color}`}>{s.icon}</div>
            <div className="text-xs font-medium text-gray-800">{s.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};


