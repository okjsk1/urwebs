import { WeatherSummary } from "@/types/sources";

export async function fetchWeatherSummary(city: string): Promise<WeatherSummary> {
  return {
    location: city,
    temperature: 23,
    condition: "맑음",
    icon: "☀️",
  };
}
