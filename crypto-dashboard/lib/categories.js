// lib/categories.js
// Categorias do menu principal. Cada categoria define:
//   - source:   de onde vêm os dados ('binance' | 'yahoo')
//   - quote:    moeda nativa de cotação dos ativos ('USD' | 'BRL')
//   - assets:   lista de ativos selecionáveis
//   - pair(a):  rótulo do par/mercado exibido na interface

import { COINS } from '@/lib/coins';
import { BR_STOCKS, GLOBAL_STOCKS } from '@/lib/stocks';

export const CATEGORIES = [
  {
    id: 'crypto',
    label: 'Criptomoedas',
    icon: '◈',
    source: 'binance',
    sourceLabel: 'Binance',
    quote: 'USD',
    assets: COINS,
    pair: (a) => `${a.base}/USDT`,
  },
  {
    id: 'br',
    label: 'Ações Brasil',
    icon: 'B3',
    source: 'yahoo',
    sourceLabel: 'Yahoo Finance',
    quote: 'BRL',
    assets: BR_STOCKS,
    pair: (a) => `${a.base} · B3`,
  },
  {
    id: 'global',
    label: 'Ações Globais',
    icon: '◎',
    source: 'yahoo',
    sourceLabel: 'Yahoo Finance',
    quote: 'USD',
    assets: GLOBAL_STOCKS,
    pair: (a) => `${a.base} · EUA`,
  },
];

export const findCategory = (id) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const findAsset = (category, symbol) =>
  category.assets.find((a) => a.symbol === symbol) ?? category.assets[0];
