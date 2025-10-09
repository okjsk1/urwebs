// QR 코드 위젯 - 사이트 주소 QR 코드 생성 및 출력
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Download, Copy, QrCode } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import QRCodeLib from 'qrcode';

interface QRCodeState {
  url: string;
  qrDataUrl: string;
  size: number;
}

// 실제 QR 코드 생성
const generateQRCode = async (text: string, size: number = 150): Promise<string> => {
  try {
    const options = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    const qrDataUrl = await QRCodeLib.toDataURL(text, options);
    return qrDataUrl;
  } catch (error) {
    console.error('QR 코드 생성 실패:', error);
    return '';
  }
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
      generateQRCode(state.url, state.size).then(qrDataUrl => {
        setState(prev => ({ ...prev, qrDataUrl }));
      });
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
