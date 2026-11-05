# Crypto Dashboard

Dashboard de monitoramento de mercado em tempo real, com gráfico de candles ao vivo
e alternância entre dólar (USD) e real (BRL). Os ativos são organizados em três
categorias: **Criptomoedas**, **Ações Brasil** (10 maiores da B3) e **Ações Globais**
(10 maiores do mundo).

Apenas leitura de mercado — não há execução de ordens, autenticação, banco de dados ou
qualquer integração que exija credenciais.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| UI | React 19 + TailwindCSS v4 |
| Linguagem | JavaScript (componentes/hooks) + TypeScript (config) |
| Gráficos | [`lightweight-charts`](https://www.npmjs.com/package/lightweight-charts) 5 |
| Dados de cripto | Binance (REST `/api/v3/*` + WebSocket `stream.binance.com`) |
| Dados de ações | Yahoo Finance (`/v8/finance/chart`, via proxy + polling) |
| Cotação USD→BRL | AwesomeAPI (`economia.awesomeapi.com.br`) |
| Build | Turbopack (com cache de filesystem em dev) |

Sem backend próprio, sem banco de dados, sem chaves de API.

## Estrutura

```
investor-analysis/
└── crypto-dashboard/
    ├── pages/
    │   ├── _app.jsx                # bootstrap dos estilos globais
    │   ├── index.jsx               # página única do dashboard
    │   └── api/
    │       ├── binance/
    │       │   ├── klines.js       # proxy → /api/v3/klines
    │       │   └── ticker.js       # proxy → /api/v3/ticker/24hr
    │       └── yahoo/
    │           └── chart.js        # proxy → Yahoo Finance (ações), agrega 4h
    ├── components/
    │   ├── AssetSelector.jsx       # seletor horizontal de ativos da categoria
    │   ├── CandleChart.jsx         # gráfico de candles + volume
    │   ├── CategoryTabs.jsx        # menu Criptomoedas / Ações Brasil / Ações Globais
    │   ├── CurrencyToggle.jsx      # USD / BRL
    │   ├── PriceHeader.jsx         # preço em destaque + variação 24h
    │   ├── StatsGrid.jsx           # máx/mín/volume/trades 24h
    │   └── TimeframeBar.jsx        # 1m / 5m / 15m / 1h / 4h / 1d
    ├── hooks/
    │   ├── useCrypto.js            # WS Binance + fallback REST + polling
    │   ├── useExchangeRate.js      # cotação USD-BRL (refresh 60s)
    │   └── useStock.js             # polling Yahoo Finance (5s aberto / 30s fechado)
    ├── lib/
    │   ├── categories.js           # categorias do menu (fonte, moeda, ativos)
    │   ├── coins.js                # criptoativos e timeframes
    │   ├── stocks.js               # ações B3 e globais
    │   └── format.js               # formatação de moeda, %, números compactos
    ├── styles/globals.css          # tokens de tema + animações
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json
```

## Como rodar

```bash
cd crypto-dashboard
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Comandos disponíveis:

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

## Funcionalidades

| Feature | Detalhe |
|---|---|
| Preço em tempo real | WebSocket Binance (`@ticker`) com reconexão automática |
| Gráfico ao vivo | WebSocket Binance (`@kline_<interval>`) — atualiza o candle aberto em tempo real |
| Histórico | REST Binance (`/api/v3/klines`) — 300 candles iniciais |
| Stats 24h | Máxima, mínima, volume base, volume quote e nº de negociações |
| Cotação BRL | Conversão USD→BRL via AwesomeAPI (atualiza a cada 60 s) |
| Categorias | Menu Criptomoedas / Ações Brasil / Ações Globais; o ativo escolhido em cada categoria é preservado ao alternar |
| Cripto | BTC, ETH, SOL, BNB, XRP, RENDER, AVAX, DOGE (pares `*USDT`) |
| Ações Brasil | PETR4, ITUB4, VALE3, BPAC11, WEGE3, ABEV3, BBAS3, BBDC4, SBSP3, ITSA4 (cotadas em BRL) |
| Ações Globais | NVDA, MSFT, AAPL, GOOGL, AMZN, META, AVGO, TSM, TSLA, BRK.B (cotadas em USD) |
| Ações ao vivo | Polling a cada 5 s com o pregão aberto (30 s fechado); indica "Mercado fechado" fora do horário |
| Timeframes | 1m, 5m, 15m, 1h, 4h, 1d |
| Status de conexão | Indicador visual (live / conectando / erro) |
| UI | Tema escuro com glassmorphism, gradientes por ativo, animação de flash no preço |

## Decisões de implementação

**Proxy para a Binance.** As chamadas REST passam por `/api/binance/klines` e
`/api/binance/ticker` (rotas do Next.js) em vez de bater direto em `api.binance.com`.
AdBlockers como uBlock Origin e o Brave Shield costumam bloquear o domínio da
Binance no navegador; roteando pelo backend do Next, o cliente conversa apenas com
`localhost` e fica invisível para qualquer extensão.

**REST + WebSocket em paralelo.** O hook `useCrypto` carrega histórico e ticker via
REST primeiro (rápido e resiliente), depois abre o WebSocket. Um polling de
segurança a cada 4 s só dispara se o WS não entregou dados nos últimos 6 s —
quando o WS está saudável o polling fica silencioso e não gera tráfego extra.

**Ações via Yahoo Finance.** Não há WebSocket público e gratuito para ações, então
`useStock` faz polling de `/api/yahoo/chart` (proxy que só aceita os tickers de
`lib/stocks.js`). O primeiro request traz o histórico completo; os seguintes usam uma
janela curta (`live=1`) e só mesclam os candles recentes. O Yahoo não tem intervalo de
4h — o proxy agrega candles de 1h por pregão. Os horários do gráfico seguem o fuso da
bolsa (com horário de verão). Dependendo da bolsa, as cotações podem ter atraso.

**Renderização do gráfico no cliente.** `lightweight-charts` depende de `window`,
então `CandleChart` é importado via `next/dynamic` com `ssr: false`.

**Cache do Turbopack em dev.** `turbopackFileSystemCacheForDev` está ativado em
`next.config.ts` para que restarts de `next dev` fiquem praticamente instantâneos
depois do primeiro boot.

## Aviso legal

Este projeto é apenas uma ferramenta de visualização. Os dados exibidos são
informativos e **não constituem recomendação financeira**.
