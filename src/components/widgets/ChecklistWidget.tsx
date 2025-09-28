import { useEffect, useMemo, useState } from "react";
import { WidgetComponentProps } from "@/types/widgets";

type ChecklistItem = {
  id: string;
  label: string;
  checked?: boolean;
};

type ChecklistWidgetConfig = {
  storageKey?: string;
  items: ChecklistItem[];
};

function usePersistentChecklist(id: string, config: ChecklistWidgetConfig) {
  const storageKey = useMemo(
    () => `starterpack:checklist:${config.storageKey ?? id}`,
    [config.storageKey, id],
  );
  const [items, setItems] = useState<ChecklistItem[]>(config.items);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ChecklistItem[];
        setItems(parsed);
      } catch (error) {
        console.warn("Failed to parse checklist state", error);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  return { items, setItems };
}

export function ChecklistWidget({ id, title, config }: WidgetComponentProps<ChecklistWidgetConfig>) {
  const { items, setItems } = usePersistentChecklist(id, config);

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title ?? "체크리스트"}</h3>
        <span className="text-xs text-slate-400">
          완료 {items.filter((item) => item.checked).length}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => toggleItem(item.id)}
                className="h-3.5 w-3.5"
              />
              <span className="text-sm text-slate-600">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
