export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
}

export interface MusicItem {
  id: string;
  title: string;
  artist?: string;
  url: string;
  thumbnail?: string;
}

export interface WeatherSummary {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
}
