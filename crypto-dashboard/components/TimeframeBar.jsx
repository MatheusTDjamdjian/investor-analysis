// components/TimeframeBar.jsx
// Pílulas de timeframe (1m, 5m, 15m, 1h, 4h, 1d).

import { TIMEFRAMES } from '@/lib/coins';

export default function TimeframeBar({ active, onSelect }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: 'rgba(20,24,34,0.55)',
        border: '1px solid var(--border-soft)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {TIMEFRAMES.map((tf) => {
        const isActive = tf.value === active;
        return (
          <button
            key={tf.value}
            onClick={() => onSelect(tf.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
              background: isActive
                ? 'linear-gradient(120deg, rgba(110,140,255,0.25), rgba(180,120,255,0.2))'
                : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              transition: 'all 140ms',
            }}
          >
            {tf.label}
          </button>
        );
      })}
    </div>
  );
}
