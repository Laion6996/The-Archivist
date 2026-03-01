
import React, { useState, useRef, useEffect } from 'react';
import { StrategicBriefing } from '../types';
import { Brain, X, Loader2, Zap, Send } from 'lucide-react';

interface AdvisorInsightsProps {
  briefing: StrategicBriefing;
  isLoading: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export const AdvisorInsights: React.FC<AdvisorInsightsProps> = ({ briefing, isLoading, onClose, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand un nouveau message arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [briefing, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const formatBriefing = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      
      const isHeader = line.startsWith('#') || line.startsWith('- 🛑') || line.startsWith('- 💰') || line.startsWith('- 📦') || line.startsWith('- 💡');
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      
      return (
        <div key={i} className={`mb-2 ${isHeader ? 'font-bold text-indigo-300 text-lg mt-4' : 'text-slate-200 text-sm leading-relaxed'} ${isBullet ? 'pl-4' : ''}`}>
          {line.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index} className="text-white font-extrabold">{part}</strong> : part
          )}
        </div>
      );
    });
  };

  return (
    <div className="relative bg-slate-900 border-2 border-indigo-500/40 backdrop-blur-2xl rounded-3xl flex flex-col shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-300 border-l-[6px] border-l-indigo-600 overflow-hidden max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white leading-none">Le Conseiller</h2>
            <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mt-1">Chat Direct avec Hoel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="animate-spin text-indigo-400" size={18} />}
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors bg-slate-800/80 rounded-full">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40 custom-scrollbar scroll-smooth"
      >
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/50 shadow-inner">
          {formatBriefing(briefing)}
        </div>
        {isLoading && (
          <div className="flex gap-1 p-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Réponds au Conseiller ou pose une question..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-slate-200"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-2 px-2 flex items-center gap-2">
          <Zap size={10} className="text-indigo-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter font-mono">Le Conseiller se souvient de vos derniers échanges</span>
        </div>
      </div>
    </div>
  );
};
