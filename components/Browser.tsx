'use client';

import { useState, useEffect } from 'react';

export default function Browser({
  user,
  projectId,
}: {
  user: any;
  projectId: string | null;
}) {
  const [project, setProject] = useState<any>(null);
  const [tab, setTab] = useState<'sources' | 'answer' | 'inbox' | 'log'>('sources');

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then(setProject)
      .catch(console.error);
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink mb-2">No project selected</h2>
          <p className="text-text mb-6">Select a project from the sidebar to view sources and answers.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-line px-6 flex gap-8 bg-surface">
        {(['sources', 'answer', 'inbox', 'log'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              tab === t
                ? 'text-primary border-primary'
                : 'text-muted border-transparent hover:text-text'
            }`}
          >
            {t === 'sources' && 'Sources'}
            {t === 'answer' && 'Answer'}
            {t === 'inbox' && 'Inbox'}
            {t === 'log' && 'Log'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'sources' && <SourcesContent projectId={projectId} />}
        {tab === 'answer' && <AnswerContent projectId={projectId} user={user} />}
        {tab === 'inbox' && <InboxContent user={user} />}
        {tab === 'log' && <LogContent projectId={projectId} />}
      </div>
    </div>
  );
}

function SourcesContent({ projectId }: { projectId: string }) {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setScores(data.scores || []))
      .catch(console.error);
  }, [projectId]);

  if (scores.length === 0) {
    return <p className="text-muted">No sources analyzed yet. Add sources from the sidebar.</p>;
  }

  const sorted = [...scores].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4 max-w-3xl">
      {sorted.map((score) => {
        const color =
          score.total >= 80 ? 'ok' : score.total >= 50 ? 'warn' : 'bad';
        return (
          <div key={score.sourceId} className="border border-line rounded-[4px] p-4">
            <div className="flex items-end justify-between mb-3">
              <h3 className="font-semibold text-text">Source {score.sourceId}</h3>
              <div className={`text-2xl font-semibold tabular-nums text-${color}`}>
                {score.total}
              </div>
            </div>
            <div
              className={`h-1 bg-${color} rounded-sm mb-3`}
              style={{
                backgroundColor: {
                  ok: 'var(--color-ok)',
                  warn: 'var(--color-warn)',
                  bad: 'var(--color-bad)',
                }[color],
              }}
            />
            <div className="grid grid-cols-5 gap-2 text-xs mb-3">
              {Object.entries(score.parts).map(([k, v]: [string, any]) => (
                <div key={k}>
                  <p className="font-medium text-text">{k}</p>
                  <p className="text-muted">{v}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted space-y-1">
              {score.why.map((r: string, i: number) => (
                <p key={i}>• {r}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnswerContent({ projectId, user }: { projectId: string; user: any }) {
  return <p className="text-muted">Answer content — expert verification interface coming soon.</p>;
}

function InboxContent({ user }: { user: any }) {
  return <p className="text-muted">Inbox — {user.name}'s questions to verify.</p>;
}

function LogContent({ projectId }: { projectId: string }) {
  const [log, setLog] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setLog(data.log || []))
      .catch(console.error);
  }, [projectId]);

  return (
    <div className="space-y-2 text-sm font-mono max-w-2xl">
      {log.map((e: any, i: number) => (
        <div key={i} className="flex gap-4 text-muted">
          <span className="text-text">
            {new Date(e.at).toLocaleString()}
          </span>
          <span>{e.action}</span>
        </div>
      ))}
    </div>
  );
}
