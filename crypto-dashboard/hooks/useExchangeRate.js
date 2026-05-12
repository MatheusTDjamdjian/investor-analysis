// hooks/useExchangeRate.js
// Cotação USD -> BRL via AwesomeAPI (sem chave, atualiza a cada 60s).

import { useEffect, useState } from 'react';

const ENDPOINT = 'https://economia.awesomeapi.com.br/last/USD-BRL';
const REFRESH_MS = 60_000;

export function useExchangeRate() {
  const [rate, setRate] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchRate = async () => {
      try {
        const res = await fetch(ENDPOINT);
        const data = await res.json();
        const value = parseFloat(data?.USDBRL?.bid);
        if (alive && Number.isFinite(value)) {
          setRate(value);
          setUpdatedAt(Date.now());
        }
      } catch (e) {
        console.warn('[useExchangeRate]', e.message);
      }
    };

    fetchRate();
    const id = setInterval(fetchRate, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { rate, updatedAt };
}
