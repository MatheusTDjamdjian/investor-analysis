// components/CategoryTabs.jsx
// Menu de categorias: Criptomoedas / Ações Brasil / Ações Globais.

import { CATEGORIES } from '@/lib/categories';

export default function CategoryTabs({ active, onSelect }) {
  return (
    <nav className="topbar-nav">
      <div className="segmented" role="tablist" aria-label="Categorias de ativos">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={cat.id === active}
            onClick={() => onSelect(cat.id)}
          >
            {cat.label}
            <span className="count">{String(cat.assets.length).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
