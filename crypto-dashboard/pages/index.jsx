// pages/index.jsx
// Dashboard único de análise de ativos.
// Funcionalidades:
//   - Menu de categorias: Criptomoedas, Ações Brasil (B3) e Ações Globais
//   - Alternar entre os ativos de cada categoria
//   - Alternar moeda fiat de exibição (USD / BRL)
//   - Gráfico de candles em tempo real (lightweight-charts)
//   - Preço, variação, máxima, mínima, volume — todos ao vivo
//
// Cripto: WebSocket Binance. Ações: polling do Yahoo Finance via proxy.
// O lightweight-charts depende de window, então o gráfico só renderiza no client.

import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import AssetSelector from '@/components/AssetSelector';
import CategoryTabs from '@/components/CategoryTabs';
import CurrencyToggle from '@/components/CurrencyToggle';
import PriceHeader from '@/components/PriceHeader';
import StatsGrid from '@/components/StatsGrid';
import TimeframeBar from '@/components/TimeframeBar';

import { useCrypto } from '@/hooks/useCrypto';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useStock } from '@/hooks/useStock';
import { CATEGORIES, findAsset, findCategory } from '@/lib/categories';
import { conversionFactor } from '@/lib/format';

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

// Ativo selecionado em cada categoria (preservado ao alternar entre elas).
const INITIAL_SELECTION = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.assets[0].symbol]),
);

export default function Home() {
  const [categoryId, setCategoryId] = useState('crypto');
  const [selection, setSelection] = useState(INITIAL_SELECTION);
  const [timeframe, setTimeframe] = useState('15m');
  const [currency, setCurrency] = useState('USD');

  const category = findCategory(categoryId);
  const asset = findAsset(category, selection[categoryId]);
  const isCrypto = category.source === 'binance';

  // Só um dos hooks fica ativo por vez; o outro recebe null e fica ocioso.
  const cryptoData = useCrypto(isCrypto ? asset.symbol : null, timeframe);
  const stockData = useStock(isCrypto ? null : asset.symbol, timeframe);
  const { candles, ticker, status } = isCrypto ? cryptoData : stockData;

  const { rate, updatedAt } = useExchangeRate();
  const factor = conversionFactor(rate, currency, category.quote) ?? 1;

  const selectCategory = (id) => {
    setCategoryId(id);
    // Exibe cada categoria na moeda nativa por padrão (ações B3 em reais).
    setCurrency(findCategory(id).quote);
  };

  const selectAsset = (symbol) =>
    setSelection((prev) => ({ ...prev, [categoryId]: symbol }));

  return (
    <>
      <Head>
        <title>CryptoDashboard · Cripto e ações em tempo real</title>
        <meta
          name="description"
          content="Acompanhe criptomoedas, ações brasileiras e ações globais em tempo real, em dólar e em real, com gráficos ao vivo."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                Cripto e ações em tempo real
              </div>
            </div>
          </div>

          <CurrencyToggle
            currency={currency}
            onChange={setCurrency}
            rate={rate}
            updatedAt={updatedAt}
            showRate={currency !== category.quote}
          />
        </header>

        {/* Menu de categorias + ativos da categoria */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CategoryTabs active={categoryId} onSelect={selectCategory} />
          <AssetSelector assets={category.assets} active={asset.symbol} onSelect={selectAsset} />
        </section>

        {/* Header de preço */}
        <PriceHeader
          asset={asset}
          category={category}
          ticker={ticker}
          currency={currency}
          rate={rate}
          status={status}
        />

        {/* Stats grid */}
        <StatsGrid ticker={ticker} category={category} currency={currency} rate={rate} />

        {/* Timeframes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <TimeframeBar active={timeframe} onSelect={setTimeframe} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {category.pair(asset)} · {timeframe}
          </span>
        </div>

        {/* Gráfico */}
        <CandleChart candles={candles} factor={factor} />

        {/* Rodapé */}
        <footer
          style={{
            marginTop: 12,
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Dados: Binance (cripto) · Yahoo Finance (ações, pode haver atraso conforme a bolsa) ·
          Cotação BRL: AwesomeAPI · Apenas para fins informativos.
        </footer>
      </main>
    </>
  );
}
