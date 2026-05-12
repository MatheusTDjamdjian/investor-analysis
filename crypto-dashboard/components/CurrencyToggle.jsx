// components/CurrencyToggle.jsx
// Toggle entre dólar (USD) e real (BRL).

export default function CurrencyToggle({ currency, onChange, rate, updatedAt }) {
  const options = ['USD', 'BRL'];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(20,24,34,0.55)',
        border: '1px solid var(--border-soft)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex' }}>
        {options.map((opt) => {
          const isActive = opt === currency;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                cursor: 'pointer',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(120deg, #6e8cff, #b478ff)'
                  : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                transition: 'all 160ms ease',
                boxShadow: isActive
                  ? '0 6px 18px -8px rgba(110,140,255,0.55)'
                  : 'none',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {currency === 'BRL' && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            paddingRight: 10,
            whiteSpace: 'nowrap',
          }}
          title={updatedAt ? `Atualizado às ${new Date(updatedAt).toLocaleTimeString('pt-BR')}` : ''}
        >
          {rate
            ? `1 USD ≈ R$ ${rate.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
            : 'Carregando cotação…'}
        </span>
      )}
    </div>
  );
}
