// components/CurrencyToggle.jsx
// Toggle entre dólar (USD) e real (BRL).
// showRate: exibe a cotação USD-BRL quando há conversão em curso.

export default function CurrencyToggle({ currency, onChange, rate, updatedAt, showRate }) {
  const options = ['USD', 'BRL'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {showRate && (
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}
          title={updatedAt ? `Atualizado às ${new Date(updatedAt).toLocaleTimeString('pt-BR')}` : ''}
        >
          {rate
            ? `USD/BRL ${rate.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
            : 'USD/BRL …'}
        </span>
      )}
      <div className="segmented mono-buttons" role="group" aria-label="Moeda de exibição">
        {options.map((opt) => (
          <button key={opt} aria-pressed={opt === currency} onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
