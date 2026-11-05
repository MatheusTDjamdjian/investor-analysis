// pages/index.jsx
// Investor Analysis — terminal de mercado (página única).
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
import Logo from '@/components/Logo';
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
  loading: () => <div className="panel chart-panel shimmer" />,
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
        <title>{`${asset.base} · Investor Analysis`}</title>
        <meta
          name="description"
          content="Investor Analysis — terminal de mercado com criptomoedas, ações da B3 e ações globais em tempo real, em dólar ou real."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <Logo size={30} />
            <div>
              <div className="brand-name">Investor Analysis</div>
              <div className="brand-tag">market terminal · cripto &amp; ações</div>
            </div>
          </div>

          <CategoryTabs active={categoryId} onSelect={selectCategory} />

          <CurrencyToggle
            currency={currency}
            onChange={setCurrency}
            rate={rate}
            updatedAt={updatedAt}
            showRate={currency !== category.quote}
          />
        </header>

        <div className="layout">
          <AssetSelector
            title={category.label}
            assets={category.assets}
            active={asset.symbol}
            onSelect={selectAsset}
          />

          <main className="content">
            <PriceHeader
              asset={asset}
              category={category}
              ticker={ticker}
              currency={currency}
              rate={rate}
              status={status}
            />

            <StatsGrid ticker={ticker} category={category} currency={currency} rate={rate} />

            <CandleChart
              candles={candles}
              factor={factor}
              title={`${category.pair(asset)} · ${timeframe}`}
              toolbar={<TimeframeBar active={timeframe} onSelect={setTimeframe} />}
            />
          </main>
        </div>

        <footer className="footer">
          <span>
            Dados: Binance (cripto) · Yahoo Finance (ações, pode haver atraso) · AwesomeAPI (USD/BRL)
          </span>
          <span>
            Gráficos:{' '}
            <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-2)' }}>
              TradingView Lightweight Charts
            </a>{' '}
            · Apenas para fins informativos.
          </span>
        </footer>
      </div>
    </>
  );
}
