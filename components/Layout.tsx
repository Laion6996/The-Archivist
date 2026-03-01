
import React from 'react';
import { Archive, LayoutDashboard, PlusCircle, Database, Settings, ShieldAlert, Trash2, Brain } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'archive' | 'vault' | 'advisor';
  setActiveTab: (tab: 'dashboard' | 'archive' | 'vault' | 'advisor') => void;
  onResetData?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onResetData }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Archive size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">The Archivist</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Resto-Intelligence v3.5</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Brain size={20} />} 
            label="Le Conseiller" 
            active={activeTab === 'advisor'} 
            onClick={() => setActiveTab('advisor')} 
          />
          <NavItem 
            icon={<PlusCircle size={20} />} 
            label="Nouvelle Ingestion" 
            active={activeTab === 'archive'} 
            onClick={() => setActiveTab('archive')} 
          />
          <NavItem 
            icon={<Database size={20} />} 
            label="Base de Connaissances" 
            active={activeTab === 'vault'} 
            onClick={() => setActiveTab('vault')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-slate-500 font-mono uppercase">
            <ShieldAlert size={14} className="text-amber-500" />
            System Status: Nominal
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-800">
              <Settings size={14} />
              Config
            </button>
            {onResetData && (
              <button 
                onClick={onResetData}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
                title="Mode Test: Reset Archive"
              >
                <Trash2 size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
      ${active 
        ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-indigo-500/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
  >
    <span className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
    {label}
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />}
  </button>
);
