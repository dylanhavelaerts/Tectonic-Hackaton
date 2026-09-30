import { Client, LogEntry, Project, Question, Source, User, VerifiedFact } from './types';
import usersData from '@/data/users.json';
import clientsData from '@/data/clients.json';
import sourcesData from '@/data/sources.json';

interface Store {
  projects: Project[];
  questions: Question[];
  facts: VerifiedFact[];
  log: LogEntry[];
}

declare global {
  var __ripple_store: Store | undefined;
}

function store(): Store {
  globalThis.__ripple_store ??= { projects: [], questions: [], facts: [], log: [] };
  return globalThis.__ripple_store;
}

const users = usersData as User[];
const clients = clientsData as Client[];
const sources = sourcesData as Source[];

export const getUsers = () => users;
export const getUser = (id: string) => users.find((u) => u.id === id);
export const getClients = () => clients;
export const getClient = (id: string) => clients.find((c) => c.id === id);
export const getSources = () => sources;
export const getSource = (id: string) => sources.find((s) => s.id === id);

export function addLog(userId: string, action: string, targetId: string, projectId: string | null) {
  store().log.push({ at: new Date().toISOString(), userId, action, targetId, projectId });
}

export function getProjectLog(projectId: string) {
  return store().log.filter((e) => e.projectId === projectId);
}

export function createProject(data: Omit<Project, 'id' | 'analysis' | 'createdAt'>): Project {
  const project: Project = { ...data, id: crypto.randomUUID(), analysis: {}, createdAt: new Date().toISOString() };
  store().projects.push(project);
  addLog(data.leadId, 'created the project', project.id, project.id);
  return project;
}

export const getProjects = () => store().projects;
export const getProject = (id: string) => store().projects.find((p) => p.id === id);

export function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'status'>): Question {
  const q: Question = { ...data, id: crypto.randomUUID(), status: 'open', createdAt: new Date().toISOString() };
  store().questions.push(q);
  return q;
}

export const getQuestions = () => store().questions;
export const getQuestion = (id: string) => store().questions.find((q) => q.id === id);

export function createFact(data: Omit<VerifiedFact, 'id' | 'at'>): VerifiedFact {
  const fact: VerifiedFact = { ...data, id: crypto.randomUUID(), at: new Date().toISOString() };
  store().facts.push(fact);
  return fact;
}

export const getFacts = (projectId: string) => store().facts.filter((f) => f.projectId === projectId);
