import { renderWidget } from "@/lib/registry";
import {
  StarterPackGroup,
  StarterPackSection,
  StarterPackTopic,
  WidgetInstance,
  WidgetRenderContext,
} from "@/types/widgets";

interface WidgetRendererProps {
  section: StarterPackSection;
  topic: StarterPackTopic;
  widgets: WidgetInstance[];
  group?: StarterPackGroup;
}

export function WidgetRenderer({ section, topic, widgets, group }: WidgetRendererProps) {
  const context: WidgetRenderContext = { section, topic, group };

  return (
    <>
      {widgets.map((widget) => (
        <div key={widget.id}>{renderWidget(widget, context)}</div>
      ))}
    </>
  );
}
