// lib/stocks.js
// Ações suportadas. `symbol` é o ticker no Yahoo Finance (B3 usa sufixo .SA),
// `base` é o ticker exibido na interface.

// 10 maiores empresas listadas na B3 (por valor de mercado, aproximado).
export const BR_STOCKS = [
  { symbol: 'PETR4.SA',  base: 'PETR4',  name: 'Petrobras',       gradient: ['#00843d', '#f7d117'] },
  { symbol: 'ITUB4.SA',  base: 'ITUB4',  name: 'Itaú Unibanco',   gradient: ['#ec7000', '#ffb25b'] },
  { symbol: 'VALE3.SA',  base: 'VALE3',  name: 'Vale',            gradient: ['#007e7a', '#eaa800'] },
  { symbol: 'BPAC11.SA', base: 'BPAC11', name: 'BTG Pactual',     gradient: ['#0b2a4a', '#3d7bd9'] },
  { symbol: 'WEGE3.SA',  base: 'WEGE3',  name: 'WEG',             gradient: ['#00579d', '#4fa3e8'] },
  { symbol: 'ABEV3.SA',  base: 'ABEV3',  name: 'Ambev',           gradient: ['#1b3c8c', '#d4a21b'] },
  { symbol: 'BBAS3.SA',  base: 'BBAS3',  name: 'Banco do Brasil', gradient: ['#f8d117', '#2a5bb8'] },
  { symbol: 'BBDC4.SA',  base: 'BBDC4',  name: 'Bradesco',        gradient: ['#cc092f', '#ff6680'] },
  { symbol: 'SBSP3.SA',  base: 'SBSP3',  name: 'Sabesp',          gradient: ['#0063a6', '#36b4e5'] },
  { symbol: 'ITSA4.SA',  base: 'ITSA4',  name: 'Itaúsa',          gradient: ['#1f3d7a', '#ff8a1f'] },
];

// 10 maiores empresas do mundo listadas em bolsa (por valor de mercado, aproximado).
export const GLOBAL_STOCKS = [
  { symbol: 'NVDA',  base: 'NVDA',  name: 'NVIDIA',             gradient: ['#76b900', '#b6f04a'] },
  { symbol: 'MSFT',  base: 'MSFT',  name: 'Microsoft',          gradient: ['#00a4ef', '#7fba00'] },
  { symbol: 'AAPL',  base: 'AAPL',  name: 'Apple',              gradient: ['#8e8e93', '#e5e5ea'] },
  { symbol: 'GOOGL', base: 'GOOGL', name: 'Alphabet',           gradient: ['#4285f4', '#34a853'] },
  { symbol: 'AMZN',  base: 'AMZN',  name: 'Amazon',             gradient: ['#ff9900', '#ffc266'] },
  { symbol: 'META',  base: 'META',  name: 'Meta',               gradient: ['#0866ff', '#7fb0ff'] },
  { symbol: 'AVGO',  base: 'AVGO',  name: 'Broadcom',           gradient: ['#cc092f', '#ff7a8f'] },
  { symbol: 'TSM',   base: 'TSM',   name: 'TSMC',               gradient: ['#c8102e', '#ff8c8c'] },
  { symbol: 'TSLA',  base: 'TSLA',  name: 'Tesla',              gradient: ['#e82127', '#ff8a8d'] },
  { symbol: 'BRK-B', base: 'BRK.B', name: 'Berkshire Hathaway', gradient: ['#3b2a7a', '#8a78d6'] },
];

export const STOCK_SYMBOLS = new Set(
  [...BR_STOCKS, ...GLOBAL_STOCKS].map((s) => s.symbol),
);
