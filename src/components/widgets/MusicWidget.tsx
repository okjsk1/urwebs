import React, { useState } from 'react';

type Props = {
  widget?: any;
  isEditMode?: boolean;
  updateWidget?: (id: string, next: any) => void;
};

export const MusicWidget: React.FC<Props> = () => {
  const [playing, setPlaying] = useState(false);
  const [track] = useState({ title: 'Sample Track', artist: 'Unknown Artist', length: '03:42' });

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="mb-2">
        <div className="text-sm font-semibold text-gray-800">{track.title}</div>
        <div className="text-xs text-gray-500">{track.artist} · {track.length}</div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <button
          className="px-3 py-1 text-xs border rounded"
          onClick={() => setPlaying(p => !p)}
        >
          {playing ? '일시정지' : '재생'}
        </button>
        <button className="px-3 py-1 text-xs border rounded">이전</button>
        <button className="px-3 py-1 text-xs border rounded">다음</button>
      </div>
    </div>
  );
};


