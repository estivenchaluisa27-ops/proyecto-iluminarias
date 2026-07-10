import { useState } from 'react';
import { BarChart3, PieChart, Building2, GitCompare, Network, AlertTriangle } from 'lucide-react';
import ResumenTab from './tabs/ResumenTab';
import DistribucionesTab from './tabs/DistribucionesTab';
import FacultadTab from './tabs/FacultadTab';
import ComparativasTab from './tabs/ComparativasTab';
import RedesTab from './tabs/RedesTab';
import MissingTab from './tabs/MissingTab';
import type { LuminariaStats } from '../../types/luminaria';

export interface KpiData {
  total: number; funcionan: number; no_funcionan: number;
  led: number; sodio: number; con_medicion: number; sin_medicion: number;
  altura_promedio: number; luxes_promedio: number;
}

interface Props {
  stats: LuminariaStats | null;
}

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: PieChart },
  { id: 'distribuciones', label: 'Distribuciones', icon: BarChart3 },
  { id: 'facultad', label: 'Por Facultad', icon: Building2 },
  { id: 'comparativas', label: 'Comparativas', icon: GitCompare },
  { id: 'redes', label: 'Redes', icon: Network },
  { id: 'missing', label: 'Datos Faltantes', icon: AlertTriangle },
];

export default function AnalyticsDashboard({ stats }: Props) {
  const [activeTab, setActiveTab] = useState('resumen');

  const renderTab = () => {
    switch (activeTab) {
      case 'resumen': return <ResumenTab stats={stats} />;
      case 'distribuciones': return <DistribucionesTab />;
      case 'facultad': return <FacultadTab />;
      case 'comparativas': return <ComparativasTab />;
      case 'redes': return <RedesTab />;
      case 'missing': return <MissingTab />;
      default: return null;
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="analytics-content">
        {renderTab()}
      </div>
    </div>
  );
}
