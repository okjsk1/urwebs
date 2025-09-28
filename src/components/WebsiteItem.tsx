import { Website } from "../types";
import { trackVisit } from "../utils/visitTrack";
import { SiteIcon } from "./SiteIcon";

interface WebsiteItemProps {
  website: Website;
  showDescription: boolean;

  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, website: Website) => void;
}

export function WebsiteItem({
  website,
  showDescription,
  isDraggable = false,
  onDragStart,
}: WebsiteItemProps) {
  if (!website?.url || !website?.title) return null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("websiteId", website.id);
    onDragStart?.(e, website);
  };


  return (
    <li
      className="urwebs-website-item relative flex w-full flex-col items-start min-h-9 rounded-md min-w-0 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      style={{ height: showDescription ? "auto" : undefined }}
    >

      <div className="flex items-center gap-2 min-w-0 w-full">
        <SiteIcon
          website={website}
          size={16}
          className="w-4 h-4 rounded border shrink-0"
        />

        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[var(--main-dark)] focus:outline-none"
          style={{ fontSize: "12.5px" }}
          title={website.title}
          onClick={() => trackVisit(website.id)}
        >
          {website.title}
        </a>
      </div>

      {showDescription && (website.summary || website.description) && (
        <div
          className="mt-1 pl-6 pr-2 text-left"
          style={{
            fontSize: "10px",
            color: "var(--sub-text)",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {website.summary ?? website.description}
        </div>
      )}
    </li>
  );
}
