// pages/index.jsx
// Dashboard único de análise de criptoativos.
// Funcionalidades:
//   - Alternar entre criptoativos (BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOGE)
//   - Alternar moeda fiat de exibição (USD / BRL)
//   - Gráfico de candles em tempo real (lightweight-charts)
//   - Preço, variação 24h, máxima, mínima, volume — todos ao vivo
//
// O lightweight-charts depende de window, então o gráfico só renderiza no client.

import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import CryptoSelector from '@/components/CryptoSelector';
import CurrencyToggle from '@/components/CurrencyToggle';
import PriceHeader from '@/components/PriceHeader';
import StatsGrid from '@/components/StatsGrid';
import TimeframeBar from '@/components/TimeframeBar';

import { useCrypto } from '@/hooks/useCrypto';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { findCoin } from '@/lib/coins';

const CandleChart = dynamic(() => import('@/components/CandleChart'), {
  ssr: false,
  loading: () => (
    <div
      className="glass shimmer"
      style={{
        borderRadius: 20,
        height: 460,
      }}
    />
  ),
});

export default function Home() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [currency, setCurrency] = useState('USD');

  const coin = findCoin(symbol);
  const { candles, ticker, status } = useCrypto(symbol, timeframe);
  const { rate, updatedAt } = useExchangeRate();

  return (
    <>
      <Head>
        <title>CryptoDashboard · Análise de preços em tempo real</title>
        <meta
          name="description"
          content="Acompanhe preços de criptomoedas em tempo real, em dólar e em real, com gráficos ao vivo."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6e8cff, #b478ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
                boxShadow: '0 8px 24px -10px rgba(110,140,255,0.6)',
              }}
            >
              ◈
            </div>
            <div>
              <div className="gradient-text" style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>
                CryptoDashboard
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Análise de preços em tempo real
              </div>
            </div>
          </div>

          <CurrencyToggle
            currency={currency}
            onChange={setCurrency}
            rate={rate}
            updatedAt={updatedAt}
          />
        </header>

        {/* Seletor de criptoativo */}
        <CryptoSelector active={symbol} onSelect={setSymbol} />

        {/* Header de preço */}
        <PriceHeader
          coin={coin}
          ticker={ticker}
          currency={currency}
          rate={rate}
          status={status}
        />

        {/* Stats grid */}
        <StatsGrid ticker={ticker} currency={currency} rate={rate} />

        {/* Timeframes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <TimeframeBar active={timeframe} onSelect={setTimeframe} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {coin.base}/USDT · {timeframe}
          </span>
        </div>

        {/* Gráfico */}
        <CandleChart candles={candles} currency={currency} rate={rate} />

        {/* Rodapé */}
        <footer
          style={{
            marginTop: 12,
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Dados: Binance · Cotação BRL: AwesomeAPI · Apenas para fins informativos.
        </footer>
      </main>
    </>
  );
}
