import React from "react";
import { starterSets, StarterSet } from "../data/starters";

interface StarterPreviewProps {
  onApply: (set: StarterSet) => void;
}

export function StarterPreview({ onApply }: StarterPreviewProps) {
  return (
    <div className="space-y-4">
      {starterSets.map((set) => (
        <div key={set.id} className="border p-4 rounded">
          <h3 className="font-medium mb-2">{set.title}</h3>
          <button
            className="text-sm underline text-blue-600"
            onClick={() => onApply(set)}
            type="button"
          >
            적용
          </button>
        </div>
      ))}
    </div>
  );
}
