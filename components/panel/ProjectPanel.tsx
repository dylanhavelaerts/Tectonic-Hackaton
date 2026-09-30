'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BackBar } from './SidePanel';
import SourcesTab from './SourcesTab';
import AnswerTab from './AnswerTab';
import InboxList from './InboxList';
import SourcePicker from './SourcePicker';
import { getJson, InboxItem, Me, ProjectData } from './types';
import { fmtTime } from '@/lib/format';

const TABS = ['Sources', 'Answer', 'Inbox', 'Log'] as const;
type Tab = (typeof TABS)[number];

export default function ProjectPanel({
  projectId,
  me,
  inbox,
  onInboxChanged,
  openPickerOnLoad,
  onBack,
}: {
  projectId: string;
  me: Me;
  inbox: InboxItem[];
  onInboxChanged: () => void;
  openPickerOnLoad: boolean;
  onBack: () => void;
}) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>('Sources');
  const [picker, setPicker] = useState(openPickerOnLoad);
  const [analysing, setAnalysing] = useState(false);
  const reduce = useReducedMotion();

  const load = useCallback(async () => {
    const d = await getJson<ProjectData>(`/api/projects/${projectId}`);
    if (d) setData(d);
    else setMissing(true);
  }, [projectId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000); // picks up the expert's verification without a reload
    return () => clearInterval(t);
  }, [load]);

  if (missing) {
    return (
      <>
        <BackBar label="Project not found" onBack={onBack} />
        <p className="px-4 text-sm text-muted">This project does not exist or you are not a member.</p>
      </>
    );
  }
  if (!data) return <p className="p-4 text-sm text-muted">Loading…</p>;

  const openInbox = inbox.filter((q) => q.status === 'open').length;

  return (
    <>
      {analysing && (
        <div className="h-0.5 w-full overflow-hidden bg-primary-soft shrink-0">
          <motion.div
            className="h-full w-1/3 bg-primary"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
          />
        </div>
      )}

      <BackBar label={data.project.name} onBack={onBack}>
        <p className="text-xs text-muted mt-0.5">
          {data.project.clientName} · lead {data.project.leadName}
        </p>
      </BackBar>

      <nav className="px-4 flex gap-5 border-b border-line shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-9 text-sm border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary text-text font-medium' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {t}
            {t === 'Inbox' && openInbox > 0 && <span className="ml-1 text-human tabular-nums">{openInbox}</span>}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
            className="p-4"
          >
            {tab === 'Sources' && (
              <SourcesTab data={data} onAdd={() => setPicker(true)} onOpenAnswer={() => setTab('Answer')} />
            )}
            {tab === 'Answer' && <AnswerTab data={data} me={me} onAsked={load} />}
            {tab === 'Inbox' && (
              <InboxList
                items={inbox}
                onChanged={() => {
                  onInboxChanged();
                  load();
                }}
              />
            )}
            {tab === 'Log' &&
              (data.log.length === 0 ? (
                <p className="text-sm text-muted">Nothing has happened in this project yet.</p>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {data.log.map((e, i) => (
                    <li key={i} className="flex gap-3 py-2 text-sm">
                      <span className="font-mono text-xs text-muted pt-0.5 tabular-nums">{fmtTime(e.at)}</span>
                      <span className="text-text">{e.text}</span>
                    </li>
                  ))}
                </ul>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {picker && data.project.isLead && (
          <SourcePicker
            projectId={projectId}
            alreadyAdded={data.sources.map((s) => s.id)}
            onClose={() => setPicker(false)}
            onAdding={() => setAnalysing(true)}
            onAdded={async () => {
              setPicker(false);
              await load();
              setAnalysing(false);
              setTab('Sources');
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
