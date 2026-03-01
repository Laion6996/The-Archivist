
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Brain, Send, Loader2, Zap, User, Sparkles } from 'lucide-react';

interface AdvisorChatProps {
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ history, isLoading, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const isHeader = line.startsWith('#') || line.startsWith('- 🛑') || line.startsWith('- 💰') || line.startsWith('- 📦') || line.startsWith('- 💡');
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      
      return (
        <div key={i} className={`mb-1 ${isHeader ? 'font-bold text-indigo-300 mt-2' : ''} ${isBullet ? 'pl-4' : ''}`}>
          {line.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index} className="text-white">{part}</strong> : part
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Directeur Stratégique</h2>
            <p className="text-slate-500 text-sm">Votre coach opérationnel disponible 24/7.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <Sparkles size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Analyse Continue</span>
        </div>
      </header>

      {/* Chat Display */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6"
      >
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-4">
            <Brain size={64} className="opacity-10" />
            <div>
              <p className="text-lg font-medium">Prêt pour le briefing, Hoel.</p>
              <p className="text-sm">Envoie un document ou pose une question sur l'exploitation.</p>
            </div>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Brain size={16} />}
              </div>
              
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700' 
                  : 'bg-slate-900 border border-indigo-500/20 text-slate-200 rounded-tl-none border-l-4 border-l-indigo-500'}`}>
                {formatContent(msg.content)}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-400" size={16} />
            </div>
            <div className="bg-slate-900/50 h-16 w-48 rounded-2xl rounded-tl-none border border-slate-800" />
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Pose une question stratégique ou réponds au Conseiller..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-slate-200"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-3 flex items-center gap-4 px-2">
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-indigo-500" />
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Hoel, je t'écoute</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-700" />
          <span className="text-[10px] text-slate-600 font-mono">CONTEXTE: {history.length} MESSAGES EN MÉMOIRE</span>
        </div>
      </div>
    </div>
  );
};
