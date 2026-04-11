// pages/index.jsx
// Dashboard principal.
// Integra: useCrypto (WebSocket), calcAllIndicators + generateSignal,
// OcoSuggestion, TradeModal, PriceChart, TechnicalAnalysis.

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCrypto }       from '@/hooks/useCrypto';
import { calcAllIndicators, generateSignal } from '@/lib/indicators';
import OcoSuggestion       from '@/components/OcoSuggestion';
import TradeModal          from '@/components/TradeModal';

const COINS  = ['BTCUSDT','ETHUSDT','SOLUSDT','AVAXUSDT','XRPUSDT'];
const LABELS = { BTCUSDT:'BTC', ETHUSDT:'ETH', SOLUSDT:'SOL', AVAXUSDT:'AVAX', XRPUSDT:'XRP' };

const fmt = (n, d = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtK = (n) => {
  if (n > 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n > 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n > 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n?.toFixed(2) ?? '—';
};

export default function Dashboard() {
  const [coin, setCoin] = useState('BTCUSDT');
  const [tf,   setTF]   = useState('15m');

  const { candles, ticker, status } = useCrypto(coin, tf);

  // Calcula indicadores e sinal
  const { indicators, signal } = useMemo(() => {
    if (candles.length < 50) return { indicators: null, signal: null };
    const ind = calcAllIndicators(candles);
    const sig = generateSignal(ind);
    return { indicators: ind, signal: sig };
  }, [candles]);

  const label = LABELS[coin] || coin.replace('USDT', '');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0f14',
      color: '#e8eaf0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      padding: '20px',
    }}>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#5a8fff', marginRight: 6 }}>◈ CryptoDesk</span>

        {/* Abas de moedas */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {COINS.map(c => (
            <button
              key={c}
              onClick={() => setCoin(c)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.12s',
                background: c === coin ? '#3b7eff' : '#13161e',
                border:     c === coin ? '1px solid #3b7eff' : '1px solid rgba(255,255,255,0.1)',
                color:      c === coin ? '#fff' : '#7a8099',
              }}
            >
              {LABELS[c]}
            </button>
          ))}
        </div>

        {/* Status ao vivo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#7a8099' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: status === 'live' ? '#1db87a' : '#e8a232',
            animation: status === 'live' ? 'none' : undefined,
          }} />
          {status === 'live' ? 'Ao vivo' : 'Conectando...'}
        </div>

        {/* Link para histórico */}
        <Link href="/history" style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 13,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#7a8099', textDecoration: 'none',
          transition: 'all 0.12s',
        }}>
          Histórico →
        </Link>
      </div>

      {/* ── Métricas 24h ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
        gap: 12, marginBottom: 16,
      }}>
        {[
          {
            label: 'Preço atual',
            val:   ticker ? '$' + fmt(ticker.price) : '—',
            sub:   ticker ? `${ticker.change >= 0 ? '+' : ''}${ticker.change?.toFixed(2)}%` : '—',
            subColor: ticker?.change >= 0 ? '#1db87a' : '#e05252',
          },
          {
            label: 'Volume 24h',
            val:   ticker ? fmtK(ticker.volume) : '—',
            sub:   'USDT',
          },
          {
            label: 'Máx / Mín',
            val:   ticker ? '$' + fmt(ticker.high24h) : '—',
            sub:   ticker ? '$' + fmt(ticker.low24h)  : '—',
            subColor: '#e05252',
          },
          {
            label: 'RSI (14)',
            val:   indicators?.rsi != null ? indicators.rsi.toFixed(1) : '—',
            sub:   indicators?.rsi > 70 ? 'Sobrecomprado' : indicators?.rsi < 30 ? 'Sobrevendido' : 'Neutro',
            subColor: indicators?.rsi > 70 ? '#e05252' : indicators?.rsi < 30 ? '#1db87a' : '#7a8099',
          },
        ].map(({ label, val, sub, subColor }) => (
          <div key={label} style={{
            background: '#13161e', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
            {sub && <div style={{ fontSize: 12, marginTop: 3, color: subColor || '#7a8099' }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Timeframes ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['1m','5m','15m','1h','4h','1d'].map(t => (
          <button
            key={t}
            onClick={() => setTF(t)}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12,
              cursor: 'pointer',
              background: t === tf ? '#3b7eff' : 'transparent',
              border: t === tf ? '1px solid #3b7eff' : '1px solid rgba(255,255,255,0.1)',
              color: t === tf ? '#fff' : '#7a8099',
            }}
          >
            {t}
          </button>
        ))}
        <span style={{ fontSize: 11, color: '#7a8099', marginLeft: 8, lineHeight: '28px' }}>
          {label}/USDT · {candles.length} candles carregados
        </span>
      </div>

      {/* ── Painel inferior: Análise + OCO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Análise técnica */}
        <div style={{
          background: '#13161e', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontSize: 11, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Análise técnica
          </div>

          {signal && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                background: signal.signal === 'SELL' ? 'rgba(224,82,82,0.15)' :
                            signal.signal === 'BUY'  ? 'rgba(29,184,122,0.15)' : '#1a1e2a',
                color:      signal.signal === 'SELL' ? '#e05252' :
                            signal.signal === 'BUY'  ? '#1db87a' : '#7a8099',
                border: `1px solid ${signal.signal === 'SELL' ? 'rgba(224,82,82,0.3)' :
                                     signal.signal === 'BUY'  ? 'rgba(29,184,122,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}>
                {signal.signal === 'SELL' ? `Sinal de VENDA (${signal.sellCount}/6)` :
                 signal.signal === 'BUY'  ? `Sinal de COMPRA (${signal.buyCount}/6)` : 'Mercado neutro'}
              </span>
            </div>
          )}

          {indicators && [
            { name: 'RSI (14)',       val: indicators.rsi?.toFixed(1),
              sig: indicators.rsi > 70 ? 'sell' : indicators.rsi < 30 ? 'buy' : 'neutral' },
            { name: 'MACD',          val: indicators.macd?.histogram?.toFixed(4),
              sig: indicators.macd?.histogram < 0 ? 'sell' : indicators.macd?.histogram > 0 ? 'buy' : 'neutral' },
            { name: 'EMA 9 / 21',    val: `$${fmt(indicators.ema?.e9)} / $${fmt(indicators.ema?.e21)}`,
              sig: indicators.ema?.e9 < indicators.ema?.e21 ? 'sell' : 'buy' },
            { name: 'Bollinger %B',  val: (indicators.bb?.percentB * 100)?.toFixed(0) + '%',
              sig: indicators.bb?.percentB > 0.85 ? 'sell' : indicators.bb?.percentB < 0.15 ? 'buy' : 'neutral' },
            { name: 'Estocástico K', val: indicators.stoch?.k?.toFixed(1),
              sig: indicators.stoch?.k > 80 ? 'sell' : indicators.stoch?.k < 20 ? 'buy' : 'neutral' },
            { name: 'Volume',        val: `${indicators.volume?.ratio?.toFixed(1)}x média`,
              sig: indicators.volume?.isHigh ? 'buy' : 'neutral' },
          ].map(({ name, val, sig }) => (
            <div key={name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13,
            }}>
              <span style={{ color: '#7a8099' }}>{name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#7a8099' }}>{val}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: sig === 'sell' ? 'rgba(224,82,82,0.15)' :
                              sig === 'buy'  ? 'rgba(29,184,122,0.15)' : '#1a1e2a',
                  color:      sig === 'sell' ? '#e05252' :
                              sig === 'buy'  ? '#1db87a' : '#7a8099',
                }}>
                  {sig === 'sell' ? 'Venda' : sig === 'buy' ? 'Compra' : 'Neutro'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sugestão OCO */}
        <OcoSuggestion
          signal={signal}
          symbol={coin}
          price={ticker?.price ?? indicators?.price}
          indicators={indicators}
        />
      </div>

      {/* Modal global */}
      <TradeModal />
    </div>
  );
}