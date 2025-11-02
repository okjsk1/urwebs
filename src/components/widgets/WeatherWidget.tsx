// 날씨 위젯 - 메인 컴포넌트 (크기 분기)
import React from 'react';
import { WidgetProps } from './utils/widget-helpers';
import { useWeatherCore } from './hooks/useWeatherCore';
import { WeatherMini } from './WeatherMini';
import { WeatherTall } from './WeatherTall';
import { WeatherFull } from './WeatherFull';
import { WeatherWide } from './WeatherWide';
import { WeatherLarge } from './WeatherLarge';

const DEFAULT_LOCATION = {
  name: '서울',
  lat: 37.5665,
  lon: 126.9780,
};

export const WeatherWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const gridSize = (widget as any)?.gridSize || { w: 1, h: 1 };
  const widgetWidth = gridSize.w || 1;
  const widgetHeight = gridSize.h || 1;
  
  const { state, setState, refreshWeather, updateLocation, detectCurrentLocation, toggleUnits, widgetRef } = useWeatherCore(
    widget.id,
    DEFAULT_LOCATION
  );

  // 1x1: 컴팩트 레이아웃
  if (widgetWidth === 1 && widgetHeight === 1) {
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
  if (widgetWidth === 1 && widgetHeight === 2) {
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
  if (widgetWidth === 1 && widgetHeight >= 3) {
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
  }

  // 2x1, 2x2, 2x3: 가로형 레이아웃
  if (widgetWidth === 2) {
    return (
      <WeatherWide
        state={state}
        isEditMode={isEditMode}
        setState={setState}
        updateLocation={updateLocation}
        detectCurrentLocation={detectCurrentLocation}
        toggleUnits={toggleUnits}
        widgetRef={widgetRef}
        width={widgetWidth}
        height={widgetHeight}
      />
    );
  }

  // 3x1, 3x2, 3x3: 대형 가로형 레이아웃
  if (widgetWidth === 3) {
    return (
      <WeatherLarge
        state={state}
        isEditMode={isEditMode}
        setState={setState}
        updateLocation={updateLocation}
        detectCurrentLocation={detectCurrentLocation}
        toggleUnits={toggleUnits}
        widgetRef={widgetRef}
        height={widgetHeight}
      />
    );
  }

  // 기본: WeatherFull 사용
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
