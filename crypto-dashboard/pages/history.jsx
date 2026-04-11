// pages/history.jsx
// Página de histórico de sugestões.
// Lê do Zustand (persistido no localStorage) — sem chamada de API.
// Exibe as últimas 10 sugestões de todas as criptomoedas.

import Link from 'next/link';
import { useTradeStore } from '@/store/tradeStore';

const fmt = (n, d = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const STATUS_CONFIG = {
  pending:   { label: 'Pendente',  color: '#e8a232', bg: 'rgba(232,162,50,0.12)'  },
  executed:  { label: 'Executada', color: '#1db87a', bg: 'rgba(29,184,122,0.12)'  },
  cancelled: { label: 'Cancelada', color: '#e05252', bg: 'rgba(224,82,82,0.12)'   },
};

export default function HistoryPage() {
  const { history } = useTradeStore();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0f14',
      color: '#e8eaf0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Link href="/" style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 13,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#7a8099', textDecoration: 'none',
        }}>
          ← Dashboard
        </Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Histórico de sugestões</h1>
          <p style={{ fontSize: 13, color: '#7a8099', margin: '2px 0 0' }}>
            Últimas {history.length} sugestões · Todas as criptomoedas
          </p>
        </div>
      </div>

      {/* Lista */}
      {history.length === 0 ? (
        <div style={{
          background: '#13161e', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '40px',
          textAlign: 'center', color: '#7a8099', fontSize: 14,
        }}>
          Nenhuma sugestão registrada ainda.<br />
          <span style={{ fontSize: 12 }}>As sugestões aparecem aqui quando o motor de análise gera um sinal.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((h) => {
            const st  = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.pending;
            const isSell = h.side === 'SELL';
            const risk   = Math.abs(((h.sl - h.entry) / h.entry) * 100).toFixed(2);
            const reward = Math.abs(((h.tp - h.entry) / h.entry) * 100).toFixed(2);
            const date   = new Date(h.timestamp);

            return (
              <div key={h.id} style={{
                background: '#13161e',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '0 16px', alignItems: 'center',
              }}>
                {/* Lado esquerdo: par e tipo */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {h.symbol?.replace('USDT', '/USDT')}
                  </div>
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                    background: isSell ? 'rgba(224,82,82,0.15)' : 'rgba(29,184,122,0.15)',
                    color: isSell ? '#e05252' : '#1db87a',
                    border: `1px solid ${isSell ? 'rgba(224,82,82,0.3)' : 'rgba(29,184,122,0.3)'}`,
                  }}>
                    {isSell ? 'VENDA' : 'COMPRA'}
                  </span>
                </div>

                {/* Centro: parâmetros */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entrada</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#5a8fff' }}>${fmt(h.entry)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stop</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e05252' }}>${fmt(h.sl)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Take Profit</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1db87a' }}>${fmt(h.tp)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risco / Ret.</div>
                    <div style={{ fontSize: 13, color: '#e8a232' }}>{risk}% / {reward}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#7a8099', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</div>
                    <div style={{ fontSize: 12, color: '#b0b4c8' }}>
                      {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Direita: status */}
                <span style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: st.bg, color: st.color,
                  border: `1px solid ${st.color}40`,
                  whiteSpace: 'nowrap',
                }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}