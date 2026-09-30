import { Source, User, Project, VerifiedFact, ScoreResult } from './types';

export function scoreSource(
  source: Source,
  ctx: {
    clientId: string;
    leadId: string;
    users: User[];
    today: string;
    verifiedFacts: VerifiedFact[];
  }
): ScoreResult {
  const parts = {
    authority: 0,
    recency: 0,
    owner: 0,
    scope: 0,
    consistency: 0,
  };
  const why: string[] = [];

  // Authority: owner expertise on indexation, assigned to client, same team, other, none
  if (source.ownerId) {
    const owner = ctx.users.find((u) => u.id === source.ownerId);
    if (owner?.expertise.includes('indexation')) {
      parts.authority = 30;
      why.push('Author expert in indexation (+30)');
    } else if (owner?.clientIds.includes(ctx.clientId)) {
      parts.authority = 25;
      why.push('Author assigned to project client (+25)');
    } else if (owner?.team === ctx.users.find((u) => u.id === ctx.leadId)?.team) {
      parts.authority = 15;
      why.push('Author same team as lead (+15)');
    } else {
      parts.authority = 5;
      why.push('Author other team (+5)');
    }
  } else {
    parts.authority = 0;
    why.push('No owner identified (0)');
  }

  // Teams sources max 15
  if (source.type === 'teams' && parts.authority > 15) {
    parts.authority = 15;
    why[why.length - 1] = why[why.length - 1].replace(/\(\+\d+\)/, '(+15, teams capped)');
  }

  // Recency: <90d from today, <365d, else 5
  const editDate = new Date(source.lastEdited);
  const today = new Date(ctx.today);
  const daysOld = Math.floor((today.getTime() - editDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysOld < 90) {
    parts.recency = 25;
    why.push(`Edited ${daysOld}d ago (+25)`);
  } else if (daysOld < 365) {
    parts.recency = 15;
    why.push(`Edited ${daysOld}d ago (+15)`);
  } else {
    parts.recency = 5;
    why.push(`Edited ${daysOld}d ago (+5)`);
  }

  // Owner: present = 15, none = 0
  parts.owner = source.ownerId ? 15 : 0;
  if (parts.owner > 0) {
    why.push('Source has owner (+15)');
  }

  // Scope: same country + (clientId null or = projectClient) = 15, else 0
  if (source.country === ctx.users.find((u) => u.id === ctx.leadId)?.country) {
    if (!source.clientId || source.clientId === ctx.clientId) {
      parts.scope = 15;
      why.push('Scope: same country & client (+15)');
    }
  }

  // Consistency: check against verified facts
  const conflictingFacts = ctx.verifiedFacts.filter((f) => {
    const sourceClaim = source.cachedClaims.find((c) => c.claim === f.claim);
    return sourceClaim && sourceClaim.value !== f.value;
  });

  if (conflictingFacts.length === 0) {
    parts.consistency = 15;
    why.push('No conflicts with verified facts (+15)');
  } else {
    parts.consistency = 0;
    why.push(`Contradicts ${conflictingFacts.length} verified fact(s) (0)`);
  }

  // Apply consistency cap for open conflicts
  if (ctx.verifiedFacts.length === 0) {
    // No verified facts yet, open conflict scenario
    const allClaims = source.cachedClaims.map((c) => c.claim);
    const hasConflicts = allClaims.length > 0; // simplified for demo
    if (hasConflicts) {
      parts.consistency = Math.min(parts.consistency, 7);
      if (parts.consistency === 15) {
        parts.consistency = 7;
        why[why.length - 1] = 'Open conflict: other sources disagree (+7)';
      }
    }
  }

  // Cap consistency at 40 total if contradicts verified fact
  const total =
    parts.authority + parts.recency + parts.owner + parts.scope + parts.consistency;
  let finalTotal = total;

  if (conflictingFacts.length > 0) {
    finalTotal = Math.min(total, 40);
  }

  return {
    total: finalTotal,
    parts,
    why,
  };
}

export function scoreProject(
  project: Project,
  sources: Source[],
  users: User[],
  facts: VerifiedFact[],
  today: string
) {
  const scores = project.sourceIds.map((sourceId) => {
    const source = sources.find((s) => s.id === sourceId);
    if (!source) return null;

    return {
      sourceId,
      ...scoreSource(source, {
        clientId: project.clientId,
        leadId: project.leadId,
        users,
        today,
        verifiedFacts: facts.filter((f) => f.projectId === project.id),
      }),
    };
  });

  return scores.filter(Boolean);
}
