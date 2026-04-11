// lib/indicators.js
// Motor de análise técnica.
// Exporta calcAllIndicators(candles) → objeto com todos os indicadores
// e generateSignal(indicators) → { signal, strength, reasons }
//
// Pode ser importado tanto pelo frontend (cálculo local)
// quanto pelo backend (validação antes de executar ordem).

// ─── Médias Móveis ────────────────────────────────────────────────────────────

/** EMA (Exponential Moving Average) */
export function calcEMA(closes, period) {
  if (closes.length < period) return [];
  const k = 2 / (period + 1);
  const result = [closes[0]];
  for (let i = 1; i < closes.length; i++) {
    result.push(closes[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

/** SMA (Simple Moving Average) */
export function calcSMA(closes, period) {
  const result = [];
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b) / period);
  }
  return result;
}

// ─── RSI ─────────────────────────────────────────────────────────────────────

/**
 * RSI (Relative Strength Index) de Wilder — período padrão 14.
 * Retorna valor entre 0 e 100.
 * >70 = sobrecomprado (sinal de venda), <30 = sobrevendido (sinal de compra)
 */
export function calcRSI(closes, period = 14) {
  if (closes.length < period + 2) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  let ag = gains / period;
  let al = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + Math.max(d, 0)) / period;
    al = (al * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (al === 0) return 100;
  return 100 - 100 / (1 + ag / al);
}

// ─── MACD ────────────────────────────────────────────────────────────────────

/**
 * MACD (12, 26, 9)
 * Retorna { line, signal, histogram }
 * histogram < 0 e cruzando para baixo → sinal de venda
 */
export function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  const ema12 = calcEMA(closes, fast);
  const ema26 = calcEMA(closes, slow);
  const macdLine = closes.map((_, i) => (ema12[i] ?? 0) - (ema26[i] ?? 0));
  const signalLine = calcEMA(macdLine.slice(-signal * 3), signal);
  const last = macdLine[macdLine.length - 1];
  const sig  = signalLine[signalLine.length - 1];
  return {
    line:      last,
    signal:    sig,
    histogram: last - sig,
    // cruzamento: true se MACD cruzou para baixo do signal neste candle
    bearishCross:
      macdLine[macdLine.length - 2] > signalLine[signalLine.length - 2] &&
      last < sig,
    bullishCross:
      macdLine[macdLine.length - 2] < signalLine[signalLine.length - 2] &&
      last > sig,
  };
}

// ─── Bandas de Bollinger ─────────────────────────────────────────────────────

/**
 * Bandas de Bollinger (período 20, desvio 2)
 * Retorna { upper, mid, lower, bandwidth, %b }
 * Preço > upper → sobrecomprado → sinal de venda
 */
export function calcBollingerBands(closes, period = 20, stdDev = 2) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mid   = slice.reduce((a, b) => a + b) / period;
  const variance = slice.map(c => (c - mid) ** 2).reduce((a, b) => a + b) / period;
  const std   = Math.sqrt(variance);
  const upper = mid + stdDev * std;
  const lower = mid - stdDev * std;
  const last  = closes[closes.length - 1];
  return {
    upper,
    mid,
    lower,
    bandwidth: (upper - lower) / mid, // volatilidade relativa
    percentB:  (last - lower) / (upper - lower), // 0=lower, 1=upper
  };
}

// ─── Volume ──────────────────────────────────────────────────────────────────

/**
 * Análise de volume:
 * - Compara o volume atual com a média dos últimos N candles
 * - Volume acima de 1.5x a média = confirmação de movimento
 */
export function analyzeVolume(volumes, period = 20) {
  if (volumes.length < period) return null;
  const avg = volumes.slice(-period - 1, -1).reduce((a, b) => a + b) / period;
  const current = volumes[volumes.length - 1];
  return {
    current,
    average: avg,
    ratio:   current / avg,          // >1.5 = volume alto
    isHigh:  current / avg > 1.5,
  };
}

// ─── Suporte e Resistência ───────────────────────────────────────────────────

/**
 * Detecta nível de resistência recente (máxima dos últimos N candles)
 * Preço próximo de resistência = zona de venda
 */
export function calcSupportResistance(highs, lows, period = 20) {
  const recentHighs = highs.slice(-period);
  const recentLows  = lows.slice(-period);
  return {
    resistance: Math.max(...recentHighs),
    support:    Math.min(...recentLows),
  };
}

// ─── Estocástico ─────────────────────────────────────────────────────────────

/**
 * Estocástico %K (14, 3, 3)
 * >80 = sobrecomprado, <20 = sobrevendido
 */
export function calcStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (closes.length < kPeriod) return null;
  const kValues = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const hSlice = highs.slice(i - kPeriod + 1, i + 1);
    const lSlice = lows.slice(i - kPeriod + 1, i + 1);
    const hh = Math.max(...hSlice);
    const ll = Math.min(...lSlice);
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const dValues = calcSMA(kValues, dPeriod);
  return {
    k: kValues[kValues.length - 1],
    d: dValues[dValues.length - 1],
    overbought:  kValues[kValues.length - 1] > 80,
    oversold:    kValues[kValues.length - 1] < 20,
  };
}

// ─── Motor de Sinal ──────────────────────────────────────────────────────────

/**
 * calcAllIndicators — recebe array de candles e retorna todos os indicadores.
 * @param {Array} candles - [{ open, high, low, close, vol }]
 */
export function calcAllIndicators(candles) {
  const closes  = candles.map(c => c.close);
  const highs   = candles.map(c => c.high);
  const lows    = candles.map(c => c.low);
  const volumes = candles.map(c => c.vol);

  const ema9   = calcEMA(closes, 9);
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes, 50);
  const sma200 = calcSMA(closes, 200);

  return {
    price:       closes[closes.length - 1],
    rsi:         calcRSI(closes, 14),
    macd:        calcMACD(closes),
    bb:          calcBollingerBands(closes),
    volume:      analyzeVolume(volumes),
    stoch:       calcStochastic(highs, lows, closes),
    sr:          calcSupportResistance(highs, lows),
    ema: {
      e9:   ema9[ema9.length - 1],
      e21:  ema21[ema21.length - 1],
      e50:  ema50[ema50.length - 1],
      s200: sma200[sma200.length - 1] ?? null,
    },
  };
}

/**
 * generateSignal — analisa os indicadores e retorna o sinal de trading.
 *
 * LÓGICA DE CONFLUÊNCIA:
 * Cada indicador contribui com pontos (-1 a +1):
 *   SELL  contribui com pontos negativos
 *   BUY   contribui com pontos positivos
 *   HOLD  contribui 0
 *
 * Sinal gerado apenas quando:
 *   - Pontuação total ≤ -4 (SELL forte) ou ≥ +4 (BUY forte)
 *   - Volume alto confirma o movimento (obrigatório)
 *   - Pelo menos 5 dos 7 indicadores apontam na mesma direção
 *
 * @returns {{ signal: 'SELL'|'BUY'|'HOLD', strength: number, reasons: string[], score: number }}
 */
export function generateSignal(ind) {
  const { price, rsi, macd, bb, volume, stoch, sr, ema } = ind;
  if (!rsi || !macd || !bb || !volume || !stoch) {
    return { signal: 'HOLD', strength: 0, reasons: ['Dados insuficientes'], score: 0 };
  }

  const checks = [];

  // 1. RSI
  if (rsi > 72)      checks.push({ dir: 'SELL', weight: 1.5, reason: `RSI sobrecomprado (${rsi.toFixed(1)})` });
  else if (rsi > 65) checks.push({ dir: 'SELL', weight: 0.8, reason: `RSI elevado (${rsi.toFixed(1)})` });
  else if (rsi < 28) checks.push({ dir: 'BUY',  weight: 1.5, reason: `RSI sobrevendido (${rsi.toFixed(1)})` });
  else if (rsi < 35) checks.push({ dir: 'BUY',  weight: 0.8, reason: `RSI baixo (${rsi.toFixed(1)})` });
  else               checks.push({ dir: 'HOLD',  weight: 0,   reason: 'RSI neutro' });

  // 2. MACD
  if (macd.bearishCross)          checks.push({ dir: 'SELL', weight: 1.5, reason: 'MACD cruzamento baixista' });
  else if (macd.histogram < -0.001 && macd.line < 0)
                                   checks.push({ dir: 'SELL', weight: 1.0, reason: `MACD negativo (hist: ${macd.histogram.toFixed(4)})` });
  else if (macd.bullishCross)      checks.push({ dir: 'BUY',  weight: 1.5, reason: 'MACD cruzamento altista' });
  else if (macd.histogram > 0.001 && macd.line > 0)
                                   checks.push({ dir: 'BUY',  weight: 1.0, reason: `MACD positivo (hist: ${macd.histogram.toFixed(4)})` });
  else                             checks.push({ dir: 'HOLD',  weight: 0,   reason: 'MACD neutro' });

  // 3. Bandas de Bollinger
  if (bb.percentB > 0.95)         checks.push({ dir: 'SELL', weight: 1.2, reason: `Preço acima da banda superior (${(bb.percentB * 100).toFixed(0)}%)` });
  else if (bb.percentB > 0.85)    checks.push({ dir: 'SELL', weight: 0.7, reason: 'Preço próximo da banda superior' });
  else if (bb.percentB < 0.05)    checks.push({ dir: 'BUY',  weight: 1.2, reason: 'Preço abaixo da banda inferior' });
  else if (bb.percentB < 0.15)    checks.push({ dir: 'BUY',  weight: 0.7, reason: 'Preço próximo da banda inferior' });
  else                             checks.push({ dir: 'HOLD',  weight: 0,   reason: 'Preço dentro das bandas' });

  // 4. Cruzamento de EMAs
  if (ema.e9 < ema.e21 && ema.e21 < (ema.e50 || ema.e21))
                                   checks.push({ dir: 'SELL', weight: 1.0, reason: 'EMA 9 < EMA 21 < EMA 50 (tendência baixista)' });
  else if (ema.e9 > ema.e21 && ema.e21 > (ema.e50 || ema.e21))
                                   checks.push({ dir: 'BUY',  weight: 1.0, reason: 'EMA 9 > EMA 21 > EMA 50 (tendência altista)' });
  else if (ema.e9 < ema.e21)       checks.push({ dir: 'SELL', weight: 0.6, reason: 'EMA 9 cruzou abaixo da EMA 21' });
  else if (ema.e9 > ema.e21)       checks.push({ dir: 'BUY',  weight: 0.6, reason: 'EMA 9 cruzou acima da EMA 21' });
  else                             checks.push({ dir: 'HOLD',  weight: 0,   reason: 'EMAs sem direção clara' });

  // 5. Estocástico
  if (stoch.k > 80 && stoch.k < stoch.d)
                                   checks.push({ dir: 'SELL', weight: 1.0, reason: `Estocástico sobrecomprado e caindo (K: ${stoch.k.toFixed(1)})` });
  else if (stoch.k > 75)           checks.push({ dir: 'SELL', weight: 0.6, reason: `Estocástico alto (${stoch.k.toFixed(1)})` });
  else if (stoch.k < 20 && stoch.k > stoch.d)
                                   checks.push({ dir: 'BUY',  weight: 1.0, reason: `Estocástico sobrevendido e subindo (K: ${stoch.k.toFixed(1)})` });
  else if (stoch.k < 25)           checks.push({ dir: 'BUY',  weight: 0.6, reason: `Estocástico baixo (${stoch.k.toFixed(1)})` });
  else                             checks.push({ dir: 'HOLD',  weight: 0,   reason: 'Estocástico neutro' });

  // 6. Volume (confirmação — sem volume alto, sinal perde peso)
  const volMultiplier = volume.isHigh ? 1.0 : 0.5;
  checks.push({
    dir: 'HOLD',
    weight: 0,
    reason: volume.isHigh
      ? `Volume alto confirmando (${volume.ratio.toFixed(1)}x média)`
      : `Volume baixo — sinal fraco (${volume.ratio.toFixed(1)}x média)`,
  });

  // 7. Proximidade de Suporte / Resistência
  const distToResistance = (sr.resistance - price) / price;
  const distToSupport    = (price - sr.support) / price;
  if (distToResistance < 0.005)    checks.push({ dir: 'SELL', weight: 0.8, reason: 'Preço em nível de resistência' });
  else if (distToSupport < 0.005)  checks.push({ dir: 'BUY',  weight: 0.8, reason: 'Preço em nível de suporte' });
  else                             checks.push({ dir: 'HOLD',  weight: 0,   reason: 'Sem confluência com S/R' });

  // ── Pontuação final ──
  let score = 0;
  const sellReasons = [];
  const buyReasons  = [];

  checks.forEach(c => {
    if (c.dir === 'SELL') { score -= c.weight * volMultiplier; sellReasons.push(c.reason); }
    if (c.dir === 'BUY')  { score += c.weight * volMultiplier; buyReasons.push(c.reason);  }
    if (c.reason && c.dir === 'HOLD') {
      // inclui na lista de razões como informação
      if (c.reason.includes('Volume')) (score < 0 ? sellReasons : buyReasons).push(c.reason);
    }
  });

  const sellCount = checks.filter(c => c.dir === 'SELL').length;
  const buyCount  = checks.filter(c => c.dir === 'BUY').length;
  const strength  = Math.min(Math.abs(score) / 6, 1); // 0 a 1

  // Critérios para gerar sinal real (evita sinais fracos):
  // Score ≤ -4 E pelo menos 4 indicadores vendedores E volume confirmando
  if (score <= -4 && sellCount >= 4 && volume.isHigh) {
    return {
      signal:   'SELL',
      strength,
      score,
      reasons:  sellReasons,
      sellCount,
      buyCount,
    };
  }
  if (score >= 4 && buyCount >= 4 && volume.isHigh) {
    return {
      signal:   'BUY',
      strength,
      score,
      reasons:  buyReasons,
      sellCount,
      buyCount,
    };
  }

  return {
    signal:   'HOLD',
    strength: 0,
    score,
    reasons:  ['Confluência insuficiente para gerar sinal'],
    sellCount,
    buyCount,
  };
}