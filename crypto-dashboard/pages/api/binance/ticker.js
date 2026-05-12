// pages/api/binance/ticker.js
// Proxy para /api/v3/ticker/24hr da Binance.
// Mesmo motivo de klines: contorna AdBlock/Brave Shield no client.

const BINANCE = 'https://api.binance.com/api/v3/ticker/24hr';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'symbol is required' });
  }

  const url = `${BINANCE}?symbol=${encodeURIComponent(symbol)}`;

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
