// pages/api/yahoo/chart.js
// Proxy para o endpoint de gráfico do Yahoo Finance (ações B3 e EUA).
// Devolve dados já normalizados para o mesmo formato usado pelas criptos:
//   { candles: [{ t, open, high, low, close, vol }], ticker: {...} }
//
// Query:
//   symbol   — ticker Yahoo (ex.: PETR4.SA, NVDA). Só aceita a lista de lib/stocks.
//   interval — 1m | 5m | 15m | 1h | 4h | 1d
//   live=1   — janela curta, usada no polling para atualizar só os candles recentes.
//
// O Yahoo não oferece 4h: os candles de 1h são agregados aqui, em blocos de
// 4h contados a partir da abertura de cada pregão.

import { STOCK_SYMBOLS } from '@/lib/stocks';

const YAHOO = 'https://query1.finance.yahoo.com/v8/finance/chart';
const MAX_CANDLES = 500;

// interval da UI → { interval Yahoo, range completo, range do polling }
const INTERVALS = {
  '1m':  { yahoo: '1m',  range: '5d',  live: '1d' },
  '5m':  { yahoo: '5m',  range: '5d',  live: '1d' },
  '15m': { yahoo: '15m', range: '1mo', live: '1d' },
  '1h':  { yahoo: '60m', range: '3mo', live: '5d' },
  '4h':  { yahoo: '60m', range: '1y',  live: '5d', aggregate: 4 },
  '1d':  { yahoo: '1d',  range: '2y',  live: '5d' },
};

// Offset UTC (em segundos) do fuso da bolsa num dado instante — respeita
// horário de verão (ex.: NY alterna entre -5h e -4h ao longo do ano).
function makeOffsetResolver(timeZone, fallbackSec) {
  let fmt = null;
  try {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
  } catch {
    return () => fallbackSec;
  }
  const cache = new Map(); // por dia UTC (transições de DST ocorrem fora do pregão)
  return (ms) => {
    const day = Math.floor(ms / 86_400_000);
    if (cache.has(day)) return cache.get(day);
    const name = fmt.formatToParts(new Date(ms)).find((p) => p.type === 'timeZoneName')?.value;
    const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name ?? '');
    const off = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 3600 + Number(m[3] ?? 0) * 60) : 0;
    cache.set(day, off);
    return off;
  };
}

// off = offset UTC do candle, usado pelo gráfico para exibir o horário da bolsa.
function parseCandles(result, offsetAt) {
  const ts = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};
  const out = [];
  for (let i = 0; i < ts.length; i++) {
    const open = q.open?.[i];
    const high = q.high?.[i];
    const low = q.low?.[i];
    const close = q.close?.[i];
    // Yahoo devolve buracos (null) em minutos sem negociação.
    if (open == null || high == null || low == null || close == null) continue;
    const t = ts[i] * 1000;
    out.push({ t, off: offsetAt(t), open, high, low, close, vol: q.volume?.[i] ?? 0 });
  }
  return out;
}

// Agrupa candles de 1h em blocos de N horas dentro de cada pregão.
function aggregateHours(candles, hours) {
  const out = [];
  let dayKey = null;
  let dayStart = 0;
  let bucketKey = null;
  for (const c of candles) {
    const localDay = Math.floor((c.t / 1000 + c.off) / 86400);
    if (localDay !== dayKey) {
      dayKey = localDay;
      dayStart = c.t;
    }
    const key = `${localDay}:${Math.floor((c.t - dayStart) / (hours * 3600_000))}`;
    if (key !== bucketKey) {
      bucketKey = key;
      out.push({ ...c });
      continue;
    }
    const cur = out[out.length - 1];
    cur.high = Math.max(cur.high, c.high);
    cur.low = Math.min(cur.low, c.low);
    cur.close = c.close;
    cur.vol += c.vol;
  }
  return out;
}

function parseTicker(meta) {
  const price = meta.regularMarketPrice;
  const pct = meta.regularMarketChangePercent;
  // previousClose nem sempre vem (depende do range); deriva da variação %.
  const prevClose =
    pct != null ? price / (1 + pct / 100) : meta.previousClose ?? meta.chartPreviousClose;
  const nowSec = Date.now() / 1000;
  const regular = meta.currentTradingPeriod?.regular;
  const marketOpen = !!regular && nowSec >= regular.start && nowSec < regular.end;

  return {
    price,
    change: pct ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : null),
    changeAbs: prevClose != null ? price - prevClose : null,
    prevClose,
    high24h: meta.regularMarketDayHigh,
    low24h: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    currency: meta.currency,
    marketOpen,
    marketTime: meta.regularMarketTime * 1000,
    gmtoffset: meta.gmtoffset ?? 0,
    timezone: meta.exchangeTimezoneName,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { symbol, interval = '15m', live } = req.query;
  if (!STOCK_SYMBOLS.has(symbol)) {
    return res.status(400).json({ error: 'unsupported symbol' });
  }
  const cfg = INTERVALS[interval];
  if (!cfg) {
    return res.status(400).json({ error: 'unsupported interval' });
  }

  const range = live === '1' ? cfg.live : cfg.range;
  const url = `${YAHOO}/${encodeURIComponent(symbol)}?interval=${cfg.yahoo}&range=${range}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (investor-dashboard)' },
    });
    const data = await upstream.json();
    const result = data?.chart?.result?.[0];
    if (!upstream.ok || !result) {
      const msg = data?.chart?.error?.description || `upstream ${upstream.status}`;
      return res.status(502).json({ error: msg });
    }

    const ticker = parseTicker(result.meta);
    const offsetAt = makeOffsetResolver(result.meta.exchangeTimezoneName, ticker.gmtoffset);
    let candles = parseCandles(result, offsetAt);
    if (cfg.aggregate) candles = aggregateHours(candles, cfg.aggregate);
    if (candles.length > MAX_CANDLES) candles = candles.slice(-MAX_CANDLES);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ symbol, candles, ticker });
  } catch (e) {
    return res.status(502).json({ error: e.message || 'upstream error' });
  }
}
