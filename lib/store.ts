import { Project, Question, VerifiedFact, LogEntry } from './types';
import usersData from '@/data/users.json';
import clientsData from '@/data/clients.json';
import sourcesData from '@/data/sources.json';

interface Store {
  users: typeof usersData;
  clients: typeof clientsData;
  sources: typeof sourcesData;
  projects: Project[];
  questions: Question[];
  facts: VerifiedFact[];
  log: LogEntry[];
}

function getStore(): Store {
  if (!globalThis.__ripple_store) {
    globalThis.__ripple_store = {
      users: usersData,
      clients: clientsData,
      sources: sourcesData,
      projects: [],
      questions: [],
      facts: [],
      log: [],
    };
  }
  return globalThis.__ripple_store;
}

export function createProject(data: Omit<Project, 'id' | 'analysis' | 'createdAt'>): Project {
  const store = getStore();
  const id = crypto.randomUUID();
  const project: Project = {
    ...data,
    id,
    analysis: {},
    createdAt: new Date().toISOString(),
  };
  store.projects.push(project);
  addLogEntry('create_project', id, data.leadId);
  return project;
}

export function getProjects() {
  return getStore().projects;
}

export function getProject(id: string) {
  return getStore().projects.find((p) => p.id === id);
}

export function updateProject(id: string, updates: Partial<Project>) {
  const store = getStore();
  const project = store.projects.find((p) => p.id === id);
  if (project) {
    Object.assign(project, updates);
  }
  return project;
}

export function createQuestion(data: Omit<Question, 'id' | 'createdAt'>): Question {
  const store = getStore();
  const id = crypto.randomUUID();
  const question: Question = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  store.questions.push(question);
  addLogEntry('create_question', id, data.askedBy);
  return question;
}

export function getQuestions(projectId?: string) {
  const store = getStore();
  if (projectId) {
    return store.questions.filter((q) => q.projectId === projectId);
  }
  return store.questions;
}

export function getQuestion(id: string) {
  return getStore().questions.find((q) => q.id === id);
}

export function updateQuestion(id: string, updates: Partial<Question>) {
  const store = getStore();
  const question = store.questions.find((q) => q.id === id);
  if (question) {
    Object.assign(question, updates);
  }
  return question;
}

export function createFact(data: Omit<VerifiedFact, 'id'>): VerifiedFact {
  const store = getStore();
  const id = crypto.randomUUID();
  const fact: VerifiedFact = {
    ...data,
    id,
  };
  store.facts.push(fact);
  addLogEntry('verify_fact', id, data.verifiedBy);
  return fact;
}

export function getFacts(projectId?: string) {
  const store = getStore();
  if (projectId) {
    return store.facts.filter((f) => f.projectId === projectId);
  }
  return store.facts;
}

export function addLogEntry(action: string, targetId: string, userId: string) {
  const store = getStore();
  store.log.push({
    at: new Date().toISOString(),
    userId,
    action,
    targetId,
  });
}

export function getLog(limit = 100) {
  const store = getStore();
  return store.log.slice(-limit).reverse();
}

export function getUsers() {
  return getStore().users;
}

export function getUser(id: string) {
  return getStore().users.find((u) => u.id === id);
}

export function getClients() {
  return getStore().clients;
}

export function getClient(id: string) {
  return getStore().clients.find((c) => c.id === id);
}

export function getSources() {
  return getStore().sources;
}

export function getSource(id: string) {
  return getStore().sources.find((s) => s.id === id);
}

declare global {
  var __ripple_store: Store | undefined;
}
