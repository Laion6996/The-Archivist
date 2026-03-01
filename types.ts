
export enum Domain {
  FINANCE = 'FINANCE',
  STOCK_SOLID = 'STOCK_SOLID',
  STOCK_LIQUID = 'STOCK_LIQUID',
  HR_STAFF = 'HR_STAFF',
  INCIDENT_LOG = 'INCIDENT_LOG',
  RESTO_PROFILE = 'RESTO_PROFILE',
  EVENTS_CONTEXT = 'EVENTS_CONTEXT'
}

export interface ArchivistResponse {
  domain: Domain;
  doc_type?: string;
  supplier?: string;
  date?: string;
  total_ttc?: number;
  items?: any[];
  action_required?: boolean;
  summary: string;
  urgency?: 'Low' | 'Medium' | 'High' | 'Critical';
  location?: string;
  price_variance_unit?: number;
  [key: string]: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type StrategicBriefing = string;

export interface ArchivistEntry {
  id: string;
  timestamp: number;
  rawInput: string | any;
  parsedData: ArchivistResponse;
}
