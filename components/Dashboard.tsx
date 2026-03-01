
import React from 'react';
import { ArchivistEntry, Domain } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Receipt, Boxes, Wine, Users, AlertTriangle, ArrowUpRight, Store, CalendarDays } from 'lucide-react';

interface DashboardProps {
  entries: ArchivistEntry[];
  onViewAll: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, onViewAll }) => {
  const stats = React.useMemo(() => {
    const domainCounts = {
      [Domain.FINANCE]: 0,
      [Domain.STOCK_SOLID]: 0,
      [Domain.STOCK_LIQUID]: 0,
      [Domain.HR_STAFF]: 0,
      [Domain.INCIDENT_LOG]: 0,
      [Domain.RESTO_PROFILE]: 0,
      [Domain.EVENTS_CONTEXT]: 0,
    };

    entries.forEach(e => {
      domainCounts[e.parsedData.domain]++;
    });

    return [
      { name: 'Finance', count: domainCounts[Domain.FINANCE], icon: <Receipt />, color: '#6366f1', bg: 'bg-indigo-500/10' },
      { name: 'Stocks', count: domainCounts[Domain.STOCK_SOLID] + domainCounts[Domain.STOCK_LIQUID], icon: <Boxes />, color: '#22c55e', bg: 'bg-green-500/10' },
      { name: 'RH', count: domainCounts[Domain.HR_STAFF], icon: <Users />, color: '#06b6d4', bg: 'bg-cyan-500/10' },
      { name: 'Profil', count: domainCounts[Domain.RESTO_PROFILE], icon: <Store />, color: '#8b5cf6', bg: 'bg-purple-500/10' },
      { name: 'Events', count: domainCounts[Domain.EVENTS_CONTEXT], icon: <CalendarDays />, color: '#ec4899', bg: 'bg-pink-500/10' },
    ];
  }, [entries]);

  const recentIncidents = entries
    .filter(e => e.parsedData.domain === Domain.INCIDENT_LOG)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-slate-400 text-sm font-mono tracking-widest uppercase mb-1">Status Report</p>
          <h2 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h2>
        </div>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          Access Knowledge Base <ArrowUpRight size={16} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <div key={stat.name} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-all group">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 20, style: { color: stat.color } })}
            </div>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">{stat.name}</p>
            <p className="text-2xl font-bold mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Archive Distribution
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono tracking-tighter">Live</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6 text-amber-500 flex items-center gap-2">
            <AlertTriangle size={18} /> Alertes Récentes
          </h3>
          <div className="space-y-4">
            {recentIncidents.length > 0 ? (
              recentIncidents.map(inc => (
                <div key={inc.id} className="p-4 bg-slate-950/50 border-l-2 border-amber-500 rounded-r-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-amber-500 uppercase font-bold px-2 py-0.5 bg-amber-500/10 rounded">
                      {inc.parsedData.urgency || 'Alert'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{inc.parsedData.summary}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center">
                <p className="text-sm">Rien à signaler, Hoel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
