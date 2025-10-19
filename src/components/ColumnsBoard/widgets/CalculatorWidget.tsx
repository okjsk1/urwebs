import { useState } from 'react';
import { Calculator as CalculatorIcon, RotateCcw } from 'lucide-react';

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const handlePlusMinus = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: '±', onClick: handlePlusMinus, className: 'bg-gray-300 hover:bg-gray-400' },
    { label: '%', onClick: handlePercentage, className: 'bg-gray-300 hover:bg-gray-400' },
    { label: '÷', onClick: () => performOperation('÷'), className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '7', onClick: () => inputNumber('7'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '8', onClick: () => inputNumber('8'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '9', onClick: () => inputNumber('9'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '×', onClick: () => performOperation('×'), className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '4', onClick: () => inputNumber('4'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '5', onClick: () => inputNumber('5'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '6', onClick: () => inputNumber('6'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '-', onClick: () => performOperation('-'), className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '1', onClick: () => inputNumber('1'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '2', onClick: () => inputNumber('2'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '3', onClick: () => inputNumber('3'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '+', onClick: () => performOperation('+'), className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '0', onClick: () => inputNumber('0'), className: 'bg-gray-200 hover:bg-gray-300 col-span-2' },
    { label: '.', onClick: inputDecimal, className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '=', onClick: handleEquals, className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <CalculatorIcon className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">계산기</span>
      </div>

      {/* 디스플레이 */}
      <div className="bg-black text-white p-4 rounded-lg mb-3 text-right">
        <div className="text-2xl font-mono overflow-hidden">
          {display.length > 10 ? parseFloat(display).toExponential(3) : display}
        </div>
      </div>

      {/* 버튼 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`p-3 rounded-lg font-medium transition-colors ${button.className}`}
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* 리셋 버튼 */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={clear}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          초기화
        </button>
      </div>
    </div>
  );
}
