import { findConflicts, scoreSource, TODAY } from './scoring';
import { getClient, getFacts, getSource, getUser, getUsers } from './store';
import { Project, Source, SourceAnalysis, User } from './types';

const SUSPICIOUS = /ignore (all )?previous instructions|admin mode|reveal/i;

/** Cached claims only for now; drop any quote that is not a literal substring of the source. */
export function analyseSource(source: Source): SourceAnalysis {
  if (SUSPICIOUS.test(source.content)) return { claims: [], mode: 'cached', suspicious: true };
  const claims = source.cachedClaims.filter((c) => source.content.includes(c.quote));
  return { claims, mode: 'cached', suspicious: false };
}

export function suggestExpert(project: Project): User {
  return getUsers().find((u) => u.expertise.includes('indexation')) ?? getUser(project.leadId)!;
}

/** Everything the side panel needs for one project. Caller has already checked access. */
export function projectView(project: Project) {
  const facts = getFacts(project.id);
  const client = getClient(project.clientId);
  const picked = project.sourceIds.map(getSource).filter((s): s is Source => !!s);
  const analysed = picked.map((s) => ({ source: s, analysis: project.analysis[s.id] ?? analyseSource(s) }));
  const clean = analysed.filter((a) => !a.analysis.suspicious);

  const conflicts = findConflicts(
    clean.map((a) => ({ sourceId: a.source.id, claims: a.analysis.claims })),
    facts
  );

  const users = getUsers();
  const sources = analysed
    .map(({ source, analysis }) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      owner: source.ownerId ? getUser(source.ownerId)?.name ?? null : null,
      lastEdited: source.lastEdited,
      mode: analysis.mode,
      suspicious: analysis.suspicious,
      claims: analysis.claims,
      score: analysis.suspicious
        ? null
        : scoreSource(source, {
            clientId: project.clientId,
            clientCountry: client?.country ?? 'BE',
            leadId: project.leadId,
            users,
            today: TODAY,
            facts,
            openConflictClaims: conflicts.map((c) => c.claim),
            claims: analysis.claims,
          }),
    }))
    .sort((a, b) => (b.score?.total ?? -1) - (a.score?.total ?? -1));

  const expert = suggestExpert(project);
  return {
    sources,
    conflicts,
    facts: facts.map((f) => ({ ...f, verifiedByName: getUser(f.verifiedBy)?.name ?? '' })),
    suggestedExpert: { id: expert.id, name: expert.name, email: expert.email, team: expert.team },
  };
}
