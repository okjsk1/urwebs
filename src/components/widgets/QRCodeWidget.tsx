// QR 접속 위젯 - 현재 페이지 URL을 QR 코드로 생성
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { WidgetProps, showToast } from './utils/widget-helpers';

export const QRCodeWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // 현재 페이지 URL로 QR 코드 생성
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const currentUrl = window.location.href;
        const options = {
          width: 82,
          margin: 0.1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' as const
        };

        const dataUrl = await QRCode.toDataURL(currentUrl, options);
        setQrCodeDataUrl(dataUrl);
        
        // Canvas에도 그리기
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, currentUrl, options);
        }
      } catch (error) {
        console.error('QR 코드 생성 실패:', error);
        showToast('QR 코드 생성 실패', 'error');
      }
    };

    generateQRCode();
  }, []); // 페이지 URL 변경 시 자동 업데이트

  // QR 코드 다운로드
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) {
      showToast('QR 코드를 먼저 생성하세요', 'error');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR 코드 다운로드됨', 'success');
  };

  return (
    <div className="h-full flex items-center justify-center px-1 py-0.5">
      {qrCodeDataUrl ? (
        <div className="flex items-center gap-2">
          <img 
            src={qrCodeDataUrl} 
            alt="QR Code" 
            className="border border-gray-200 dark:border-gray-700 rounded max-w-[82px]"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* 다운로드 버튼 - 세로로 */}
          <Button
            size="sm"
            className="h-[82px] w-[24px] px-0.5 flex flex-col items-center justify-center gap-0.5"
            onClick={downloadQRCode}
          >
            <Download className="w-2 h-2" />
            <div className="text-[8px] leading-tight">
              <div>다</div>
              <div>운</div>
              <div>로</div>
              <div>드</div>
            </div>
          </Button>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-[10px]">
          생성 중...
        </div>
      )}
    </div>
  );
};

