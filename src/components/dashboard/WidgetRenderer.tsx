import { renderWidget } from "@/lib/registry";
import {
  StarterPackSection,
  StarterPackTopic,
  WidgetInstance,
  WidgetRenderContext,
} from "@/types/widgets";

interface WidgetRendererProps {
  section: StarterPackSection;
  topic: StarterPackTopic;
  widgets: WidgetInstance[];
}

export function WidgetRenderer({ section, topic, widgets }: WidgetRendererProps) {
  const context: WidgetRenderContext = { section, topic };

  return (
    <>
      {widgets.map((widget) => (
        <div key={widget.id}>{renderWidget(widget, context)}</div>
      ))}
    </>
  );
}
