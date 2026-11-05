// components/AssetSelector.jsx
// Watchlist com os ativos da categoria ativa.
// Desktop: coluna lateral. Telas estreitas: faixa horizontal rolável (ver globals.css).

import { swatchColor } from '@/lib/categories';

export default function AssetSelector({ title, assets, active, onSelect }) {
  return (
    <aside className="panel watchlist" aria-label={title}>
      <div className="watchlist-head">
        <span className="label">{title}</span>
        <span className="label">{String(assets.length).padStart(2, '0')}</span>
      </div>
      <div className="watchlist-list">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            className="watch-item"
            aria-current={asset.symbol === active}
            onClick={() => onSelect(asset.symbol)}
          >
            <span className="watch-swatch" style={{ background: swatchColor(asset) }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span className="watch-ticker">{asset.base}</span>
              <span className="watch-name">{asset.name}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
