interface Props {
  mode: 'actual' | 'prediccion';
  onChange: (mode: 'actual' | 'prediccion') => void;
}

export default function PredictionToggle({ mode, onChange }: Props) {
  return (
    <div className="prediction-toggle">
      <button
        className={`prediction-toggle-btn ${mode === 'actual' ? 'active' : ''}`}
        onClick={() => onChange('actual')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Estado Actual
      </button>
      <button
        className={`prediction-toggle-btn ${mode === 'prediccion' ? 'active' : ''}`}
        onClick={() => onChange('prediccion')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        Predicción LED
      </button>
    </div>
  );
}
