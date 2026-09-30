import { Project, Question, Source, User } from './types';

export const isMember = (user: User, project: Project) =>
  project.leadId === user.id || project.memberIds.includes(user.id);

export const canAccessProject = isMember;
export const isLead = (user: User, project: Project) => project.leadId === user.id;

/** Only the assigned expert, and only while the question is open. */
export const canVerify = (user: User, question: Question) =>
  question.expertId === user.id && question.status === 'open';

/** Catalog visibility: same country, or a client the user is assigned to. */
export const canSeeSource = (user: User, source: Source) =>
  source.country === user.country || (source.clientId !== null && user.clientIds.includes(source.clientId));
