import { Site } from "./taxonomy";
import { SiteIcon } from "@/components/SiteIcon";
import { Badge } from "@/components/ui/badge";

const sourceLabels: Record<Site["sourceType"], string> = {
  public: "공공",
  association: "협회",
  insurer: "보험사",
  compare: "비교",
  edu: "교육",
  stats: "통계",
  tool: "도구",
  community: "커뮤니티",
};

interface Props {
  site: Site & { category?: string };
}

export function SiteCard({ site }: Props) {
  const website = { ...site, category: site.category ?? "보험" };
  const content = (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <SiteIcon website={website} size={20} className="w-5 h-5 rounded flex-shrink-0" />
        <h3 className="font-medium text-gray-800 truncate">{site.title}</h3>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-1">{site.description}</p>
      <Badge variant="secondary" className="w-fit mt-auto">
        {sourceLabels[site.sourceType] ?? site.sourceType}
      </Badge>
    </div>
  );

  return site.url ? (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {content}
    </a>
  ) : (
    content
  );
}
