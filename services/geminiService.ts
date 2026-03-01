
import { GoogleGenAI, Type } from "@google/genai";
import { Domain, ArchivistResponse, StrategicBriefing, ChatMessage } from "../types";

const ARCHIVIST_PROMPT = `
Tu es l'Archiviste, le module d'intelligence sensorielle d'un système de gestion de restaurant. Ta mission : transformer tout ce qu'on te donne en données JSON structurées.

Règles d'or :
1. Ne résume jamais : Liste TOUS les produits, prix, quantités, lieux, plats ou événements.
2. Multitâche : Un message peut générer plusieurs objets JSON (ex: Nouveau Menu + Event local).
3. Si le message est purement conversationnel, réponds par un tableau vide [].
4. Zéro Bla-bla : Réponds uniquement avec un tableau JSON [].

Domaines & Schémas spécifiques :
- FINANCE : Factures, tickets Z (Fournisseur, Total TTC, TVA, Items).
- STOCK_SOLID / STOCK_LIQUID : Inventaire (Produit, Quantité, DLC, Lieu).
- HR_STAFF : RH (Nom, Type Doc, Dates, Taux horaire).
- INCIDENT_LOG : Maintenance (Type incident, Machine, Urgence: Low/Medium/High/Critical).
- RESTO_PROFILE : Carte/Menu/Structure (Plats, Prix, Capacité salle, Capacité terrasse, Adresse, Horaires). Tag: #Profil #Carte.
- EVENTS_CONTEXT : Facteurs externes (Nom Event, Date, Type: Météo/Sport/Culture/Vacances, Impact attendu). Tag: #Planning #Context.
`;

const ADVISOR_PROMPT = `
ROLE: Tu es le Directeur Stratégique du restaurant (Le Conseiller). 
CONTEXTE: Tu es dans une conversation continue avec Hoel via une app de messagerie (WhatsApp style).

MISSION:
- Tu analyses les données de l'Archiviste (Finance, Stocks, RH, Incidents, MAIS AUSSI le Profil Resto et le Contexte).
- Tu croises les infos : Si un concert arrive (EVENTS_CONTEXT), vérifie si les stocks (STOCK) sont suffisants.
- Si Hoel te pose une QUESTION : Réponds naturellement comme un collègue.

STYLE : 
Chaleureux, expert, direct et encourageant. Tu tutoies Hoel. Utilise le Markdown.

STRUCTURE (Pour les rapports complets) :
- 🛑 **URGENCES**
- 💰 **FINANCE**
- 📦 **LOGISTIQUE**
- 📅 **CONTEXTE & OPPORTUNITÉS** (Nouveau !)
- 💡 **CONSEIL STRATÉGIQUE**
`;

export class GeminiService {
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async archive(content: any, isImage: boolean = false, additionalPrompt?: string): Promise<ArchivistResponse[]> {
    const model = 'gemini-flash-lite-latest';
    let contents: any;

    if (isImage) {
      contents = { parts: [...content, { text: additionalPrompt || "Extraire toutes les données structurées." }] };
    } else {
      contents = additionalPrompt ? `${additionalPrompt}\n\n${content as string}` : content as string;
    }

    try {
      const result = await this.ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: ARCHIVIST_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      return JSON.parse(result.text || '[]');
    } catch (e) {
      console.error("Archivist Error:", e);
      return [];
    }
  }

  async advise(data: ArchivistResponse[], currentInput: string, history: ChatMessage[]): Promise<StrategicBriefing> {
    const model = 'gemini-3-flash-preview';
    const historyContext = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
    const dataContext = data.length > 0 ? `Données JSON Archiviste: ${JSON.stringify(data)}` : "Aucune nouvelle donnée structurée.";

    const prompt = `
HISTORIQUE CHAT:
${historyContext}

MESSAGE ACTUEL D'HOEL:
"${currentInput}"

${dataContext}

RÉPONDS À HOEL :
`;

    const result = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: ADVISOR_PROMPT,
        temperature: 0.7,
      }
    });

    return result.text || "Désolé Hoel, mon cerveau a eu un raté. On peut reprendre ?";
  }
}
