# Crypto Trading Dashboard
 
Dashboard de monitoramento de criptomoedas em tempo real com análise técnica e sugestões OCO.
 
## Estrutura do projeto
 
```
crypto-dashboard/
└── index.html   ← arquivo único, sem dependências locais
```
 
## Como rodar
 
### Opção 1 — Abrir direto no navegador (mais simples)
Clique duas vezes no arquivo `index.html`. Abre no Chrome/Firefox/Edge sem nenhuma instalação.
 
> **Atenção:** no Chrome, a política de CORS pode bloquear a API Binance quando o arquivo
> é aberto via `file://`. Se isso acontecer, use a Opção 2.
 
---
 
### Opção 2 — Live Server no VS Code (recomendado)
 
1. Abra o VS Code e instale a extensão **Live Server**
   (publisher: Ritwick Dey — `ms-vscode.live-server`)
 
2. Clique com o botão direito em `index.html` → **"Open with Live Server"**
 
3. O navegador abre automaticamente em `http://127.0.0.1:5500`
 
---
 
### Opção 3 — Servidor local com Node.js
 
```bash
# Instale o servidor estático global (apenas uma vez)
npm install -g serve
 
# Na pasta do projeto:
serve .
 
# Acesse: http://localhost:3000
```
 
---
 
### Opção 4 — Python (sem instalar nada extra)
 
```bash
# Python 3
python -m http.server 8080
 
# Acesse: http://localhost:8080
```
 
---
 
## Funcionalidades
 
| Feature | Detalhe |
|---|---|
| Preço em tempo real | WebSocket Binance (`@ticker`) |
| Gráfico ao vivo | WebSocket Binance (`@kline`) atualiza candle aberto |
| Histórico | REST API Binance (`/api/v3/klines`) — 120 candles |
| Timeframes | 1m, 5m, 15m, 1h, 4h, 1d |
| Indicadores | EMA 9/21, Bandas de Bollinger, Volume |
| Análise técnica | RSI, EMA, MACD, Bollinger, Tendência (5 sinais) |
| Sugestão OCO | Gerada quando ≥ 3/5 sinais são vendedores |
| Multi-ativo | BTC, ETH, SOL, AVAX, XRP + adicionar qualquer par USDT |
 
## Parâmetros OCO (personalizável)
 
Localize as linhas abaixo no `<script>` para ajustar:
 
```js
const sl  = +(entry * (1 + 0.025)).toFixed(2);  // Stop Loss  = +2.5%
const tp  = +(entry * (1 - 0.045)).toFixed(2);  // Take Profit = -4.5%
```
 
Altere os percentuais conforme sua gestão de risco.
 
## Adicionar moeda nova
 
Clique em **"+ Adicionar"** no dashboard e digite o par (ex: `BNBUSDT`).
Ou edite o array no topo do script:
 
```js
const COINS  = ['BTCUSDT','ETHUSDT','SOLUSDT','AVAXUSDT','XRPUSDT','BNBUSDT'];
const LABELS = { ..., BNBUSDT: 'BNB' };
```
 
## Dependências externas
 
Apenas uma, carregada via CDN:
- **Chart.js 4.4.1** — `cdnjs.cloudflare.com`
 
Sem npm, sem build, sem framework.
 
## Aviso legal
 
As sugestões de operação OCO são geradas por análise técnica algorítmica
e **não constituem recomendação financeira**. Valide sempre com sua própria
análise e gestão de risco antes de executar qualquer operação.