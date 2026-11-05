// components/CategoryTabs.jsx
// Menu de categorias: Criptomoedas / Ações Brasil / Ações Globais.

import { CATEGORIES } from '@/lib/categories';

export default function CategoryTabs({ active, onSelect }) {
  return (
    <nav
      role="tablist"
      aria-label="Categorias de ativos"
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        background: 'rgba(20,24,34,0.55)',
        border: '1px solid var(--border-soft)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflowX: 'auto',
        alignSelf: 'flex-start',
        maxWidth: '100%',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.id)}
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.2,
              background: isActive
                ? 'linear-gradient(120deg, rgba(110,140,255,0.28), rgba(180,120,255,0.22))'
                : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 6px 18px -10px rgba(110,140,255,0.6)' : 'none',
              transition: 'all 160ms ease',
            }}
          >
            <span
              style={{
                minWidth: 22,
                height: 22,
                padding: '0 5px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: cat.icon.length > 1 ? 9 : 12,
                fontWeight: 800,
                background: isActive
                  ? 'linear-gradient(135deg, #6e8cff, #b478ff)'
                  : 'rgba(255,255,255,0.06)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {cat.icon}
            </span>
            {cat.label}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
              {cat.assets.length}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
