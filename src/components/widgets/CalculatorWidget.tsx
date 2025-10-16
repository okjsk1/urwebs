import React, { useState } from 'react';

type Props = {
  widget?: any;
  isEditMode?: boolean;
  updateWidget?: (id: string, next: any) => void;
};

export const CalculatorWidget: React.FC<Props> = () => {
  const [display, setDisplay] = useState<string>('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<'+' | '-' | '×' | '÷' | null>(null);
  const [fresh, setFresh] = useState<boolean>(true);

  const input = (val: string) => {
    setDisplay(prevDisplay => {
      if (fresh || prevDisplay === '0') {
        setFresh(false);
        return val;
      }
      return prevDisplay + val;
    });
  };

  const clear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const choose = (nextOp: '+' | '-' | '×' | '÷') => {
    const current = Number(display);
    if (prev === null) {
      setPrev(current);
    } else if (op) {
      setPrev(calc(prev, current, op));
    }
    setOp(nextOp);
    setFresh(true);
  };

  const equals = () => {
    if (prev === null || !op) return;
    const current = Number(display);
    const result = calc(prev, current, op);
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const calc = (a: number, b: number, oper: '+' | '-' | '×' | '÷') => {
    switch (oper) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', 'C', '=', '+']
  ];

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="bg-gray-900 text-white rounded-lg p-2 text-right font-mono text-lg mb-2 select-none">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((b, idx) => (
          <button
            key={idx}
            className={`h-9 rounded text-sm ${['÷', '×', '-', '+', '='].includes(b) ? 'bg-blue-600 text-white hover:bg-blue-700' : b === 'C' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => {
              if (/^[0-9]$/.test(b)) return input(b);
              if (b === 'C') return clear();
              if (b === '=') return equals();
              return choose(b as any);
            }}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
};


