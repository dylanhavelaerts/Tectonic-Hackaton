'use client';

import { useState } from 'react';

export default function AnswerTab({
  scores,
  questions,
  user,
  projectId,
  facts,
}: {
  scores: any[];
  questions: any[];
  user: any;
  projectId: string;
  facts: any[];
}) {
  const [questionText, setQuestionText] = useState('');
  const [expertId, setExpertId] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const topScore = scores.length > 0 ? Math.max(...scores.map((s: any) => s.total)) : 0;
  const showAskExpert = topScore < 80 || scores.length === 0;

  const handleAskExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/questions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: questionText, expertId }),
      });
      if (res.ok) {
        setQuestionText('');
        setExpertId('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verified facts */}
      {facts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">Verified Facts</h3>
          {facts.map((f: any) => (
            <div key={f.id} className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="font-semibold text-slate-900">{f.claim}</p>
              <p className="text-slate-700 mt-2">{f.statement}</p>
              <p className="text-xs text-slate-600 mt-2">Verified: {f.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ask expert card */}
      {showAskExpert && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-4">Ask an expert</h3>
          <form onSubmit={handleAskExpert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ask the expert..."
                maxLength={500}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm"
                rows={3}
              />
              <p className="text-xs text-slate-600 mt-1">
                {questionText.length}/500
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Send to
              </label>
              <select
                value={expertId}
                onChange={(e) => setExpertId(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm"
              >
                <option value="">Select expert...</option>
                <option value="u-pieter">Pieter De Smet (Expert)</option>
                <option value="u-karim">Karim El Idrissi (Teamlead)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!questionText || !expertId || loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send in Ripple'}
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition"
              >
                Teams
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition"
              >
                Email
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
