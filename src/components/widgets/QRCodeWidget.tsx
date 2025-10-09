// QR 코드 위젯 - 사이트 주소 QR 코드 생성 및 출력
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Download, Copy, QrCode } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface QRCodeState {
  url: string;
  qrDataUrl: string;
  size: number;
}

// 간단한 QR 코드 생성 (실제로는 qrcode 라이브러리 사용 권장)
const generateQRCode = (text: string, size: number = 150): string => {
  // 간단한 QR 코드 시뮬레이션 (실제 구현에서는 qrcode 라이브러리 사용)
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // 배경
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // QR 코드 패턴 생성 (간단한 시뮬레이션)
  const moduleSize = Math.floor(size / 25);
  const modules = 25;
  
  // 텍스트 해시를 기반으로 패턴 생성
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
  }
  
  // 시드 기반 랜덤 패턴
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  ctx.fillStyle = '#000000';
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      const seed = hash + row * modules + col;
      if (seededRandom(seed) > 0.5) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
  
  // 코너 마커 추가
  const markerSize = moduleSize * 7;
  ctx.fillStyle = '#000000';
  // 좌상단
  ctx.fillRect(0, 0, markerSize, markerSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(moduleSize, moduleSize, markerSize - 2 * moduleSize, markerSize - 2 * moduleSize);
  ctx.fillStyle = '#000000';
  ctx.fillRect(2 * moduleSize, 2 * moduleSize, markerSize - 4 * moduleSize, markerSize - 4 * moduleSize);
  
  // 우상단
  ctx.fillStyle = '#000000';
  ctx.fillRect(size - markerSize, 0, markerSize, markerSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(size - markerSize + moduleSize, moduleSize, markerSize - 2 * moduleSize, markerSize - 2 * moduleSize);
  ctx.fillStyle = '#000000';
  ctx.fillRect(size - markerSize + 2 * moduleSize, 2 * moduleSize, markerSize - 4 * moduleSize, markerSize - 4 * moduleSize);
  
  // 좌하단
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, size - markerSize, markerSize, markerSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(moduleSize, size - markerSize + moduleSize, markerSize - 2 * moduleSize, markerSize - 2 * moduleSize);
  ctx.fillStyle = '#000000';
  ctx.fillRect(2 * moduleSize, size - markerSize + 2 * moduleSize, markerSize - 4 * moduleSize, markerSize - 4 * moduleSize);
  
  return canvas.toDataURL('image/png');
};

export const QRCodeWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<QRCodeState>(() => {
    const saved = readLocal(widget.id, {
      url: window.location.href,
      qrDataUrl: '',
      size: 150
    });
    return saved;
  });

  // QR 코드 생성
  useEffect(() => {
    if (state.url) {
      const qrDataUrl = generateQRCode(state.url, state.size);
      setState(prev => ({ ...prev, qrDataUrl }));
    }
  }, [state.url, state.size]);

  // 상태 저장
  const saveState = useCallback(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  const updateUrl = useCallback((newUrl: string) => {
    setState(prev => ({ ...prev, url: newUrl }));
    saveState();
  }, [saveState]);

  const updateSize = useCallback((newSize: number) => {
    setState(prev => ({ ...prev, size: newSize }));
    saveState();
  }, [saveState]);

  const downloadQR = useCallback(() => {
    if (!state.qrDataUrl) {
      showToast('QR 코드를 생성 중입니다', 'error');
      return;
    }

    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = state.qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('QR 코드가 다운로드되었습니다', 'success');
  }, [state.qrDataUrl]);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.url);
      showToast('URL이 클립보드에 복사되었습니다', 'success');
    } catch {
      showToast('URL 복사에 실패했습니다', 'error');
    }
  }, [state.url]);

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="text-center mb-3">
        <QrCode className="w-6 h-6 mx-auto mb-1 text-gray-600" />
        <h4 className="font-semibold text-sm text-gray-800">QR 코드</h4>
      </div>

      {/* QR 코드 표시 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {state.qrDataUrl ? (
          <div className="mb-3">
            <img 
              src={state.qrDataUrl} 
              alt="QR Code" 
              className="w-24 h-24 mx-auto border border-gray-200 rounded"
            />
          </div>
        ) : (
          <div className="w-24 h-24 mx-auto border border-gray-200 rounded flex items-center justify-center mb-3">
            <div className="text-gray-400 text-xs">생성 중...</div>
          </div>
        )}

        {/* URL 표시 */}
        <div className="w-full mb-3">
          <div className="text-xs text-gray-600 text-center break-all px-2">
            {state.url}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="space-y-2 w-full">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={downloadQR}
            disabled={!state.qrDataUrl}
          >
            <Download className="w-3 h-3 mr-1" />
            다운로드
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={copyUrl}
          >
            <Copy className="w-3 h-3 mr-1" />
            URL 복사
          </Button>
        </div>
      </div>

      {/* 편집 모드 */}
      {isEditMode && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">URL</label>
              <input
                type="url"
                value={state.url}
                onChange={(e) => updateUrl(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">크기</label>
              <select
                value={state.size}
                onChange={(e) => updateSize(parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value={100}>100px</option>
                <option value={150}>150px</option>
                <option value={200}>200px</option>
                <option value={250}>250px</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
