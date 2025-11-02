// 날씨 위젯 - 메인 컴포넌트 (크기 분기)
import React from 'react';
import { WidgetProps } from './utils/widget-helpers';
import { useWeatherCore } from './hooks/useWeatherCore';
import { WeatherMini } from './WeatherMini';
import { WeatherTall } from './WeatherTall';
import { WeatherFull } from './WeatherFull';

const DEFAULT_LOCATION = {
  name: '서울',
  lat: 37.5665,
  lon: 126.9780,
};

export const WeatherWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const widgetHeight = (widget as any)?.gridSize?.h || 1;
  const { state, setState, refreshWeather, updateLocation, detectCurrentLocation, toggleUnits, widgetRef } = useWeatherCore(
    widget.id,
    DEFAULT_LOCATION
  );

  // 1x1: 컴팩트 레이아웃
  if (widgetHeight === 1) {
    return (
      <WeatherMini
        state={state}
        isEditMode={isEditMode}
        setState={setState}
        widgetRef={widgetRef}
      />
    );
  }

  // 1x2: 현재 + 시간별
  if (widgetHeight === 2) {
    return (
      <WeatherTall
        state={state}
        isEditMode={isEditMode}
        setState={setState}
        updateLocation={updateLocation}
        detectCurrentLocation={detectCurrentLocation}
        toggleUnits={toggleUnits}
        widgetRef={widgetRef}
      />
    );
  }

  // 1x3+: 현재 + 상세 + 시간별 + 일별
  return (
    <WeatherFull
      state={state}
      isEditMode={isEditMode}
      setState={setState}
      updateLocation={updateLocation}
      detectCurrentLocation={detectCurrentLocation}
      toggleUnits={toggleUnits}
      widgetRef={widgetRef}
    />
  );
};
