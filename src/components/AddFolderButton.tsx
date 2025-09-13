import { IconFolderPlus } from "lucide-react";

interface AddFolderButtonProps {
  onClick: () => void;
}

/** Button to trigger folder creation */
export function AddFolderButton({ onClick }: AddFolderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
      type="button"
    >
      <IconFolderPlus className="w-4 h-4" />
      폴더 추가
    </button>
  );
}
