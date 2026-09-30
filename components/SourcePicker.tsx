'use client';

import { useState, useEffect } from 'react';

export default function SourcePicker({
  onClose,
  projectId,
  onAdded,
}: {
  onClose: () => void;
  projectId: string;
  onAdded: () => void;
}) {
  const [sources, setSources] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await fetch('/api/sources');
        if (res.ok) {
          setSources(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceIds: Array.from(selected) }),
      });

      if (res.ok) {
        onAdded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Select sources</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-slate-600">Loading...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sources.map((s: any) => (
                <label
                  key={s.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selected);
                      if (e.target.checked) {
                        newSelected.add(s.id);
                      } else {
                        newSelected.delete(s.id);
                      }
                      setSelected(newSelected);
                    }}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{s.title}</p>
                    <p className="text-sm text-slate-600">
                      {s.owner} • {s.date}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700">
                    {s.type}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Add to project ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
