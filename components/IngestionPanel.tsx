
import React, { useState, useRef } from 'react';
import { Upload, FileText, Camera, Mic, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ArchivistResponse } from '../types';

interface IngestionPanelProps {
  onProcessed: (data: ArchivistResponse | ArchivistResponse[], raw: any) => void;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({ onProcessed }) => {
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<{ name: string; base64: string; type: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    (Array.from(uploadedFiles) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFiles(prev => [...prev, { name: file.name, base64: base64String, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!inputText && files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const gemini = new GeminiService();

    try {
      let result: ArchivistResponse[];
      // Using archive() instead of non-existent processInput()
      if (files.length > 0) {
        // Wrapping image data in inlineData as required by the Gemini SDK
        const imageData = files.map(f => ({ 
          inlineData: {
            data: f.base64, 
            mimeType: f.type 
          }
        }));
        const prompt = inputText ? `Contexte utilisateur: ${inputText}. Analyse ces documents de manière exhaustive.` : "Analyse ces documents de manière exhaustive.";
        result = await gemini.archive(imageData, true, prompt);
      } else {
        result = await gemini.archive(inputText, false);
      }

      onProcessed(result, files.length > 0 ? files : inputText);
      setSuccess(true);
      setInputText('');
      setFiles([]);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "L'Archiviste n'a pas pu traiter ce fragment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Ingestion Archive</h2>
        <p className="text-slate-400">Envoyez vos données brutes. L'Archiviste s'occupe de la structure.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Collez un transcript, tapez des notes d'inventaire, ou décrivez un incident..."
              className="w-full h-48 bg-transparent p-6 text-slate-200 resize-none outline-none placeholder:text-slate-600 font-medium"
            />
            <div className="bg-slate-950/50 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  title="Télécharger documents"
                >
                  <Upload size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Capture Caméra">
                  <Camera size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Transcript Vocal">
                  <Mic size={20} />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple 
                accept="image/*,application/pdf"
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (!inputText && files.length === 0)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                {isProcessing ? 'Analyse...' : 'Ingérer Fragment'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm">
              <CheckCircle2 size={18} />
              Données ingérées avec succès. Base de connaissances mise à jour.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full min-h-[200px] flex flex-col">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">File d'attente</h3>
            {files.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-48 pr-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-medium truncate text-slate-300">{file.name}</p>
                    </div>
                    <button 
                      onClick={() => removeFile(i)}
                      className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center">
                <Upload size={32} className="mb-2 opacity-20" />
                <p className="text-xs">File vide</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              BATCH SIZE: {files.length} ITEMS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
