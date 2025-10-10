import { useState } from 'react';
import { Calculator } from 'lucide-react';

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0');

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  const handleClick = (value: string) => {
    if (value === '=') {
      try {
        setDisplay(eval(display).toString());
      } catch {
        setDisplay('Error');
      }
    } else if (value === 'C') {
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? value : display + value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-100 p-3 rounded-lg text-right font-mono text-xl font-bold text-gray-800">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>
      <button
        onClick={() => setDisplay('0')}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
      >
        C
      </button>
    </div>
  );
}




