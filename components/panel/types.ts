import type { Claim, Conflict, ScoreResult } from '@/lib/types';

export interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  sourceCount: number;
}

export interface PanelSource {
  id: string;
  type: string;
  title: string;
  owner: string | null;
  lastEdited: string;
  mode: 'live' | 'cached';
  suspicious: boolean;
  claims: Claim[];
  score: ScoreResult | null;
}

export interface ProjectData {
  project: { id: string; name: string; question: string; clientName: string; leadName: string; isLead: boolean };
  sources: PanelSource[];
  conflicts: Conflict[];
  facts: { id: string; claim: string; value: string; statement: string; verifiedByName: string; at: string }[];
  suggestedExpert: { id: string; name: string; email: string; team: string };
  questions: { id: string; text: string; status: 'open' | 'answered'; expertId: string; expertName: string; createdAt: string }[];
  log: { at: string; text: string }[];
}

export interface InboxItem {
  id: string;
  text: string;
  status: 'open' | 'answered';
  createdAt: string;
  askedByName: string;
  projectName: string;
  conflicts: { claim: string; values: string[]; quotes: (Conflict['quotes'][number] & { title: string })[] }[];
}

export async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: 'no-store' });
  return res.ok ? ((await res.json()) as T) : null;
}

export async function postJson(url: string, body: unknown) {
  return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
