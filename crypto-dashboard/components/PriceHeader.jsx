// components/PriceHeader.jsx
// Cabeçalho principal: nome do ativo, preço em destaque, variação 24h.
// Anima sutilmente quando o preço sobe ou desce.

import { useEffect, useRef, useState } from 'react';
import { convert, formatMoney, formatPct } from '@/lib/format';

export default function PriceHeader({ coin, ticker, currency, rate, status }) {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(null);

  // Reseta o preço anterior sempre que a cripto muda — evita flash espúrio
  // ao trocar de BTC (US$ 100k) para ETH (US$ 4k), por exemplo.
  useEffect(() => {
    prevPrice.current = null;
    setFlash(null);
  }, [coin.symbol]);

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

  const price = convert(ticker?.price, rate, currency);
  const change = ticker?.change;
  const isUp = (change ?? 0) >= 0;

  const dotColor = {
    live: 'var(--green)',
    connecting: '#e8a232',
    error: 'var(--red)',
  }[status] || 'var(--text-muted)';

  return (
    <div
      className="glass"
      style={{
        padding: '24px 28px',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      {/* Identidade do ativo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${coin.gradient[0]}, ${coin.gradient[1]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
            letterSpacing: 0.5,
            boxShadow: `0 10px 32px -12px ${coin.gradient[0]}80`,
          }}
        >
          {coin.base}
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {coin.name} · {coin.base}/USDT
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 2,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: dotColor,
                animation: status === 'live' ? 'pulse-dot 1.6s infinite ease-in-out' : 'none',
                boxShadow: status === 'live' ? '0 0 12px var(--green)' : 'none',
              }}
            />
            {status === 'live' && 'Ao vivo · Binance'}
            {status === 'connecting' && 'Conectando…'}
            {status === 'error' && 'Erro de conexão'}
          </div>
        </div>
      </div>

      {/* Preço */}
      <div
        className={flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}
        style={{
          textAlign: 'right',
          padding: '4px 12px',
          borderRadius: 12,
          transition: 'background 200ms',
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.05,
            fontVariantNumeric: 'tabular-nums',
          }}
          className="gradient-text"
        >
          {price != null ? formatMoney(price, currency) : '—'}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            color: isUp ? 'var(--green)' : 'var(--red)',
            background: isUp ? 'rgba(31,208,135,0.12)' : 'rgba(255,93,93,0.12)',
            border: `1px solid ${isUp ? 'rgba(31,208,135,0.3)' : 'rgba(255,93,93,0.3)'}`,
          }}
        >
          <span style={{ fontSize: 11 }}>{isUp ? '▲' : '▼'}</span>
          {formatPct(change)}
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>24h</span>
        </div>
      </div>
    </div>
  );
}
