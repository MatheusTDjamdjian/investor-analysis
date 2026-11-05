// components/PriceHeader.jsx
// Painel principal: identidade do ativo, status da conexão, preço e variação.
// Anima sutilmente quando o preço sobe ou desce.

import { useEffect, useRef, useState } from 'react';
import { swatchColor } from '@/lib/categories';
import { convert, formatMoney, formatPct } from '@/lib/format';

export default function PriceHeader({ asset, category, ticker, currency, rate, status }) {
  const isCrypto = category.source === 'binance';
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(null);

  // Reseta o preço anterior sempre que o ativo muda — evita flash espúrio
  // ao trocar de BTC (US$ 100k) para ETH (US$ 4k), por exemplo.
  useEffect(() => {
    prevPrice.current = null;
    setFlash(null);
  }, [asset.symbol]);

  useEffect(() => {
    if (!ticker?.price) {
      prevPrice.current = null;
      return;
    }
    if (prevPrice.current != null && ticker.price !== prevPrice.current) {
      setFlash(ticker.price > prevPrice.current ? 'up' : 'down');
      const id = setTimeout(() => setFlash(null), 600);
      prevPrice.current = ticker.price;
      return () => clearTimeout(id);
    }
    prevPrice.current = ticker.price;
  }, [ticker?.price]);

  const price = convert(ticker?.price, rate, currency, category.quote);
  const change = ticker?.change;
  const isUp = (change ?? 0) >= 0;

  const lastQuote = ticker?.marketTime
    ? new Date(ticker.marketTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  const statusText = {
    live: `Ao vivo · ${category.sourceLabel}`,
    connecting: 'Conectando…',
    closed: `Mercado fechado · ${lastQuote}`,
    error: 'Erro de conexão',
  }[status];

  return (
    <section className="panel quote">
      <div className="quote-id">
        <div
          className="ticker-badge"
          style={{
            '--swatch': swatchColor(asset),
            fontSize: asset.base.length > 4 ? 11 : 13,
          }}
        >
          {asset.base}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="quote-title">{asset.name}</div>
          <div className="quote-meta">
            <span className="mono" style={{ color: 'var(--text-3)' }}>{category.pair(asset)}</span>
            <span style={{ color: 'var(--border-strong)' }}>│</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span className={`status-dot ${status}`} />
              {statusText}
            </span>
          </div>
        </div>
      </div>

      <div className={`quote-price ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}>
        <div className="quote-value">{price != null ? formatMoney(price, currency) : '—'}</div>
        <div className={`change-pill ${isUp ? 'up' : 'down'}`}>
          {isUp ? '▲' : '▼'} {formatPct(change)}
          <span className="muted">{isCrypto ? '24h' : 'hoje'}</span>
        </div>
      </div>
    </section>
  );
}
