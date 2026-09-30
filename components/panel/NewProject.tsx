'use client';

import { useEffect, useState } from 'react';
import { TICKET } from '../TicketPage';
import { BackBar } from './SidePanel';
import { Button, inputClass, SectionLabel } from './ui';
import { getJson, Me, postJson } from './types';

const CLIENTS = [
  { id: 'c-noord', name: 'Brasserie Noord BV' },
  { id: 'c-verhaegen', name: 'Atelier Verhaegen NV' },
];

/** Prefilled from the open ticket; the creator becomes the lead. */
export default function NewProject({
  me,
  onCancel,
  onCreated,
}: {
  me: Me;
  onCancel: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('Brasserie Noord – Jan 2027 indexation');
  const [clientId, setClientId] = useState(TICKET.clientId);
  const [question, setQuestion] = useState(TICKET.subject);
  const [users, setUsers] = useState<{ id: string; name: string; role: string; team: string }[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getJson<typeof users>('/api/users').then((u) => setUsers((u ?? []).filter((x) => x.id !== me.id)));
  }, [me.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await postJson('/api/projects', { name, clientId, question, memberIds: members });
    setBusy(false);
    if (!res.ok) {
      setError(res.status === 404 ? 'You are not assigned to this client.' : 'Could not create the project.');
      return;
    }
    onCreated((await res.json()).id);
  };

  return (
    <>
      <BackBar label="New project" onBack={onCancel} />
      <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <p className="text-xs text-muted">Prefilled from ticket #{TICKET.number}.</p>
        <label className="block space-y-1">
          <SectionLabel>Name</SectionLabel>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
        </label>
        <label className="block space-y-1">
          <SectionLabel>Client</SectionLabel>
          <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <SectionLabel>Client question</SectionLabel>
          <textarea
            className={inputClass}
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
            required
          />
        </label>
        <fieldset className="space-y-1">
          <SectionLabel>Members</SectionLabel>
          <ul className="divide-y divide-line border-y border-line">
            {users.map((u) => (
              <li key={u.id}>
                <label className="flex items-center gap-2.5 min-h-11 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={members.includes(u.id)}
                    onChange={(e) =>
                      setMembers(e.target.checked ? [...members, u.id] : members.filter((m) => m !== u.id))
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm text-text">{u.name}</span>
                  <span className="text-xs text-muted truncate ml-auto">{u.team}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        {error && <p className="text-sm text-bad">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create project'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
