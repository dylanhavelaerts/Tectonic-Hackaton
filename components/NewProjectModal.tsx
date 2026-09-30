'use client';

import { useState, useEffect } from 'react';

export default function NewProjectModal({
  user,
  onClose,
  onCreated,
}: {
  user: any;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [question, setQuestion] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((users) => {
        setAllUsers(users.filter((u: any) => u.id !== user.id));
      })
      .catch(console.error);
  }, [user.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          clientId,
          question,
          memberIds: members,
        }),
      });

      if (!res.ok) throw new Error('Failed to create project');
      onCreated();
    } catch (err) {
      setError('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
      <div className="bg-surface border border-line rounded-lg shadow-sm max-w-md w-full mx-4">
        <div className="p-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">New project</h2>
        </div>

        <form onSubmit={handleCreate} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-bad-subtle border border-bad rounded-[4px] text-bad text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-[4px] text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-[4px] text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              required
            >
              <option value="">Select client…</option>
              <option value="c-noord">Brasserie Noord BV</option>
              <option value="c-verhaegen">Atelier Verhaegen NV</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-[4px] text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-2">
              Add members
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {allUsers.map((u: any) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={members.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMembers([...members, u.id]);
                      } else {
                        setMembers(members.filter((m) => m !== u.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-text">{u.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-line rounded-[4px] text-sm font-medium text-text hover:bg-subtle transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name || !clientId || !question}
              className="flex-1 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-[4px] text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
