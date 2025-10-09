// 계산기 위젯 - 고급 계산, 히스토리, 접근성
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, History, Copy, Trash2 } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  history: string[];
  memory: number;
  showHistory: boolean;
}

const OPERATIONS = {
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '×': (a: number, b: number) => a * b,
  '÷': (a: number, b: number) => b !== 0 ? a / b : 0,
  '%': (a: number, b: number) => (a * b) / 100,
  '^': (a: number, b: number) => Math.pow(a, b)
};

export const CalculatorWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<CalculatorState>(() => {
    const saved = readLocal(widget.id, {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      history: [],
      memory: 0,
      showHistory: false
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  const inputNumber = useCallback((num: string) => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: num,
          waitingForOperand: false
        };
      } else {
        return {
          ...prev,
          display: prev.display === '0' ? num : prev.display + num
        };
      }
    });
  }, []);

  const inputOperation = useCallback((nextOperation: string) => {
    setState(prev => {
      const inputValue = parseFloat(prev.display);

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          waitingForOperand: true,
          operation: nextOperation
        };
      } else if (prev.operation && !prev.waitingForOperand) {
        const currentValue = prev.previousValue || 0;
        const newValue = OPERATIONS[prev.operation as keyof typeof OPERATIONS]?.(currentValue, inputValue) || inputValue;
        
        const historyEntry = `${currentValue} ${prev.operation} ${inputValue} = ${newValue}`;
        
        return {
          ...prev,
          display: String(newValue),
          previousValue: newValue,
          waitingForOperand: true,
          operation: nextOperation,
          history: [...prev.history.slice(-9), historyEntry] // 최근 10개만 유지
        };
      } else {
        return {
          ...prev,
          operation: nextOperation,
          waitingForOperand: true
        };
      }
    });
  }, []);

  const performCalculation = useCallback(() => {
    setState(prev => {
      const inputValue = parseFloat(prev.display);

      if (prev.previousValue !== null && prev.operation && !prev.waitingForOperand) {
        const newValue = OPERATIONS[prev.operation as keyof typeof OPERATIONS]?.(prev.previousValue, inputValue) || inputValue;
        const historyEntry = `${prev.previousValue} ${prev.operation} ${inputValue} = ${newValue}`;
        
        return {
          ...prev,
          display: String(newValue),
          previousValue: null,
          operation: null,
          waitingForOperand: true,
          history: [...prev.history.slice(-9), historyEntry]
        };
      }
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      history: []
    }));
    showToast('모든 데이터가 삭제되었습니다', 'success');
  }, []);

  const inputDecimal = useCallback(() => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false
        };
      } else if (prev.display.indexOf('.') === -1) {
        return {
          ...prev,
          display: prev.display + '.'
        };
      }
      return prev;
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: prev.display === '0' ? '0' : String(parseFloat(prev.display) * -1)
    }));
  }, []);

  const percentage = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: String(parseFloat(prev.display) / 100)
    }));
  }, []);

  const squareRoot = useCallback(() => {
    const value = parseFloat(state.display);
    if (value >= 0) {
      const result = Math.sqrt(value);
      setState(prev => ({
        ...prev,
        display: String(result),
        waitingForOperand: true
      }));
    }
  }, [state.display]);

  const square = useCallback(() => {
    const value = parseFloat(state.display);
    const result = value * value;
    setState(prev => ({
      ...prev,
      display: String(result),
      waitingForOperand: true
    }));
  }, [state.display]);

  const memoryStore = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: parseFloat(prev.display)
    }));
    showToast('메모리에 저장되었습니다', 'success');
  }, []);

  const memoryRecall = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: String(prev.memory),
      waitingForOperand: true
    }));
  }, []);

  const memoryClear = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: 0
    }));
    showToast('메모리가 삭제되었습니다', 'success');
  }, []);

  const memoryAdd = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: prev.memory + parseFloat(prev.display)
    }));
    showToast('메모리에 더해졌습니다', 'success');
  }, []);

  const copyResult = useCallback(() => {
    navigator.clipboard.writeText(state.display);
    showToast('결과가 복사되었습니다', 'success');
  }, [state.display]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      e.preventDefault();
      
      switch (e.key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          inputNumber(e.key);
          break;
        case '+':
          inputOperation('+');
          break;
        case '-':
          inputOperation('-');
          break;
        case '*':
          inputOperation('×');
          break;
        case '/':
          inputOperation('÷');
          break;
        case 'Enter':
        case '=':
          performCalculation();
          break;
        case 'Escape':
          clear();
          break;
        case '.':
          inputDecimal();
          break;
        case '%':
          percentage();
          break;
        case 'c':
        case 'C':
          clearAll();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputOperation, performCalculation, clear, clearAll, inputDecimal, percentage]);

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // 너무 큰 수는 과학적 표기법 사용
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // 소수점 자리수 제한
    return num.toString().length > 12 ? num.toPrecision(10) : value;
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🧮</div>
        <h4 className="font-semibold text-sm text-gray-800">계산기</h4>
      </div>
      
      {/* 디스플레이 */}
      <div className="mb-3">
        <div className="bg-gray-900 text-white p-3 rounded text-right relative">
          <div className="text-lg font-mono min-h-[1.5rem] break-all">
            {formatDisplay(state.display)}
          </div>
          {state.memory !== 0 && (
            <div className="absolute top-1 left-2 text-xs text-gray-400">
              M: {state.memory}
            </div>
          )}
          {state.previousValue !== null && state.operation && (
            <div className="absolute top-1 right-2 text-xs text-gray-400">
              {state.previousValue} {state.operation}
            </div>
          )}
        </div>
      </div>

      {/* 히스토리 */}
      {state.showHistory && state.history.length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 rounded max-h-24 overflow-y-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">계산 히스토리</span>
            <button
              onClick={clearAll}
              className="text-red-500 hover:text-red-700"
              aria-label="히스토리 삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {state.history.slice(-5).map((entry, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 그리드 */}
      <div className="grid grid-cols-4 gap-1">
        {/* 첫 번째 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={clear}
          aria-label="지우기"
        >
          C
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={clearAll}
          aria-label="모두 지우기"
        >
          AC
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={toggleSign}
          aria-label="부호 변경"
        >
          ±
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={percentage}
          aria-label="백분율"
        >
          %
        </Button>
        
        {/* 두 번째 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputOperation('÷')}
          aria-label="나누기"
        >
          ÷
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={squareRoot}
          aria-label="제곱근"
        >
          √
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={square}
          aria-label="제곱"
        >
          x²
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputOperation('×')}
          aria-label="곱하기"
        >
          ×
        </Button>
        
        {/* 세 번째 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputOperation('-')}
          aria-label="빼기"
        >
          -
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputOperation('^')}
          aria-label="거듭제곱"
        >
          x^y
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={copyResult}
          aria-label="결과 복사"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputOperation('+')}
          aria-label="더하기"
        >
          +
        </Button>
        
        {/* 네 번째 행 - 숫자 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('7')}
          aria-label="7"
        >
          7
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('8')}
          aria-label="8"
        >
          8
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('9')}
          aria-label="9"
        >
          9
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={performCalculation}
          aria-label="계산"
        >
          =
        </Button>
        
        {/* 다섯 번째 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('4')}
          aria-label="4"
        >
          4
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('5')}
          aria-label="5"
        >
          5
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('6')}
          aria-label="6"
        >
          6
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={memoryStore}
          aria-label="메모리 저장"
        >
          MS
        </Button>
        
        {/* 여섯 번째 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('1')}
          aria-label="1"
        >
          1
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('2')}
          aria-label="2"
        >
          2
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('3')}
          aria-label="3"
        >
          3
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={memoryRecall}
          aria-label="메모리 불러오기"
        >
          MR
        </Button>
        
        {/* 마지막 행 */}
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={() => inputNumber('0')}
          aria-label="0"
        >
          0
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={inputDecimal}
          aria-label="소수점"
        >
          .
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={memoryAdd}
          aria-label="메모리 더하기"
        >
          M+
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs" 
          onClick={memoryClear}
          aria-label="메모리 삭제"
        >
          MC
        </Button>
      </div>

      {/* 추가 기능 */}
      {isEditMode && (
        <div className="mt-3 flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-6 text-xs"
            onClick={() => setState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
          >
            <History className="w-3 h-3 mr-1" />
            {state.showHistory ? '히스토리 숨기기' : '히스토리 보기'}
          </Button>
        </div>
      )}
    </div>
  );
};
