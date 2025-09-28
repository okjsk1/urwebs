import { JSX, ReactNode } from "react";

export type WidgetKind =
  | "links"
  | "weather"
  | "checklist"
  | "calendar"
  | "videos"
  | "music"
  | "map";

export interface WidgetLayout {
  w: number;
  h: number;
  x?: number;
  y?: number;
}

export interface WidgetInstance<TKind extends WidgetKind = WidgetKind> {
  id: string;
  kind: TKind;
  title?: string;
  description?: string;
  props?: Record<string, unknown>;
  layout?: WidgetLayout;
}

export interface StarterPackTopic {
  slug: string;
  title: string;
  description?: string;
  widgets?: WidgetInstance[];
  groups?: StarterPackGroup[];
}

export interface StarterPackSection {
  slug: string;
  title: string;
  description?: string;
  topics: StarterPackTopic[];
  groups?: StarterPackGroup[];
  icon?: ReactNode;
}

export interface StarterPackGroup {
  slug: string;
  title: string;
  description?: string;
  widgets: WidgetInstance[];
}

export interface WidgetRenderContext {
  section: StarterPackSection;
  topic: StarterPackTopic;
  group?: StarterPackGroup;
}

export interface WidgetComponentProps<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  title?: string;
  config: TConfig;
  context: WidgetRenderContext;
}

export type WidgetComponent<TConfig extends Record<string, unknown>> = (
  props: WidgetComponentProps<TConfig>,
) => JSX.Element | null;
