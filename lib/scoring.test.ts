import { describe, it, expect } from 'vitest';
import { scoreSource } from './scoring';
import { Source, User, VerifiedFact } from './types';

describe('Scoring', () => {
  const users: User[] = [
    {
      id: 'u-lotte',
      name: 'Lotte',
      email: 'lotte@test.com',
      role: 'consultant',
      country: 'BE',
      clientIds: ['c-noord'],
      expertise: [],
      team: 'BE SME Payroll – PC 200',
    },
    {
      id: 'u-pieter',
      name: 'Pieter',
      email: 'pieter@test.com',
      role: 'expert',
      country: 'BE',
      clientIds: [],
      expertise: ['indexation', 'centenindex'],
      team: 'BE Legal & Social Law',
    },
  ];

  const d05: Source = {
    id: 'd-05',
    type: 'doc',
    title: 'Legal memo',
    country: 'BE',
    clientId: null,
    ownerId: 'u-pieter',
    lastEdited: '2026-06-10',
    content: 'centenindex applies',
    cachedClaims: [{ claim: 'centenindex_applies_pc200', value: 'yes', quote: 'applies' }],
  };

  it('d-05 scores 82 before verify', () => {
    const score = scoreSource(d05, {
      clientId: 'c-noord',
      leadId: 'u-lotte',
      users,
      today: '2026-09-30',
      verifiedFacts: [],
    });
    expect(score.total).toBe(82); // 30 + 15 + 15 + 15 + 7
  });

  it('d-05 scores 90 after Pieter verifies', () => {
    const fact: VerifiedFact = {
      id: 'vf-1',
      projectId: 'p-1',
      claim: 'centenindex_applies_pc200',
      value: 'yes',
      statement: 'Applies',
      verifiedBy: 'u-pieter',
      at: '2026-09-30T10:00:00Z',
    };

    const score = scoreSource(d05, {
      clientId: 'c-noord',
      leadId: 'u-lotte',
      users,
      today: '2026-09-30',
      verifiedFacts: [fact],
    });
    expect(score.total).toBe(90); // 30 + 15 + 15 + 15 + 15
  });

  it('conflicting source scores 40 after verify', () => {
    const d01: Source = {
      id: 'd-01',
      type: 'doc',
      title: 'Playbook',
      country: 'BE',
      clientId: null,
      ownerId: 'u-lotte',
      lastEdited: '2026-01-08',
      content: 'no cap',
      cachedClaims: [{ claim: 'centenindex_applies_pc200', value: 'no', quote: 'no cap' }],
    };

    const fact: VerifiedFact = {
      id: 'vf-1',
      projectId: 'p-1',
      claim: 'centenindex_applies_pc200',
      value: 'yes',
      statement: 'Applies',
      verifiedBy: 'u-pieter',
      at: '2026-09-30T10:00:00Z',
    };

    const score = scoreSource(d01, {
      clientId: 'c-noord',
      leadId: 'u-lotte',
      users,
      today: '2026-09-30',
      verifiedFacts: [fact],
    });
    expect(score.total).toBe(40); // capped
  });
});
