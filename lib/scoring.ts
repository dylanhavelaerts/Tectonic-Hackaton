import { Claim, Conflict, ScoreResult, Source, User, VerifiedFact } from './types';

export const TODAY = '2026-09-30';

export interface ScoreCtx {
  clientId: string;
  clientCountry: string;
  leadId: string;
  users: User[];
  today: string;
  facts: VerifiedFact[];
  openConflictClaims: string[];
  claims?: Claim[]; // defaults to source.cachedClaims
}

export function scoreSource(source: Source, ctx: ScoreCtx): ScoreResult {
  const claims = ctx.claims ?? source.cachedClaims;
  const owner = source.ownerId ? ctx.users.find((u) => u.id === source.ownerId) : undefined;
  const lead = ctx.users.find((u) => u.id === ctx.leadId);

  // Authority
  let authority = 0;
  let authorityWhy = 'No owner';
  if (owner) {
    if (owner.expertise.includes('indexation')) {
      authority = 30;
      authorityWhy = `${owner.name} is an indexation expert`;
    } else if (owner.clientIds.includes(ctx.clientId)) {
      authority = 25;
      authorityWhy = `${owner.name} is assigned to this client`;
    } else if (lead && owner.team === lead.team) {
      authority = 15;
      authorityWhy = `${owner.name} is on the lead's team`;
    } else {
      authority = 5;
      authorityWhy = `${owner.name} is outside the team`;
    }
  }
  if (source.type === 'teams' && authority > 15) {
    authority = 15;
    authorityWhy += ' (chat message, max 15)';
  }

  // Recency
  const days = Math.floor((Date.parse(ctx.today) - Date.parse(source.lastEdited)) / 86_400_000);
  const recency = days < 90 ? 25 : days < 365 ? 15 : 5;

  // Owner
  const ownerPts = owner ? 15 : 0;

  // Scope
  const scope =
    source.country === ctx.clientCountry && (source.clientId === null || source.clientId === ctx.clientId) ? 15 : 0;

  // Consistency
  const contradicted = ctx.facts.find((f) => claims.some((c) => c.claim === f.claim && c.value !== f.value));
  const confirmed = ctx.facts.find((f) => claims.some((c) => c.claim === f.claim && c.value === f.value));
  let consistency = 15;
  let consistencyWhy = confirmed ? 'Matches the verified answer' : 'No conflicts';
  if (contradicted) {
    consistency = 0;
    consistencyWhy = 'Contradicts the verified answer, capped at 40';
  } else if (claims.some((c) => ctx.openConflictClaims.includes(c.claim))) {
    consistency = 7;
    consistencyWhy = 'Other sources say something different';
  }

  const sum = authority + recency + ownerPts + scope + consistency;
  const total = contradicted ? Math.min(sum, 40) : sum;

  return {
    total,
    parts: { authority, recency, owner: ownerPts, scope, consistency },
    why: [
      { factor: 'Authority', points: authority, reason: authorityWhy },
      { factor: 'Recency', points: recency, reason: `Last edited ${days} days ago` },
      { factor: 'Owner', points: ownerPts, reason: owner ? 'Has a named owner' : 'Nobody owns this document' },
      {
        factor: 'Scope',
        points: scope,
        reason: scope ? 'Same country and client' : 'Different country or client',
      },
      { factor: 'Consistency', points: consistency, reason: consistencyWhy },
    ],
  };
}

/** Same claim, different value, and no verified fact for that claim yet. */
export function findConflicts(
  items: { sourceId: string; claims: Claim[] }[],
  facts: VerifiedFact[]
): Conflict[] {
  const byClaim = new Map<string, Conflict>();
  for (const { sourceId, claims } of items) {
    for (const c of claims) {
      const entry = byClaim.get(c.claim) ?? { claim: c.claim, values: [], quotes: [] };
      if (!entry.values.includes(c.value)) entry.values.push(c.value);
      entry.quotes.push({ sourceId, value: c.value, quote: c.quote });
      byClaim.set(c.claim, entry);
    }
  }
  return [...byClaim.values()].filter(
    (c) => c.values.length > 1 && !facts.some((f) => f.claim === c.claim)
  );
}
