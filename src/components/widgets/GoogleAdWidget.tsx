// 구글 광고 위젯 (임시 이미지)
import React from 'react';

interface GoogleAdWidgetProps {
  widget: any;
  isEditMode?: boolean;
  updateWidget?: (id: string, updates: any) => void;
}

export const GoogleAdWidget: React.FC<GoogleAdWidgetProps> = ({ widget, isEditMode }) => {
  return (
    <div className="p-3 h-full flex flex-col items-center justify-center bg-gray-50">
      {/* 광고 플레이스홀더 */}
      <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <div className="text-center">
          {/* Google Ads 로고 스타일 */}
          <div className="mb-3">
            <div className="text-xl font-bold">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
              <span className="text-gray-700 ml-1">Ads</span>
            </div>
          </div>
          
          {/* 임시 광고 이미지 영역 */}
          <div className="mb-3">
            <div className="w-48 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
              <span className="text-4xl">📢</span>
            </div>
          </div>
          
          {/* 광고 설명 텍스트 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">광고 영역</p>
            <p className="text-xs">300 x 250</p>
          </div>
          
          {isEditMode && (
            <div className="mt-2 text-xs text-blue-600">
              편집 모드에서는 광고가 표시되지 않습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
















<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
