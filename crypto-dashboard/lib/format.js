// lib/format.js
// Helpers de formatação de valores para a interface.

const FIAT_CONFIG = {
  USD: { locale: 'en-US', symbol: '$',   code: 'USD' },
  BRL: { locale: 'pt-BR', symbol: 'R$',  code: 'BRL' },
};

export function formatMoney(value, currency = 'USD', decimals) {
  if (value == null || !Number.isFinite(value)) return '—';
  const cfg = FIAT_CONFIG[currency] ?? FIAT_CONFIG.USD;
  const abs = Math.abs(value);

  let d = decimals;
  if (d == null) {
    if (abs >= 1000) d = 2;
    else if (abs >= 1) d = 2;
    else if (abs >= 0.01) d = 4;
    else d = 6;
  }

  const formatted = value.toLocaleString(cfg.locale, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return `${cfg.symbol} ${formatted}`;
}

export function formatCompact(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(2);
}

export function formatPct(value, decimals = 2) {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

// Fator multiplicativo para converter de `from` para `target`.
// rate = cotação USD→BRL. Retorna null se a conversão exige a cotação e ela
// ainda não chegou.
export function conversionFactor(rate, target = 'USD', from = 'USD') {
  if (target === from) return 1;
  if (!rate) return null;
  if (from === 'USD' && target === 'BRL') return rate;
  if (from === 'BRL' && target === 'USD') return 1 / rate;
  return null;
}

export function convert(value, rate, target = 'USD', from = 'USD') {
  if (value == null) return null;
  const f = conversionFactor(rate, target, from);
  return f == null ? null : value * f;
}
