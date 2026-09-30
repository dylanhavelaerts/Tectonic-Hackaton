'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import RippleMark from '../RippleMark';
import { TICKET } from '../TicketPage';
import NewProject from './NewProject';
import ProjectPanel from './ProjectPanel';
import InboxList from './InboxList';
import { Button, SectionLabel } from './ui';
import { getJson, InboxItem, Me, ProjectSummary } from './types';
import { firstName } from '@/lib/format';

type View = { kind: 'home' } | { kind: 'new' } | { kind: 'inbox' } | { kind: 'project'; id: string; openPicker?: boolean };

const icon = { size: 16, strokeWidth: 1.5 };

export default function SidePanel({ me, onClose }: { me: Me; onClose: () => void }) {
  const router = useRouter();
  const [view, setView] = useState<View>({ kind: 'home' });
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);

  const refresh = useCallback(async () => {
    const [p, i] = await Promise.all([getJson<ProjectSummary[]>('/api/projects'), getJson<InboxItem[]>('/api/inbox')]);
    setProjects(p ?? []);
    setInbox(i ?? []);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const openInbox = inbox.filter((q) => q.status === 'open').length;

  return (
    <>
      {/* Header, 48 px */}
      <header className="h-12 px-4 border-b border-line flex items-center gap-2 shrink-0">
        <RippleMark />
        <span className="font-semibold text-ink">Ripple</span>
        <span className="ml-auto text-xs text-muted truncate">
          {firstName(me.name)} · <span className="capitalize">{me.role}</span>
        </span>
        <button onClick={logout} title="Log out" className="p-1.5 rounded-[4px] text-muted hover:bg-page hover:text-text">
          <LogOut {...icon} />
        </button>
        <button onClick={onClose} title="Close panel" className="p-1.5 rounded-[4px] text-muted hover:bg-page hover:text-text">
          <X {...icon} />
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        {view.kind === 'home' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* What the extension sees on the current page */}
            <section className="border border-line rounded-[4px] p-3 space-y-2">
              <SectionLabel>On this page</SectionLabel>
              <p className="text-sm font-medium text-text">
                Ticket #{TICKET.number} · {TICKET.clientName}
              </p>
              <p className="text-sm text-muted">{TICKET.subject}</p>
              <Button onClick={() => setView({ kind: 'new' })}>Start project from ticket</Button>
            </section>

            {openInbox > 0 && (
              <button
                onClick={() => setView({ kind: 'inbox' })}
                className="w-full flex items-center gap-3 border border-human/40 bg-human-subtle rounded-[4px] px-3 h-11 text-left"
              >
                <span className="w-2 h-2 rounded-full bg-human" />
                <span className="flex-1 text-sm text-human font-medium">
                  {openInbox} question{openInbox > 1 ? 's' : ''} waiting for your answer
                </span>
                <ChevronRight {...icon} className="text-human" />
              </button>
            )}

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionLabel>Your projects</SectionLabel>
                <button onClick={() => setView({ kind: 'inbox' })} className="text-xs text-primary hover:underline">
                  Inbox{openInbox ? ` (${openInbox})` : ''}
                </button>
              </div>
              {projects === null ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted">No projects yet. Start one from the ticket above.</p>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {projects.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setView({ kind: 'project', id: p.id })}
                        className="w-full min-h-11 py-2 flex items-center gap-2 text-left hover:bg-subtle"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-text truncate">{p.name}</span>
                          <span className="block text-xs text-muted">
                            {p.clientName} · {p.sourceCount} source{p.sourceCount === 1 ? '' : 's'}
                          </span>
                        </span>
                        <ChevronRight {...icon} className="text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {view.kind === 'new' && (
          <NewProject
            me={me}
            onCancel={() => setView({ kind: 'home' })}
            onCreated={(id) => {
              refresh();
              setView({ kind: 'project', id, openPicker: true });
            }}
          />
        )}

        {view.kind === 'inbox' && (
          <>
            <BackBar label="Inbox" onBack={() => setView({ kind: 'home' })} />
            <div className="flex-1 overflow-y-auto p-4">
              <InboxList items={inbox} onChanged={refresh} />
            </div>
          </>
        )}

        {view.kind === 'project' && (
          <ProjectPanel
            key={view.id}
            projectId={view.id}
            me={me}
            inbox={inbox}
            onInboxChanged={refresh}
            openPickerOnLoad={view.openPicker ?? false}
            onBack={() => {
              refresh();
              setView({ kind: 'home' });
            }}
          />
        )}
      </div>
    </>
  );
}

export function BackBar({ label, onBack, children }: { label: string; onBack: () => void; children?: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-2 shrink-0">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted hover:text-text">
        <ChevronLeft size={14} strokeWidth={1.5} /> Projects
      </button>
      <p className="mt-1 font-semibold text-ink leading-snug">{label}</p>
      {children}
    </div>
  );
}
