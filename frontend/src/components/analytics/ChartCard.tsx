import type { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  full?: boolean;
}

export default function ChartCard({ title, description, children, full = false }: Props) {
  return (
    <div className={`analytics-card${full ? ' full' : ''}`}>
      <div className="analytics-card-title">{title}</div>
      <p className="analytics-card-desc">{description}</p>
      {children}
    </div>
  );
}
