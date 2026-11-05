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
          { label: 'Máxima 24h', value: money(ticker?.high24h), accent: 'var(--up)' },
          { label: 'Mínima 24h', value: money(ticker?.low24h), accent: 'var(--down)' },
          {
            label: 'Volume 24h',
            value: ticker ? formatCompact(ticker.volume) : '—',
            sub: ticker ? `${formatCompact(ticker.quoteVol)} USDT` : '—',
          },
          { label: 'Negociações 24h', value: ticker ? formatCompact(ticker.trades) : '—' },
        ]
      : [
          { label: 'Máxima do dia', value: money(ticker?.high24h), accent: 'var(--up)' },
          { label: 'Mínima do dia', value: money(ticker?.low24h), accent: 'var(--down)' },
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
    <section className="panel stats">
      {items.map((it) => (
        <div key={it.label} className="stat">
          <span className="label">{it.label}</span>
          <span className="stat-value" style={{ color: it.accent || 'var(--text)' }}>
            {it.value}
          </span>
          {it.sub && <span className="stat-sub">{it.sub}</span>}
        </div>
      ))}
    </section>
  );
}
