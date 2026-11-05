// components/TimeframeBar.jsx
// Seletor de timeframe (1m, 5m, 15m, 1h, 4h, 1d).

import { TIMEFRAMES } from '@/lib/coins';

export default function TimeframeBar({ active, onSelect }) {
  return (
    <div className="segmented mono-buttons" role="group" aria-label="Timeframe">
      {TIMEFRAMES.map((tf) => (
        <button key={tf.value} aria-pressed={tf.value === active} onClick={() => onSelect(tf.value)}>
          {tf.label}
        </button>
      ))}
    </div>
  );
}
