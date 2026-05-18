// pages/_document.jsx
// Stylesheets externos precisam ser declarados aqui em vez de next/head.
// Next 16 emite warning quando <link rel="stylesheet"> aparece em next/head
// porque isso quebra otimização de carregamento de CSS no client.
// Ref: https://nextjs.org/docs/messages/no-stylesheets-in-head-component

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
