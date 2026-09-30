export const CLAIMS = ['centenindex_applies_pc200', 'jan2027_index_forecast_pc200'] as const;
export type ClaimKey = (typeof CLAIMS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  clientIds: string[];
  expertise: string[];
  team: string;
}

export interface Client {
  id: string;
  name: string;
  country: string;
  jointCommittee: string;
  employees: number;
}

export interface Claim {
  claim: string;
  value: string;
  quote: string;
}

export interface Source {
  id: string;
  type: string; // doc | client_agreement | teams
  title: string;
  country: string;
  clientId: string | null;
  ownerId: string | null;
  lastEdited: string;
  content: string;
  cachedClaims: Claim[];
}

export interface SourceAnalysis {
  claims: Claim[];
  mode: 'live' | 'cached';
  suspicious: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  question: string;
  leadId: string;
  memberIds: string[];
  sourceIds: string[];
  analysis: Record<string, SourceAnalysis>;
  createdAt: string;
}

export interface Question {
  id: string;
  projectId: string;
  askedBy: string;
  expertId: string;
  text: string;
  status: 'open' | 'answered';
  createdAt: string;
}

export interface VerifiedFact {
  id: string;
  projectId: string;
  claim: string;
  value: string;
  statement: string;
  verifiedBy: string;
  at: string;
}

export interface LogEntry {
  at: string;
  userId: string;
  action: string; // plain sentence fragment, e.g. "added 6 sources"
  targetId: string;
  projectId: string | null;
}

export interface WhyRow {
  factor: 'Authority' | 'Recency' | 'Owner' | 'Scope' | 'Consistency';
  points: number;
  reason: string;
}

export interface ScoreResult {
  total: number;
  parts: { authority: number; recency: number; owner: number; scope: number; consistency: number };
  why: WhyRow[];
}

export interface ConflictQuote {
  sourceId: string;
  value: string;
  quote: string;
}

export interface Conflict {
  claim: string;
  values: string[];
  quotes: ConflictQuote[];
}
