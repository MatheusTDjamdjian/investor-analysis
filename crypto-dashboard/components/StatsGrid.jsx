// components/StatsGrid.jsx
// Métricas 24h: máxima, mínima, volume, número de trades.

import { convert, formatCompact, formatMoney } from '@/lib/format';

export default function StatsGrid({ ticker, currency, rate }) {
  const items = [
    {
      label: 'Máxima 24h',
      value: ticker ? formatMoney(convert(ticker.high24h, rate, currency), currency) : '—',
      accent: 'var(--green)',
    },
    {
      label: 'Mínima 24h',
      value: ticker ? formatMoney(convert(ticker.low24h, rate, currency), currency) : '—',
      accent: 'var(--red)',
    },
    {
      label: 'Volume 24h',
      value: ticker ? formatCompact(ticker.volume) : '—',
      sub: ticker ? `${formatCompact(ticker.quoteVol)} USDT` : '—',
    },
    {
      label: 'Negociações 24h',
      value: ticker ? formatCompact(ticker.trades) : '—',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          className="glass"
          style={{
            padding: '16px 18px',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: it.accent || 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {it.value}
          </div>
          {it.sub && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {it.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
