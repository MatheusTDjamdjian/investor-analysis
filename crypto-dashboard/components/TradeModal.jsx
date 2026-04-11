// components/TradeModal.jsx
// Modal de confirmação da operação OCO.
// Exibe: par, tipo, entrada, stop loss, take profit, risco/retorno.
// Ao confirmar: POST para /api/execute-trade e atualiza histórico (Zustand).

import { useState } from 'react';
import { useTradeStore } from '@/store/tradeStore';

const fmt = (n, d = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-US', {
    minimumFractionDigits: d, maximumFractionDigits: d,
  });

export default function TradeModal() {
  const { modal, closeModal, addToHistory, updateStatus, setExecuting } = useTradeStore();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const [success, setSuccess]   = useState(null);

  if (!modal) return null;

  const { symbol, side, entry, sl, tp, qty, reasons, strength } = modal;

  const risk   = Math.abs(((sl - entry) / entry) * 100).toFixed(2);
  const reward = Math.abs(((tp - entry) / entry) * 100).toFixed(2);
  const rr     = (reward / risk).toFixed(2);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    // Adiciona ao histórico local como "pending"
    const histId = addToHistory({ symbol, side, entry, sl, tp, qty, reasons, strength });

    try {
      const res = await fetch('/api/execute-trade', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side,
          quantity:   qty,
          entry,
          stopLoss:   sl,
          takeProfit: tp,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

      // Atualiza status no histórico
      updateStatus(histId, 'executed');
      setSuccess(`Ordem executada! ID: ${data.orderId}`);
    } catch (err) {
      updateStatus(histId, 'cancelled');
      setError(err.message);
    } finally {
      setLoading(false);
      setExecuting(false);
    }
  };

  const handleCancel = () => {
    closeModal();
    setError(null);
    setSuccess(null);
  };

  return (
    /* Overlay */
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      {/* Modal */}
      <div style={{
        background: '#13161e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '440px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: side === 'SELL' ? 'rgba(224,82,82,0.15)' : 'rgba(29,184,122,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {side === 'SELL' ? '↓' : '↑'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              Confirmar {side === 'SELL' ? 'Venda' : 'Compra'} — {symbol.replace('USDT', '/USDT')}
            </div>
            <div style={{ fontSize: 12, color: '#7a8099' }}>Ordem OCO</div>
          </div>
          <button
            onClick={handleCancel}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#7a8099', cursor: 'pointer', fontSize: 18, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Parâmetros */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 16,
        }}>
          {[
            { label: 'Entrada',     value: '$' + fmt(entry), color: '#5a8fff' },
            { label: 'Quantidade',  value: qty,              color: '#e8eaf0' },
            { label: 'Stop Loss',   value: '$' + fmt(sl),    color: '#e05252' },
            { label: 'Take Profit', value: '$' + fmt(tp),    color: '#1db87a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#1a1e2a', borderRadius: 10,
              padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 10, color: '#7a8099', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Risco / Retorno */}
        <div style={{
          display: 'flex', gap: 14,
          background: '#1a1e2a', borderRadius: 10, padding: '10px 14px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 16, fontSize: 13, color: '#7a8099',
        }}>
          <span>Risco: <strong style={{ color: '#e05252' }}>{risk}%</strong></span>
          <span>Retorno: <strong style={{ color: '#1db87a' }}>{reward}%</strong></span>
          <span style={{ marginLeft: 'auto' }}>R/R: <strong style={{ color: '#e8a232' }}>1:{rr}</strong></span>
        </div>

        {/* Razões do sinal */}
        {reasons?.length > 0 && (
          <div style={{
            background: '#1a1e2a', borderRadius: 10, padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: '#7a8099', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sinais detectados
            </div>
            {reasons.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: '#b0b4c8', marginBottom: 3, display: 'flex', gap: 6 }}>
                <span style={{ color: side === 'SELL' ? '#e05252' : '#1db87a' }}>•</span> {r}
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={{
            background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#e05252',
          }}>
            {error}
          </div>
        )}

        {/* Sucesso */}
        {success && (
          <div style={{
            background: 'rgba(29,184,122,0.1)', border: '1px solid rgba(29,184,122,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#1db87a',
          }}>
            {success}
          </div>
        )}

        {/* Botões */}
        {!success ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                flex: 1, padding: '11px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#7a8099',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: '11px',
                background: loading ? 'rgba(59,126,255,0.3)' : '#3b7eff',
                border: 'none',
                borderRadius: 10, color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600,
              }}
            >
              {loading ? 'Executando...' : 'Confirmar operação'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCancel}
            style={{
              width: '100%', padding: '11px',
              background: '#1db87a', border: 'none',
              borderRadius: 10, color: '#fff',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}