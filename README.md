# Crypto Dashboard

Dashboard de monitoramento de criptomoedas em tempo real, com gráfico de candles ao vivo
e alternância entre dólar (USD) e real (BRL).

Apenas leitura de mercado — não há execução de ordens, autenticação, banco de dados ou
qualquer integração que exija credenciais.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| UI | React 19 + TailwindCSS v4 |
| Linguagem | JavaScript (componentes/hooks) + TypeScript (config) |
| Gráficos | [`lightweight-charts`](https://www.npmjs.com/package/lightweight-charts) 5 |
| Dados de mercado | Binance (REST `/api/v3/*` + WebSocket `stream.binance.com`) |
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
    │   └── api/binance/
    │       ├── klines.js           # proxy → /api/v3/klines
    │       └── ticker.js           # proxy → /api/v3/ticker/24hr
    ├── components/
    │   ├── CandleChart.jsx         # gráfico de candles + volume
    │   ├── CryptoSelector.jsx      # seletor horizontal de ativos
    │   ├── CurrencyToggle.jsx      # USD / BRL
    │   ├── PriceHeader.jsx         # preço em destaque + variação 24h
    │   ├── StatsGrid.jsx           # máx/mín/volume/trades 24h
    │   └── TimeframeBar.jsx        # 1m / 5m / 15m / 1h / 4h / 1d
    ├── hooks/
    │   ├── useCrypto.js            # WS Binance + fallback REST + polling
    │   └── useExchangeRate.js      # cotação USD-BRL (refresh 60s)
    ├── lib/
    │   ├── coins.js                # lista de ativos e timeframes
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
| Multi-ativo | BTC, ETH, SOL, BNB, XRP, RENDER, AVAX, DOGE (pares `*USDT`) |
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

**Renderização do gráfico no cliente.** `lightweight-charts` depende de `window`,
então `CandleChart` é importado via `next/dynamic` com `ssr: false`.

**Cache do Turbopack em dev.** `turbopackFileSystemCacheForDev` está ativado em
`next.config.ts` para que restarts de `next dev` fiquem praticamente instantâneos
depois do primeiro boot.

## Aviso legal

Este projeto é apenas uma ferramenta de visualização. Os dados exibidos são
informativos e **não constituem recomendação financeira**.
