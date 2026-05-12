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

const formatTime = (ms) => Math.floor(ms / 1000);

export default function CandleChart({ candles, currency, rate }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // priceScale: multiplica candle.close por rate quando BRL
  const factor = currency === 'BRL' && rate ? rate : 1;

  // Setup do gráfico (uma vez)
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#8a91a8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(110,140,255,0.4)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6e8cff',
        },
        horzLine: {
          color: 'rgba(110,140,255,0.4)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6e8cff',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#1fd087',
      downColor: '#ff5d5d',
      borderUpColor: '#1fd087',
      borderDownColor: '#ff5d5d',
      wickUpColor: 'rgba(31,208,135,0.6)',
      wickDownColor: 'rgba(255,93,93,0.6)',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: 'rgba(110,140,255,0.35)',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
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
  // Quando candles=[] (troca de cripto), limpa o gráfico ao invés de
  // manter os dados anteriores visíveis.
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    if (!candles.length) {
      candleSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
      return;
    }

    const candleData = candles.map((c) => ({
      time: formatTime(c.t),
      open: c.open * factor,
      high: c.high * factor,
      low: c.low * factor,
      close: c.close * factor,
    }));

    const volumeData = candles.map((c) => ({
      time: formatTime(c.t),
      value: c.vol,
      color:
        c.close >= c.open
          ? 'rgba(31,208,135,0.35)'
          : 'rgba(255,93,93,0.35)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
  }, [candles, factor]);

  return (
    <div
      className="glass"
      style={{
        padding: 16,
        borderRadius: 20,
        height: 460,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }}
        >
          Gráfico em tempo real
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {candles.length} candles
        </span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
