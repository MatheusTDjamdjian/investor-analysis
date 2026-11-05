// hooks/useStock.js
// Dados de ações via proxy /api/yahoo/chart. Mesma interface do useCrypto:
//   - candles: array OHLCV para o gráfico
//   - ticker:  preço, variação do dia, máx/mín, volume, fechamento anterior
//   - status:  'connecting' | 'live' | 'closed' | 'error'
//
// Não existe WebSocket público e gratuito para ações, então o "tempo real"
// é feito por polling: a cada 5s com o pregão aberto (janela curta, só os
// candles recentes são mesclados) e a cada 30s com o mercado fechado.
// Passar symbol = null desliga o hook (usado quando a categoria ativa é cripto).

import { useEffect, useState } from 'react';

const ENDPOINT = '/api/yahoo/chart';
const POLL_OPEN_MS = 5000;
const POLL_CLOSED_MS = 30000;
const POLL_ERROR_MS = 10000;
const MAX_CANDLES = 500;
const EMPTY = [];

// Substitui candles com o mesmo timestamp e acrescenta os novos.
function mergeCandles(prev, fresh) {
  if (!prev.length) return fresh;
  if (!fresh.length) return prev;
  const firstFresh = fresh[0].t;
  const kept = prev.filter((c) => c.t < firstFresh);
  const next = [...kept, ...fresh];
  return next.length > MAX_CANDLES ? next.slice(-MAX_CANDLES) : next;
}

export function useStock(symbol, interval = '15m') {
  const key = symbol ? `${symbol}|${interval}` : null;
  const [state, setState] = useState({ key: null, candles: EMPTY, ticker: null, status: 'connecting' });

  useEffect(() => {
    if (!symbol) return undefined;
    const session = { active: true };
    let timer = null;
    let hasHistory = false;

    const load = async () => {
      const live = hasHistory;
      const url = `${ENDPOINT}?symbol=${encodeURIComponent(symbol)}&interval=${interval}${live ? '&live=1' : ''}`;
      try {
        const res = await fetch(url);
        if (!session.active) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!session.active || data?.symbol !== symbol) return null;

        hasHistory = true;
        setState((prev) => ({
          key,
          candles: live && prev.key === key ? mergeCandles(prev.candles, data.candles) : data.candles,
          ticker: data.ticker,
          status: data.ticker.marketOpen ? 'live' : 'closed',
        }));
        return data.ticker.marketOpen ? POLL_OPEN_MS : POLL_CLOSED_MS;
      } catch (e) {
        if (!session.active) return null;
        console.warn('[useStock]', e.message);
        setState((prev) =>
          prev.key === key
            ? { ...prev, status: 'error' }
            : { key, candles: EMPTY, ticker: null, status: 'error' },
        );
        return POLL_ERROR_MS;
      }
    };

    const loop = async () => {
      const delay = await load();
      if (session.active && delay) timer = setTimeout(loop, delay);
    };
    loop();

    return () => {
      session.active = false;
      if (timer) clearTimeout(timer);
    };
  }, [symbol, interval, key]);

  // Enquanto o primeiro fetch do novo ativo não chega, não expõe dados do anterior.
  if (!key || state.key !== key) {
    return { candles: EMPTY, ticker: null, status: 'connecting' };
  }
  return state;
}
