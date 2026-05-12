// lib/coins.js
// Lista de criptoativos suportados (pareados com USDT na Binance).

export const COINS = [
  { symbol: 'BTCUSDT',  base: 'BTC',  name: 'Bitcoin',      gradient: ['#f7931a', '#ffb84d'] },
  { symbol: 'ETHUSDT',  base: 'ETH',  name: 'Ethereum',     gradient: ['#6e8cff', '#b478ff'] },
  { symbol: 'SOLUSDT',  base: 'SOL',  name: 'Solana',       gradient: ['#9945ff', '#14f195'] },
  { symbol: 'BNBUSDT',  base: 'BNB',  name: 'BNB',          gradient: ['#f0b90b', '#fcd535'] },
  { symbol: 'XRPUSDT',  base: 'XRP',  name: 'XRP',          gradient: ['#23292f', '#5a8fff'] },
  { symbol: 'RENDERUSDT', base: 'RENDER', name: 'Render',   gradient: ['#cf2d77', '#ff7ab6'] },
  { symbol: 'AVAXUSDT', base: 'AVAX', name: 'Avalanche',    gradient: ['#e84142', '#ff8a8a'] },
  { symbol: 'DOGEUSDT', base: 'DOGE', name: 'Dogecoin',     gradient: ['#c2a633', '#ffd966'] },
];

export const TIMEFRAMES = [
  { value: '1m',  label: '1m'  },
  { value: '5m',  label: '5m'  },
  { value: '15m', label: '15m' },
  { value: '1h',  label: '1h'  },
  { value: '4h',  label: '4h'  },
  { value: '1d',  label: '1D'  },
];

export const findCoin = (symbol) => COINS.find((c) => c.symbol === symbol);
