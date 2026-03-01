
import React, { useState, useEffect } from 'react';
import { ArchivistEntry, Domain } from '../types';
import { Search, ChevronRight, FileJson, Clock, Calendar, Tag, Database, Store, CalendarDays, Receipt, Boxes, Wine, Users, AlertTriangle } from 'lucide-react';

interface KnowledgeBaseProps {
  entries: ArchivistEntry[];
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState<Domain | 'ALL'>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<ArchivistEntry | null>(null);

  // Initialisation de la sélection au premier chargement si on a des entrées
  useEffect(() => {
    if (!selectedEntry && entries.length > 0) {
      setSelectedEntry(entries[0]);
    }
  }, [entries]);

  const filteredEntries = entries.filter(e => {
    const summary = e.parsedData?.summary || '';
    const supplier = e.parsedData?.supplier || '';
    const matchesSearch = summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'ALL' || e.parsedData?.domain === filterDomain;
    return matchesSearch && matchesDomain;
  }).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Base de Connaissances</h2>
          <p className="text-slate-500 text-sm">Mémoire unifiée de l'intelligence de votre restaurant.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer text-slate-200"
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value as any)}
          >
            <option value="ALL">Tous les domaines</option>
            {Object.values(Domain).map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
          </select>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Archives</span>
            <span className="text-[10px] text-slate-600">{filteredEntries.length} Enregistrements</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredEntries.length > 0 ? filteredEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group
                  ${selectedEntry?.id === entry.id ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-slate-800/40 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                  ${getDomainColor(entry.parsedData?.domain).bg}`}>
                  <span className={getDomainColor(entry.parsedData?.domain).text}>
                    {getIconForDomain(entry.parsedData?.domain)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold truncate text-slate-200">{entry.parsedData?.summary || 'Sans titre'}</p>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${getDomainColor(entry.parsedData?.domain).bg} ${getDomainColor(entry.parsedData?.domain).text}`}>
                    {(entry.parsedData?.domain || 'Unknown').replace('_', ' ')}
                  </span>
                </div>
                <ChevronRight size={14} className={`text-slate-600 group-hover:translate-x-1 transition-transform ${selectedEntry?.id === entry.id ? 'text-indigo-400' : ''}`} />
              </button>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                <Search size={48} className="mb-4 opacity-10" />
                <p>Aucun résultat.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          {selectedEntry ? (
            <>
              <div className="p-6 border-b border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{selectedEntry.parsedData?.summary || 'Détails du fragment'}</h3>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={14} className="text-slate-500" />
                        {new Date(selectedEntry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider 
                    ${getDomainColor(selectedEntry.parsedData?.domain).bg} ${getDomainColor(selectedEntry.parsedData?.domain).text}`}>
                    {selectedEntry.parsedData?.domain || 'UNKNOWN'}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {selectedEntry.parsedData?.total_ttc && (
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Montant Total</p>
                      <p className="text-2xl font-bold text-indigo-400">€{selectedEntry.parsedData.total_ttc.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedEntry.parsedData?.event_date && (
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-pink-500/20">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Date Événement</p>
                      <p className="text-xl font-bold text-pink-400">{selectedEntry.parsedData.event_date}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500">
                    <FileJson size={14} />
                    Payload Structuré
                  </div>
                  <pre className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedEntry.parsedData, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              <Database size={64} className="mb-4 opacity-5" />
              <p className="text-lg">Sélectionnez un fragment pour voir les détails.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fonctions d'aide
function getIconForDomain(domain?: Domain) {
  switch (domain) {
    case Domain.FINANCE: return <Receipt size={18} />;
    case Domain.STOCK_SOLID: return <Boxes size={18} />;
    case Domain.STOCK_LIQUID: return <Wine size={18} />;
    case Domain.HR_STAFF: return <Users size={18} />;
    case Domain.INCIDENT_LOG: return <AlertTriangle size={18} />;
    case Domain.RESTO_PROFILE: return <Store size={18} />;
    case Domain.EVENTS_CONTEXT: return <CalendarDays size={18} />;
    default: return <Tag size={18} />;
  }
}

function getDomainColor(domain?: Domain) {
  switch (domain) {
    case Domain.FINANCE: return { bg: 'bg-indigo-500/10', text: 'text-indigo-400' };
    case Domain.STOCK_SOLID: return { bg: 'bg-green-500/10', text: 'text-green-400' };
    case Domain.STOCK_LIQUID: return { bg: 'bg-rose-500/10', text: 'text-rose-400' };
    case Domain.HR_STAFF: return { bg: 'bg-cyan-500/10', text: 'text-cyan-400' };
    case Domain.INCIDENT_LOG: return { bg: 'bg-amber-500/10', text: 'text-amber-400' };
    case Domain.RESTO_PROFILE: return { bg: 'bg-purple-500/10', text: 'text-purple-400' };
    case Domain.EVENTS_CONTEXT: return { bg: 'bg-pink-500/10', text: 'text-pink-400' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-400' };
  }
}
