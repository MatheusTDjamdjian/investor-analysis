// pages/api/binance/klines.js
// Proxy para /api/v3/klines da Binance.
// Necessário porque AdBlockers (uBlock, Brave Shield, etc.) frequentemente
// bloqueiam api.binance.com no client. Roteando pelo Next, o navegador
// conversa apenas com localhost — invisível para qualquer extensão.

const BINANCE = 'https://api.binance.com/api/v3/klines';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { symbol, interval, limit = '300' } = req.query;
  if (!symbol || !interval) {
    return res.status(400).json({ error: 'symbol and interval are required' });
  }

  const url = `${BINANCE}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'crypto-dashboard/1.0' },
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message || 'upstream error' });
  }
}
