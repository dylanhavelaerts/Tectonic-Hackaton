'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from './ui';
import { getJson, postJson } from './types';
import { fmtDate, TYPE_LABEL } from '@/lib/format';

interface CatalogItem {
  id: string;
  type: string;
  title: string;
  owner: string | null;
  lastEdited: string;
}

/** File-browser style picker over the whole window, like a Drive/SharePoint picker. */
export default function SourcePicker({
  projectId,
  alreadyAdded,
  onClose,
  onAdding,
  onAdded,
}: {
  projectId: string;
  alreadyAdded: string[];
  onClose: () => void;
  onAdding: () => void;
  onAdded: () => void;
}) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<CatalogItem[]>('/api/sources').then((d) => setItems(d ?? []));
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const add = async () => {
    onAdding();
    const res = await postJson(`/api/projects/${projectId}/sources`, { sourceIds: selected });
    if (!res.ok) {
      setError(res.status === 429 ? 'Too many analyses. Try again in a few minutes.' : 'Could not add these sources.');
      return;
    }
    onAdded();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-label="Add sources"
        className="w-full max-w-3xl bg-surface border border-line rounded-lg shadow-sm flex flex-col max-h-[80vh]"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 flex items-center border-b border-line">
          <p className="font-semibold text-ink flex-1">Add sources</p>
          <button onClick={onClose} className="p-1.5 rounded-[4px] text-muted hover:bg-page" title="Close">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-4 h-10 flex items-center gap-1 text-sm text-muted border-b border-line">
          Shared <ChevronRight size={14} strokeWidth={1.5} /> BE Payroll <ChevronRight size={14} strokeWidth={1.5} />
          <span className="text-text">Indexation</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted text-left sticky top-0 bg-surface">
              <tr className="border-b border-line">
                <th className="w-10 py-2 pl-4" />
                <th className="w-24 py-2 font-normal">Type</th>
                <th className="py-2 font-normal">Name</th>
                <th className="py-2 font-normal">Owner</th>
                <th className="py-2 pr-4 font-normal">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items === null && (
                <tr>
                  <td colSpan={5} className="p-4 text-muted">
                    Loading…
                  </td>
                </tr>
              )}
              {items?.map((s) => {
                const added = alreadyAdded.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    onClick={() => !added && toggle(s.id)}
                    className={`h-11 ${added ? 'text-muted' : 'cursor-pointer hover:bg-subtle'} ${
                      selected.includes(s.id) ? 'bg-primary-subtle' : ''
                    }`}
                  >
                    <td className="pl-4">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        disabled={added}
                        checked={added || selected.includes(s.id)}
                        onChange={() => toggle(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={s.title}
                      />
                    </td>
                    <td className="font-mono text-[11px] uppercase text-muted">{TYPE_LABEL[s.type] ?? s.type}</td>
                    <td className="pr-3">{s.title}</td>
                    <td className="text-muted whitespace-nowrap pr-3">{s.owner ?? '—'}</td>
                    <td className="text-muted whitespace-nowrap pr-4 tabular-nums">
                      {added ? 'Added' : fmtDate(s.lastEdited)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="h-14 px-4 flex items-center gap-3 border-t border-line">
          <span className="text-sm text-muted flex-1 tabular-nums">{selected.length} selected</span>
          {error && <span className="text-sm text-bad">{error}</span>}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={selected.length === 0} onClick={add}>
            Add to project
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
