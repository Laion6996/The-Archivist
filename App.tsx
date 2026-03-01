
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { IngestionPanel } from './components/IngestionPanel';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AdvisorChat } from './components/AdvisorChat';
import { ArchivistEntry, ArchivistResponse, StrategicBriefing, ChatMessage } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'archive' | 'vault' | 'advisor'>('dashboard');
  const [entries, setEntries] = useState<ArchivistEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('archivist_vault');
    const savedChat = localStorage.getItem('archivist_chat');
    if (saved) setEntries(JSON.parse(saved));
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  const handleProcessed = async (data: ArchivistResponse[], raw: any) => {
    const userInput = typeof raw === 'string' ? raw : (Array.isArray(raw) ? `[Envoi de ${raw.length} fichier(s)]` : 'Média Ingestéré');
    
    // 1. Mise à jour de l'Archive (si données JSON)
    if (data.length > 0) {
      const newEntries: ArchivistEntry[] = data.map((item, index) => ({
        id: `entry-${Date.now()}-${index}`,
        timestamp: Date.now(),
        rawInput: userInput,
        parsedData: item
      }));
      const updatedEntries = [...newEntries, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('archivist_vault', JSON.stringify(updatedEntries));
    }

    // 2. Déclencher le Conseiller
    setIsAnalyzing(true);
    try {
      const gemini = new GeminiService();
      
      const briefing = await gemini.advise(
        data, 
        userInput, 
        chatHistory.slice(-5)
      );

      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userInput },
        { role: 'assistant', content: briefing }
      ];
      
      const limitedHistory = newHistory.slice(-20); // On garde les 20 derniers messages
      setChatHistory(limitedHistory);
      localStorage.setItem('archivist_chat', JSON.stringify(limitedHistory));

      // Si on vient de l'ingestion, on bascule vers le conseiller pour voir la réponse
      if (activeTab === 'archive') {
        setActiveTab('advisor');
      }
    } catch (err) {
      console.error("Erreur Conseiller:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatReply = async (message: string) => {
    setIsAnalyzing(true);
    try {
      const gemini = new GeminiService();
      const archivistData = await gemini.archive(message, false);
      await handleProcessed(archivistData, message);
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm("🚨 ATTENTION: Voulez-vous vraiment supprimer toutes les données et l'historique ?")) {
      setEntries([]);
      setChatHistory([]);
      localStorage.removeItem('archivist_vault');
      localStorage.removeItem('archivist_chat');
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onResetData={handleResetData}>
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <Dashboard entries={entries} onViewAll={() => setActiveTab('vault')} />
        )}
        {activeTab === 'advisor' && (
          <AdvisorChat 
            history={chatHistory} 
            isLoading={isAnalyzing} 
            onSendMessage={handleChatReply} 
          />
        )}
        {activeTab === 'archive' && (
          <IngestionPanel onProcessed={handleProcessed} />
        )}
        {activeTab === 'vault' && (
          <KnowledgeBase entries={entries} />
        )}
      </div>
    </Layout>
  );
};

export default App;
