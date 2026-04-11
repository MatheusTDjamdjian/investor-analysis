// pages/api/execute-trade.js
// Endpoint Next.js API Route (roda no servidor, nunca no browser).
// Recebe: { symbol, side, quantity, entry, stopLoss, takeProfit }
// Executa: ordem OCO na Binance via HMAC-SHA256
// Retorna: { success, orderId, details } | { error }

import { createOCO } from '@/lib/binance';

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Valida variáveis de ambiente
  if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_SECRET) {
    return res.status(500).json({
      error: 'Credenciais da Binance não configuradas no servidor.',
    });
  }

  const { symbol, side, quantity, entry, stopLoss, takeProfit } = req.body;

  // Validação dos parâmetros obrigatórios
  if (!symbol || !side || !quantity || !entry || !stopLoss || !takeProfit) {
    return res.status(400).json({ error: 'Parâmetros incompletos.' });
  }

  if (!['BUY', 'SELL'].includes(side)) {
    return res.status(400).json({ error: 'Side inválido. Use BUY ou SELL.' });
  }

  if (quantity <= 0 || entry <= 0 || stopLoss <= 0 || takeProfit <= 0) {
    return res.status(400).json({ error: 'Valores devem ser positivos.' });
  }

  try {
    /*
     * Montagem da OCO:
     *
     * Para uma operação de VENDA (short spot):
     *   - price (limite do take profit) → abaixo do mercado (takeProfit)
     *   - stopPrice (gatilho do stop)   → acima do mercado (stopLoss)
     *   - stopLimitPrice                → ligeiramente acima do stopPrice (0.1% de slippage)
     *
     * A Binance exige: takeProfit < preço atual < stopLoss (para SELL OCO)
     */
    const stopLimitPrice =
      side === 'SELL'
        ? stopLoss * 1.001   // 0.1% acima do stop (slippage de proteção)
        : stopLoss * 0.999;

    const result = await createOCO({
      symbol,
      side,
      quantity:       Number(quantity),
      price:          side === 'SELL' ? takeProfit : takeProfit,  // ordem limite
      stopPrice:      stopLoss,
      stopLimitPrice: stopLimitPrice,
    });

    return res.status(200).json({
      success: true,
      orderId: result.orderListId,
      details: result,
    });
  } catch (err) {
    console.error('[execute-trade]', err.message);
    return res.status(500).json({
      error: err.message || 'Erro ao executar ordem na Binance.',
    });
  }
}