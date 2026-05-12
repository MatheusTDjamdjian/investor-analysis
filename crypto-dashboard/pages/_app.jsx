// pages/_app.jsx
// Carrega estilos globais (TailwindCSS + tokens de tema).

import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
