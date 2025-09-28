import { CalendarWidgetV2 } from "@/components/widgets/CalendarWidgetV2";
import { ChecklistWidget } from "@/components/widgets/ChecklistWidget";
import { LinksWidget } from "@/components/widgets/LinksWidget";
import { MapWidget } from "@/components/widgets/MapWidget";
import { MusicWidget } from "@/components/widgets/MusicWidget";
import { VideosWidget } from "@/components/widgets/VideosWidget";
import { WeatherWidgetV2 } from "@/components/widgets/WeatherWidgetV2";
import {
  WidgetComponent,
  WidgetComponentProps,
  WidgetInstance,
  WidgetKind,
  WidgetRenderContext,
} from "@/types/widgets";

type RegistryEntry = {
  component: WidgetComponent<Record<string, unknown>>;
  defaultTitle?: string;
};

const registry: Record<WidgetKind, RegistryEntry> = {
  links: { component: LinksWidget, defaultTitle: "추천 링크" },
  weather: { component: WeatherWidgetV2, defaultTitle: "오늘의 날씨" },
  checklist: { component: ChecklistWidget, defaultTitle: "체크리스트" },
  calendar: { component: CalendarWidgetV2, defaultTitle: "캘린더" },
  videos: { component: VideosWidget, defaultTitle: "추천 영상" },
  music: { component: MusicWidget, defaultTitle: "배경 음악" },
  map: { component: MapWidget, defaultTitle: "지도" },
};

export function registerWidget(kind: WidgetKind, entry: RegistryEntry) {
  registry[kind] = entry;
}

export function getWidgetEntry(kind: WidgetKind): RegistryEntry | undefined {
  return registry[kind];
}

export function createWidgetProps(
  instance: WidgetInstance,
  context: WidgetRenderContext,
): WidgetComponentProps<Record<string, unknown>> {
  const entry = getWidgetEntry(instance.kind);
  if (!entry) {
    throw new Error(`Widget kind '${instance.kind}' is not registered`);
  }

  return {
    id: instance.id,
    title: instance.title ?? entry.defaultTitle,
    config: (instance.props ?? {}) as Record<string, unknown>,
    context,
  };
}

export function renderWidget(instance: WidgetInstance, context: WidgetRenderContext) {
  const entry = getWidgetEntry(instance.kind);
  if (!entry) return null;
  const props = createWidgetProps(instance, context);
  const Widget = entry.component as WidgetComponent<Record<string, unknown>>;
  return <Widget {...props} />;
}
