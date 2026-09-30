import { User, Project } from './types';

export function isMember(user: any, project: Project): boolean {
  return project.memberIds.includes(user.id) || project.leadId === user.id;
}

export function canAccessProject(user: any, project: Project): boolean {
  return isMember(user, project);
}

export function canVerify(user: any, question: { expertId: string }): boolean {
  return user.id === question.expertId;
}

export function visibleSources(user: any, sourceCountry: string, sourceClientId: string | null): boolean {
  // Same country or clientId in user.clientIds
  return sourceCountry === user.country || !!(sourceClientId && user.clientIds.includes(sourceClientId));
}
