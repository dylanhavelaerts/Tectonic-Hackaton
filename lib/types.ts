export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consultant' | 'teamlead' | 'expert';
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
  type: 'doc' | 'client_agreement' | 'teams';
  title: string;
  country: string;
  clientId: string | null;
  ownerId: string | null;
  lastEdited: string;
  content: string;
  cachedClaims: Claim[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  question: string;
  leadId: string;
  memberIds: string[];
  sourceIds: string[];
  analysis: Record<
    string,
    {
      claims: Claim[];
      mode: 'live' | 'cached';
      suspicious: boolean;
    }
  >;
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
  action: string;
  targetId: string;
}

export interface ScoreResult {
  total: number;
  parts: {
    authority: number;
    recency: number;
    owner: number;
    scope: number;
    consistency: number;
  };
  why: string[];
}
