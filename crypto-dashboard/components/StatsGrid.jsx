// components/StatsGrid.jsx
// Métricas do ativo:
//   - cripto: máxima, mínima, volume e nº de negociações (janela de 24h)
//   - ações:  máxima, mínima, volume do pregão e fechamento anterior

import { convert, formatCompact, formatMoney } from '@/lib/format';

export default function StatsGrid({ ticker, category, currency, rate }) {
  const money = (v) =>
    ticker ? formatMoney(convert(v, rate, currency, category.quote), currency) : '—';

  const items =
    category.source === 'binance'
      ? [
          { label: 'Máxima 24h', value: money(ticker?.high24h), accent: 'var(--green)' },
          { label: 'Mínima 24h', value: money(ticker?.low24h), accent: 'var(--red)' },
          {
            label: 'Volume 24h',
            value: ticker ? formatCompact(ticker.volume) : '—',
            sub: ticker ? `${formatCompact(ticker.quoteVol)} USDT` : '—',
          },
          { label: 'Negociações 24h', value: ticker ? formatCompact(ticker.trades) : '—' },
        ]
      : [
          { label: 'Máxima do dia', value: money(ticker?.high24h), accent: 'var(--green)' },
          { label: 'Mínima do dia', value: money(ticker?.low24h), accent: 'var(--red)' },
          {
            label: 'Volume do dia',
            value: ticker ? `${formatCompact(ticker.volume)} ações` : '—',
          },
          {
            label: 'Fechamento anterior',
            value: money(ticker?.prevClose),
            sub: ticker
              ? `52 sem.: ${money(ticker.fiftyTwoWeekLow)} – ${money(ticker.fiftyTwoWeekHigh)}`
              : undefined,
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
