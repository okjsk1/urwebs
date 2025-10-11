import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 상단 섹션 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <span className="font-semibold text-gray-700">URWEBS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full">
              한국어
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 링크 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="#" className="text-gray-600 hover:text-gray-800">이용약관</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">개인정보처리방침</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">책임의 한계와 법적고지</a>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="#" className="text-gray-600 hover:text-gray-800">고객센터</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">의견제안</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">준수사항</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">품질 개선 동의</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">
                단축키
                <span className="inline-block w-4 h-4 bg-gray-300 rounded-full text-xs text-gray-600 ml-1 text-center">?</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="#" className="text-gray-600 hover:text-gray-800">제휴·API 이용문의</a>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">© URWEBS Corp.</p>
        </div>
      </div>
    </footer>
  );
}











