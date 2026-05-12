// hooks/useCrypto.js
// Mantém conexão com a Binance e expõe:
//   - candles: array de candles (OHLCV) para o gráfico
//   - ticker:  dados 24h (preço, variação, volume, máx, mín)
//   - status:  'connecting' | 'live' | 'error'
//
// Estratégia de resiliência:
//   - REST /klines e /ticker/24hr são chamados via PROXY do próprio Next
//     (/api/binance/*). Isso contorna AdBlockers/Brave Shield que bloqueiam
//     api.binance.com no navegador — o cliente só conversa com localhost.
//   - Ticker REST inicial + polling a cada 4s (silencioso quando WS entrega
//     mensagens frescas). Garante que os valores apareçam mesmo se o WS
//     falhar por completo.
//   - WebSocket conecta direto em stream.binance.com (não pode ser
//     proxiado pelo Next sem adapter). Se for bloqueado, o polling REST
//     mantém o app funcional, só sem updates de ~1s.
//   - Uma session token local ao useEffect descarta callbacks em flight
//     quando o símbolo/intervalo muda.

import { useEffect, useState } from 'react';

const BINANCE_WS = 'wss://stream.binance.com:9443/stream';
const KLINES_PROXY = '/api/binance/klines';
const TICKER_PROXY = '/api/binance/ticker';
const TICKER_POLL_MS = 4000;
const WS_FRESHNESS_MS = 6000;

export function useCrypto(symbol = 'BTCUSDT', interval = '15m') {
  const [candles, setCandles] = useState([]);
  const [ticker, setTicker] = useState(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const session = { active: true };
    const expectedPrefix = `${symbol.toLowerCase()}@`;

    let ws = null;
    let reconnectTimer = null;
    let pollTimer = null;
    let lastWsTickerAt = 0;

    // Estado limpo imediatamente — evita renderizar dados da cripto anterior
    setCandles([]);
    setTicker(null);
    setStatus('connecting');

    // ── parsers ──────────────────────────────────────────────────────────
    const parseCandle = (k) => ({
      t: k[0] ?? k.t,
      open: parseFloat(k[1] ?? k.o),
      high: parseFloat(k[2] ?? k.h),
      low: parseFloat(k[3] ?? k.l),
      close: parseFloat(k[4] ?? k.c),
      vol: parseFloat(k[5] ?? k.v),
    });

    const parseTickerRest = (d) => ({
      price: parseFloat(d.lastPrice),
      change: parseFloat(d.priceChangePercent),
      changeAbs: parseFloat(d.priceChange),
      volume: parseFloat(d.volume),
      quoteVol: parseFloat(d.quoteVolume),
      high24h: parseFloat(d.highPrice),
      low24h: parseFloat(d.lowPrice),
      open24h: parseFloat(d.openPrice),
      trades: parseInt(d.count, 10),
    });

    const parseTickerWs = (d) => ({
      price: parseFloat(d.c),
      change: parseFloat(d.P),
      changeAbs: parseFloat(d.p),
      volume: parseFloat(d.v),
      quoteVol: parseFloat(d.q),
      high24h: parseFloat(d.h),
      low24h: parseFloat(d.l),
      open24h: parseFloat(d.o),
      trades: parseInt(d.n, 10),
    });

    // ── REST loaders ─────────────────────────────────────────────────────
    const loadHistory = async () => {
      try {
        const url = `${KLINES_PROXY}?symbol=${symbol}&interval=${interval}&limit=300`;
        const res = await fetch(url);
        if (!session.active || !res.ok) return;
        const data = await res.json();
        if (!session.active || !Array.isArray(data)) return;
        setCandles(data.map(parseCandle));
      } catch (e) {
        if (session.active) console.error('[useCrypto] loadHistory:', e.message);
      }
    };

    const loadTicker = async () => {
      try {
        const url = `${TICKER_PROXY}?symbol=${symbol}`;
        const res = await fetch(url);
        if (!session.active || !res.ok) return;
        const d = await res.json();
        if (!session.active || d?.symbol !== symbol) return;
        setTicker(parseTickerRest(d));
      } catch (e) {
        if (session.active) console.warn('[useCrypto] loadTicker:', e.message);
      }
    };

    // ── WebSocket ────────────────────────────────────────────────────────
    const connect = () => {
      if (!session.active) return;

      const tickerStream = `${symbol.toLowerCase()}@ticker`;
      const klineStream = `${symbol.toLowerCase()}@kline_${interval}`;
      const url = `${BINANCE_WS}?streams=${tickerStream}/${klineStream}`;

      ws = new WebSocket(url);

      ws.onopen = () => {
        if (session.active) setStatus('live');
      };

      ws.onerror = () => {
        if (session.active) setStatus('error');
      };

      ws.onclose = () => {
        if (!session.active) return;
        setStatus('connecting');
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onmessage = (event) => {
        if (!session.active) return;

        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }
        if (!msg?.data || !msg.stream) return;
        if (!msg.stream.startsWith(expectedPrefix)) return;

        if (msg.stream.endsWith('@ticker')) {
          lastWsTickerAt = Date.now();
          setTicker(parseTickerWs(msg.data));
          return;
        }

        if (msg.stream.includes('@kline_')) {
          const candle = parseCandle(msg.data.k);
          setCandles((prev) => {
            if (!prev.length) return [candle];
            const last = prev[prev.length - 1];
            if (last.t === candle.t) {
              return [...prev.slice(0, -1), candle];
            }
            const next = [...prev, candle];
            return next.length > 500 ? next.slice(-500) : next;
          });
        }
      };
    };

    // ── kick-off ─────────────────────────────────────────────────────────
    // REST primeiro (rápido + resiliente). WS depois para tempo real.
    Promise.all([loadHistory(), loadTicker()]).then(() => {
      if (session.active) connect();
    });

    // Polling de segurança: só dispara se o WS não entregou ticker
    // nos últimos 6 segundos. Quando o WS estiver saudável, este timer
    // é silencioso e não gera tráfego REST.
    pollTimer = setInterval(() => {
      if (!session.active) return;
      if (Date.now() - lastWsTickerAt > WS_FRESHNESS_MS) {
        loadTicker();
      }
    }, TICKER_POLL_MS);

    return () => {
      session.active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollTimer) clearInterval(pollTimer);
      if (ws) {
        // Anula handlers ANTES do close para silenciar mensagens em flight
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        try { ws.close(); } catch {}
      }
    };
  }, [symbol, interval]);

  return { candles, ticker, status };
}
