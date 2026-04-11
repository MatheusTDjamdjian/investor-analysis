// lib/binance.js
// Cliente HTTP para a API REST da Binance.
// Todas as requisições autenticadas usam HMAC-SHA256 (API Key + Secret).
// Este arquivo NUNCA é importado pelo frontend.

import crypto from 'crypto';

const BASE = process.env.BINANCE_BASE_URL || 'https://api.binance.com';
const KEY  = process.env.BINANCE_API_KEY;
const SEC  = process.env.BINANCE_SECRET;

/** Gera a assinatura HMAC-SHA256 exigida pela Binance */
function sign(queryString) {
  return crypto
    .createHmac('sha256', SEC)
    .update(queryString)
    .digest('hex');
}

/**
 * Executa uma requisição autenticada na Binance.
 * @param {string} path   - ex: '/api/v3/order/oco'
 * @param {string} method - 'POST' | 'GET' | 'DELETE'
 * @param {object} params - parâmetros da requisição
 */
export async function binanceFetch(path, method = 'GET', params = {}) {
  params.timestamp  = Date.now();
  params.recvWindow = 5000;

  const qs        = new URLSearchParams(params).toString();
  const signature = sign(qs);
  const url       = `${BASE}${path}?${qs}&signature=${signature}`;

  const res = await fetch(url, {
    method,
    headers: {
      'X-MBX-APIKEY': KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // Binance retorna { code, msg } em erros
    throw new Error(`Binance [${data.code}]: ${data.msg}`);
  }

  return data;
}

/**
 * Cria uma ordem OCO (One Cancels the Other) de VENDA na Binance.
 *
 * Uma OCO de venda contém:
 *  - LIMIT_MAKER  → executa se o preço subir até limitPrice (take profit em short?)
 *  - STOP_LOSS_LIMIT → dispara stop se o preço subir até stopPrice (stop loss em short)
 *
 * Nota: na Binance Spot, OCO de venda SHORT padrão:
 *  - stopPrice   = stop loss (preço que dispara o stop)
 *  - limitPrice  = take profit (ordem limite abaixo do mercado)
 *  - price       = preço limite da ordem stop
 *
 * @param {object} opts
 * @param {string} opts.symbol      - ex: 'BTCUSDT'
 * @param {string} opts.side        - 'SELL' | 'BUY'
 * @param {number} opts.quantity    - quantidade do ativo
 * @param {number} opts.price       - take profit (limite superior da OCO de venda)
 * @param {number} opts.stopPrice   - preço que ativa o stop loss
 * @param {number} opts.stopLimitPrice - preço limite da ordem stop
 */
export async function createOCO({
  symbol,
  side,
  quantity,
  price,
  stopPrice,
  stopLimitPrice,
}) {
  return binanceFetch('/api/v3/order/oco', 'POST', {
    symbol,
    side,
    quantity,
    price:          price.toFixed(2),
    stopPrice:      stopPrice.toFixed(2),
    stopLimitPrice: stopLimitPrice.toFixed(2),
    stopLimitTimeInForce: 'GTC',
    listClientOrderId: `cryptodesk_${Date.now()}`,
  });
}