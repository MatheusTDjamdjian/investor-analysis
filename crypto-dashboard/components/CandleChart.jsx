// components/CandleChart.jsx
// Gráfico de candles em tempo real (lightweight-charts).
// Renderiza apenas no client — usar com next/dynamic { ssr:false }.

import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
} from 'lightweight-charts';

// factor: multiplica OHLC (conversão de moeda: USD↔BRL)
// c.off:  offset UTC opcional do candle (ações). lightweight-charts exibe em
//         UTC, então o deslocamento faz o pregão aparecer no horário da bolsa.
const toChartTime = (c) => Math.floor(c.t / 1000) + (c.off ?? 0);

// Espelha os tokens de styles/globals.css (o canvas não lê variáveis CSS).
const THEME = {
  text: '#5d6470',
  grid: 'rgba(255,255,255,0.035)',
  border: '#1d2127',
  crosshair: 'rgba(94,225,255,0.35)',
  label: '#1a1e23',
  up: '#2fd897',
  down: '#ff5c7a',
  volUp: 'rgba(47,216,151,0.28)',
  volDown: 'rgba(255,92,122,0.28)',
};

// title:   rótulo do cabeçalho do painel
// toolbar: controles exibidos à direita do cabeçalho (ex.: timeframes)
export default function CandleChart({ candles, factor = 1, title = 'Gráfico', toolbar = null }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // Setup do gráfico (uma vez)
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: THEME.text,
        fontSize: 10.5,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: THEME.grid },
        horzLines: { color: THEME.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: THEME.crosshair, width: 1, style: 3, labelBackgroundColor: THEME.label },
        horzLine: { color: THEME.crosshair, width: 1, style: 3, labelBackgroundColor: THEME.label },
      },
      rightPriceScale: {
        borderColor: THEME.border,
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: THEME.border,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: THEME.up,
      downColor: THEME.down,
      borderUpColor: THEME.up,
      borderDownColor: THEME.down,
      wickUpColor: THEME.up,
      wickDownColor: THEME.down,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: THEME.volUp,
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.84, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Atualiza dados a cada candle ou troca de moeda.
  // Quando candles=[] (troca de ativo), limpa o gráfico ao invés de
  // manter os dados anteriores visíveis.
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    if (!candles.length) {
      candleSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
      return;
    }

    const candleData = candles.map((c) => ({
      time: toChartTime(c),
      open: c.open * factor,
      high: c.high * factor,
      low: c.low * factor,
      close: c.close * factor,
    }));

    const volumeData = candles.map((c) => ({
      time: toChartTime(c),
      value: c.vol,
      color: c.close >= c.open ? THEME.volUp : THEME.volDown,
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
  }, [candles, factor]);

  return (
    <section className="panel chart-panel">
      <div className="chart-head">
        <span className="label">
          {title}
          <span style={{ marginLeft: 10, color: 'var(--border-strong)' }}>│</span>
          <span style={{ marginLeft: 10 }}>{candles.length} candles</span>
        </span>
        {toolbar}
      </div>
      <div className="chart-body">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </section>
  );
}
