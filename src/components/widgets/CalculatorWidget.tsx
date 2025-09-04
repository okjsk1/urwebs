import React, { useState } from 'react';

interface CalculatorWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

export function CalculatorWidget({ id, onRemove }: CalculatorWidgetProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
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

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const Button = ({ onClick, className = '', children }: any) => (
    <button
      onClick={onClick}
      className={`h-8 rounded text-xs font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border h-full relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-800">🔢 계산기</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {/* 디스플레이 */}
        <div className="bg-gray-100 p-2 rounded text-right font-mono text-sm">
          {display.length > 10 ? display.slice(0, 10) + '...' : display}
        </div>

        {/* 버튼 그리드 */}
        <div className="grid grid-cols-4 gap-1">
          <Button
            onClick={clear}
            className="bg-red-500 text-white hover:bg-red-600 col-span-2"
          >
            Clear
          </Button>
          <Button
            onClick={() => inputOperation('/')}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            ÷
          </Button>
          <Button
            onClick={() => inputOperation('*')}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            ×
          </Button>

          <Button
            onClick={() => inputNumber('7')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            7
          </Button>
          <Button
            onClick={() => inputNumber('8')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            8
          </Button>
          <Button
            onClick={() => inputNumber('9')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            9
          </Button>
          <Button
            onClick={() => inputOperation('-')}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            -
          </Button>

          <Button
            onClick={() => inputNumber('4')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            4
          </Button>
          <Button
            onClick={() => inputNumber('5')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            5
          </Button>
          <Button
            onClick={() => inputNumber('6')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            6
          </Button>
          <Button
            onClick={() => inputOperation('+')}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            +
          </Button>

          <Button
            onClick={() => inputNumber('1')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            1
          </Button>
          <Button
            onClick={() => inputNumber('2')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            2
          </Button>
          <Button
            onClick={() => inputNumber('3')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            3
          </Button>
          <Button
            onClick={performCalculation}
            className="bg-blue-500 text-white hover:bg-blue-600 row-span-2"
          >
            =
          </Button>

          <Button
            onClick={() => inputNumber('0')}
            className="bg-gray-200 hover:bg-gray-300 col-span-2"
          >
            0
          </Button>
          <Button
            onClick={() => inputNumber('.')}
            className="bg-gray-200 hover:bg-gray-300"
          >
            .
          </Button>
        </div>
      </div>
    </div>
  );
}