import { WidgetComponentProps } from "@/types/widgets";

type LinkItem = {
  title: string;
  url: string;
  description?: string;
};

type LinksWidgetConfig = {
  links: LinkItem[];
};

export function LinksWidget({ id, title, config }: WidgetComponentProps<LinksWidgetConfig>) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-slate-700">
          {title ?? "추천 링크"}
        </h3>
        <span className="text-xs text-slate-400">{config.links.length}개</span>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {config.links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <p className="text-sm font-medium text-slate-800">{link.title}</p>
              {link.description && (
                <p className="text-xs text-slate-500">{link.description}</p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
