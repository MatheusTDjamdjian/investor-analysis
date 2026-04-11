// pages/api/history.js
// Endpoint auxiliar: consulta ordens OCO abertas na Binance para um símbolo.
// Usado para enriquecer o histórico local com status real das ordens.

import { binanceFetch } from '@/lib/binance';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { symbol, orderListId } = req.query;

  try {
    if (orderListId) {
      // Consulta uma OCO específica pelo ID
      const order = await binanceFetch('/api/v3/orderList', 'GET', {
        orderListId: Number(orderListId),
      });
      return res.status(200).json({ order });
    }

    if (symbol) {
      // Lista todas as OCOs abertas para o símbolo
      const orders = await binanceFetch('/api/v3/openOrderList', 'GET', { symbol });
      return res.status(200).json({ orders });
    }

    // Sem parâmetros: lista todas as OCOs abertas
    const orders = await binanceFetch('/api/v3/openOrderList', 'GET', {});
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('[history]', err.message);
    return res.status(500).json({ error: err.message });
  }
}