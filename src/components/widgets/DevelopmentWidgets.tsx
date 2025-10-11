// 리팩터링된 DevelopmentWidgets - 고급 기능과 접근성 강화
export { GitHubWidget } from './GitHubWidget';

// 기존 단위 변환 위젯 (간단한 버전 유지)
import React, { useState } from 'react';
import { Button } from '../ui/button';

export const ConverterWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [converterType, setConverterType] = useState('length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');

  const converters = {
    length: {
      units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
      conversions: {
        mm: 0.001, cm: 0.01, m: 1, km: 1000,
        in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34
      }
    },
    weight: {
      units: ['mg', 'g', 'kg', 'oz', 'lb'],
      conversions: {
        mg: 0.001, g: 1, kg: 1000,
        oz: 28.3495, lb: 453.592
      }
    },
    temperature: {
      units: ['°C', '°F', 'K'],
      conversions: {}
    }
  };

  const convert = () => {
    if (!inputValue) return '0';
    
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '0';

    if (converterType === 'temperature') {
      if (fromUnit === '°C' && toUnit === '°F') {
        return ((value * 9/5) + 32).toFixed(2);
      } else if (fromUnit === '°F' && toUnit === '°C') {
        return ((value - 32) * 5/9).toFixed(2);
      } else if (fromUnit === '°C' && toUnit === 'K') {
        return (value + 273.15).toFixed(2);
      } else if (fromUnit === 'K' && toUnit === '°C') {
        return (value - 273.15).toFixed(2);
      }
      return value.toString();
    }

    const fromFactor = converters[converterType as keyof typeof converters].conversions[fromUnit as keyof typeof converters['length']['conversions']];
    const toFactor = converters[converterType as keyof typeof converters].conversions[toUnit as keyof typeof converters['length']['conversions']];
    
    if (fromFactor && toFactor) {
      return ((value * fromFactor) / toFactor).toFixed(4);
    }
    
    return value.toString();
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🔄</div>
        <h4 className="font-semibold text-sm text-gray-800">단위 변환</h4>
      </div>
      
      {/* 변환 타입 선택 */}
      <div className="flex gap-1 mb-3">
        {Object.keys(converters).map(type => (
          <Button
            key={type}
            size="sm"
            variant={converterType === type ? 'default' : 'outline'}
            className="flex-1 h-6 text-xs"
            onClick={() => setConverterType(type)}
            aria-label={`${type === 'length' ? '길이' : type === 'weight' ? '무게' : '온도'} 변환`}
          >
            {type === 'length' ? '길이' : type === 'weight' ? '무게' : '온도'}
          </Button>
        ))}
      </div>
      
      {/* 입력 필드 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="값 입력"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            aria-label="변환할 값 입력"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            aria-label="변환할 단위 선택"
          >
            {converters[converterType as keyof typeof converters].units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 text-gray-600">
            {convert()}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            aria-label="변환 결과 단위 선택"
          >
            {converters[converterType as keyof typeof converters].units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// 기존 QR 코드 위젯 (간단한 버전 유지)
export const QRCodeWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [url, setUrl] = useState('https://example.com');
  const [qrCode, setQrCode] = useState('');

  const generateQRCode = () => {
    // 실제로는 QR 코드 라이브러리를 사용해야 하지만, 여기서는 시뮬레이션
    const mockQRCode = `
    ████████████████████████████████
    ██                          ██
    ██  ██████  ██████  ██████  ██
    ██  ██  ██  ██  ██  ██  ██  ██
    ██  ██████  ██████  ██████  ██
    ██                          ██
    ██  ██████  ██████  ██████  ██
    ██  ██  ██  ██  ██  ██  ██  ██
    ██  ██████  ██████  ██████  ██
    ██                          ██
    ████████████████████████████████
    `;
    setQrCode(mockQRCode);
  };

  React.useEffect(() => {
    generateQRCode();
  }, [url]);

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📱</div>
        <h4 className="font-semibold text-sm text-gray-800">QR 코드</h4>
      </div>
      
      {/* URL 입력 */}
      <div className="mb-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL 입력"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          aria-label="QR 코드로 변환할 URL 입력"
        />
      </div>
      
      {/* QR 코드 표시 */}
      <div className="bg-white p-3 rounded border text-center mb-3">
        <pre className="text-xs font-mono leading-tight" aria-label="QR 코드">{qrCode}</pre>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-8 text-xs"
          onClick={generateQRCode}
          aria-label="QR 코드 새로 생성"
        >
          새로고침
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-8 text-xs"
          onClick={copyUrl}
          aria-label="URL 복사"
        >
          URL 복사
        </Button>
      </div>
    </div>
  );
};
