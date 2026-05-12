// components/CryptoSelector.jsx
// Lista horizontal de criptoativos selecionáveis.

import { COINS } from '@/lib/coins';

export default function CryptoSelector({ active, onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '4px 2px',
      }}
    >
      {COINS.map((coin) => {
        const isActive = coin.symbol === active;
        return (
          <button
            key={coin.symbol}
            onClick={() => onSelect(coin.symbol)}
            style={{
              flex: '0 0 auto',
              minWidth: 96,
              padding: '10px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              border: `1px solid ${isActive ? 'rgba(110,140,255,0.5)' : 'var(--border-soft)'}`,
              background: isActive
                ? 'linear-gradient(135deg, rgba(110,140,255,0.22), rgba(180,120,255,0.18))'
                : 'rgba(20,24,34,0.55)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'all 160ms ease',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: isActive
                ? '0 8px 24px -10px rgba(110,140,255,0.45)'
                : 'none',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.3,
                background: isActive
                  ? `linear-gradient(120deg, ${coin.gradient[0]}, ${coin.gradient[1]})`
                  : 'transparent',
                WebkitBackgroundClip: isActive ? 'text' : 'unset',
                backgroundClip: isActive ? 'text' : 'unset',
                WebkitTextFillColor: isActive ? 'transparent' : 'inherit',
              }}
            >
              {coin.base}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {coin.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
