import React, { useState } from 'react';

interface DraggableItemProps {
  id: string;
  position?: { x: number; y: number };
  onChange: (id: string, pos: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function DraggableItem({ id, position = { x: 0, y: 0 }, onChange, children }: DraggableItemProps) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position };
    setDragging(true);

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onChange(id, { x: startPos.x + dx, y: startPos.y + dy });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{ position: 'absolute', left: position.x, top: position.y, cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}
