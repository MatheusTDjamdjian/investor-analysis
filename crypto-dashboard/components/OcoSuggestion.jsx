// components/OcoSuggestion.jsx
// Exibe a sugestão de operação OCO gerada pelo motor de análise técnica.
// Botão "Realizar" → abre modal de confirmação (useTradeStore).

import { useTradeStore } from '@/store/tradeStore';

const fmt = (n, d = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-US', {
    minimumFractionDigits: d, maximumFractionDigits: d,
  });

export default function OcoSuggestion({ signal, symbol, price, indicators }) {
  const { openModal } = useTradeStore();

  // Sem sinal forte → sem sugestão
  if (!signal || signal.signal === 'HOLD') {
    return (
      <div style={{
        background: '#13161e', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: 16,
      }}>
        <div style={{ fontSize: 11, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Sugestão OCO
        </div>
        <div style={{ color: '#7a8099', fontSize: 13, textAlign: 'center', padding: '20px 0', lineHeight: 1.8 }}>
          Mercado neutro<br />
          <span style={{ fontSize: 11 }}>
            {signal?.sellCount ?? 0} sinais vendedores · {signal?.buyCount ?? 0} sinais compradores
          </span>
        </div>
      </div>
    );
  }

  const isSell  = signal.signal === 'SELL';
  const entry   = price;
  const sl      = isSell ? +(entry * 1.025).toFixed(2)  : +(entry * 0.975).toFixed(2);
  const tp      = isSell ? +(entry * 0.955).toFixed(2)  : +(entry * 1.045).toFixed(2);
  const risk    = Math.abs(((sl - entry) / entry) * 100).toFixed(2);
  const reward  = Math.abs(((tp - entry) / entry) * 100).toFixed(2);
  const rr      = (reward / risk).toFixed(2);
  const qty     = 0.001; // usuário deve ajustar conforme seu capital

  const accentColor = isSell ? '#e05252' : '#1db87a';
  const bgAccent    = isSell ? 'rgba(224,82,82,0.1)' : 'rgba(29,184,122,0.1)';
  const borderAccent = isSell ? 'rgba(224,82,82,0.25)' : 'rgba(29,184,122,0.25)';

  return (
    <div style={{
      background: '#13161e',
      border: `1px solid ${borderAccent}`,
      borderRadius: 14, padding: 16,
    }}>
      {/* Header */}
      <div style={{ fontSize: 11, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        Sugestão OCO
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 6,
          background: bgAccent, color: accentColor,
          fontSize: 12, fontWeight: 700,
          border: `1px solid ${borderAccent}`,
        }}>
          {isSell ? 'OCO SHORT' : 'OCO LONG'}
        </span>

        {/* Barra de força do sinal */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 3 }}>
            Força: {(signal.strength * 100).toFixed(0)}%
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${(signal.strength * 100).toFixed(0)}%`,
              background: accentColor, transition: 'width 0.4s',
            }} />
          </div>
        </div>
      </div>

      {/* Grid de parâmetros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Entrada',     value: '$' + fmt(entry), color: '#5a8fff' },
          { label: 'Stop Loss',   value: '$' + fmt(sl),    color: '#e05252' },
          { label: 'Take Profit', value: '$' + fmt(tp),    color: '#1db87a' },
          { label: 'R/R',         value: `1 : ${rr}`,      color: '#e8a232' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1a1e2a', borderRadius: 8,
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 10, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Risco / Retorno inline */}
      <div style={{ fontSize: 12, color: '#7a8099', marginBottom: 14, display: 'flex', gap: 14 }}>
        <span>Risco: <strong style={{ color: '#e05252' }}>{risk}%</strong></span>
        <span>Retorno: <strong style={{ color: '#1db87a' }}>{reward}%</strong></span>
        <span style={{ marginLeft: 'auto' }}>{signal.sellCount + signal.buyCount} sinais</span>
      </div>

      {/* Botão Realizar */}
      <button
        onClick={() => openModal({
          symbol, side: signal.signal,
          entry, sl, tp,
          qty,
          reasons:  signal.reasons,
          strength: signal.strength,
        })}
        style={{
          width: '100%', padding: '11px',
          background: accentColor,
          border: 'none', borderRadius: 10,
          color: '#fff', cursor: 'pointer',
          fontSize: 14, fontWeight: 700,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.target.style.opacity = '0.85'}
        onMouseLeave={e => e.target.style.opacity = '1'}
      >
        Realizar operação
      </button>
    </div>
  );
}