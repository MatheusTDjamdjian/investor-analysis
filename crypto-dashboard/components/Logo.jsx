// components/Logo.jsx
// Marca do projeto: três barras ascendentes (mesmo desenho de public/favicon.svg).

export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="1" y="1" width="62" height="62" rx="15" fill="#0e1013" stroke="#2a3038" strokeWidth="2" />
      <rect x="15" y="35" width="7" height="15" rx="2" fill="#5d6470" />
      <rect x="28.5" y="25" width="7" height="25" rx="2" fill="#9ba2ad" />
      <rect x="42" y="14" width="7" height="36" rx="2" fill="var(--accent)" />
    </svg>
  );
}
