// hooks/useCrypto.js
// Hook que mantém conexão WebSocket com a Binance e retorna:
//   - candles: array de candles para análise técnica
//   - ticker:  dados 24h (preço, variação, vol, max, min)
//   - status:  'connecting' | 'live' | 'error'
//
// Reconecta automaticamente em caso de queda.

import { useState, useEffect, useRef, useCallback } from 'react';

const BINANCE_WS  = 'wss://stream.binance.com:9443/stream';
const BINANCE_API = 'https://api.binance.com';

export function useCrypto(symbol = 'BTCUSDT', interval = '15m') {
  const [candles, setCandles]   = useState([]);
  const [ticker,  setTicker]    = useState(null);
  const [status,  setStatus]    = useState('connecting');
  const ws = useRef(null);
  const reconnectTimer = useRef(null);

  // Carrega histórico via REST
  const loadHistory = useCallback(async () => {
    try {
      const url = `${BINANCE_API}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`;
      const res  = await fetch(url);
      const data = await res.json();
      const parsed = data.map(k => ({
        t:     k[0],
        open:  parseFloat(k[1]),
        high:  parseFloat(k[2]),
        low:   parseFloat(k[3]),
        close: parseFloat(k[4]),
        vol:   parseFloat(k[5]),
      }));
      setCandles(parsed);
    } catch (e) {
      console.error('[useCrypto] loadHistory:', e);
    }
  }, [symbol, interval]);

  // Conecta WebSocket
  const connect = useCallback(() => {
    if (ws.current) ws.current.close();

    const ticker_s = `${symbol.toLowerCase()}@ticker`;
    const kline_s  = `${symbol.toLowerCase()}@kline_${interval}`;
    const url = `${BINANCE_WS}?streams=${ticker_s}/${kline_s}`;

    ws.current = new WebSocket(url);
    setStatus('connecting');

    ws.current.onopen = () => setStatus('live');

    ws.current.onclose = () => {
      setStatus('connecting');
      // Reconecta após 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = () => setStatus('error');

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (!msg.data) return;

      // Ticker: atualiza métricas 24h
      if (msg.stream?.includes('@ticker')) {
        const d = msg.data;
        setTicker({
          price:    parseFloat(d.c),
          change:   parseFloat(d.P),
          volume:   parseFloat(d.v),
          high24h:  parseFloat(d.h),
          low24h:   parseFloat(d.l),
          quoteVol: parseFloat(d.q),
        });
      }

      // Kline: atualiza candle ao vivo
      if (msg.stream?.includes('@kline')) {
        const k  = msg.data.k;
        const pt = {
          t:     k.t,
          open:  parseFloat(k.o),
          high:  parseFloat(k.h),
          low:   parseFloat(k.l),
          close: parseFloat(k.c),
          vol:   parseFloat(k.v),
        };
        setCandles(prev => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          if (last.t === pt.t) {
            return [...prev.slice(0, -1), pt];
          }
          const next = [...prev, pt];
          return next.length > 300 ? next.slice(-300) : next;
        });
      }
    };
  }, [symbol, interval]);

  useEffect(() => {
    loadHistory().then(() => connect());
    return () => {
      if (ws.current)         ws.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [loadHistory, connect]);

  return { candles, ticker, status };
}