import { FACULTADES } from '../../types/luminaria';

interface Props {
  selected: string;
  onChange: (facultad: string) => void;
  filteredCount: number;
  totalCount: number;
}

export default function FacultyFilter({ selected, onChange, filteredCount, totalCount }: Props) {
  return (
    <div className="faculty-filter">
      <div className="faculty-filter-control">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="faculty-filter-icon">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <select
          className="faculty-filter-select"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          {FACULTADES.map((f) => (
            <option key={f} value={f}>
              {f.replace('Todas las facultades', 'Todas las facultades')}
            </option>
          ))}
        </select>
      </div>
      <div className="faculty-filter-count">
        {filteredCount}/{totalCount}
      </div>
    </div>
  );
}
