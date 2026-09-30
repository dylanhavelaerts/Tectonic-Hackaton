'use client';

import { useState, useEffect } from 'react';
import SourcePicker from './SourcePicker';
import SourcesTab from './SourcesTab';
import AnswerTab from './AnswerTab';
import InboxTab from './InboxTab';
import LogTab from './LogTab';

type TabType = 'browser' | 'sources' | 'answer' | 'inbox' | 'log';

export default function ProjectView({
  user,
  projectId,
}: {
  user: any;
  projectId: string;
}) {
  const [tab, setTab] = useState<TabType>('browser');
  const [project, setProject] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          setScores(data.scores || []);
          setQuestions(data.questions || []);
          setFacts(data.facts || []);
          setLog(data.log || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleSourcesAdded = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
      setScores(data.scores || []);
      setFacts(data.facts || []);
      setQuestions(data.questions || []);
      setLog(data.log || []);
    }
    setShowPicker(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!project) return <div className="flex-1 flex items-center justify-center">Project not found</div>;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Browser / Header */}
      {tab === 'browser' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-100 border-b border-slate-300 p-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded border border-slate-300">
              <span className="text-slate-600">support.internal/tickets/48213</span>
            </div>
          </div>

          <div className="flex-1 flex gap-4 p-6 overflow-hidden">
            <div className="flex-1 bg-white rounded-lg border border-slate-200 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Brasserie Noord BV
              </h2>
              <p className="text-slate-700 mb-6">
                <strong>From:</strong> Payroll manager, priority High
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-slate-900">
                  {project.question}
                </p>
              </div>
            </div>

            <div className="w-96 flex flex-col gap-4">
              <button
                onClick={() => setShowPicker(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                + Add sources
              </button>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex-1 flex items-center justify-center text-center text-slate-600 text-sm">
                {project.sourceIds.length === 0
                  ? 'Select sources to begin analysis'
                  : `${project.sourceIds.length} source(s) selected`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-t border-slate-200 px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setTab('browser')}
            className={`py-4 font-medium text-sm transition ${
              tab === 'browser'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browser
          </button>
          <button
            onClick={() => setTab('sources')}
            className={`py-4 font-medium text-sm transition ${
              tab === 'sources'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sources
          </button>
          <button
            onClick={() => setTab('answer')}
            className={`py-4 font-medium text-sm transition ${
              tab === 'answer'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Answer
          </button>
          <button
            onClick={() => setTab('inbox')}
            className={`py-4 font-medium text-sm transition ${
              tab === 'inbox'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => setTab('log')}
            className={`py-4 font-medium text-sm transition ${
              tab === 'log'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'sources' && <SourcesTab scores={scores} projectId={projectId} />}
        {tab === 'answer' && <AnswerTab scores={scores} questions={questions} user={user} projectId={projectId} facts={facts} />}
        {tab === 'inbox' && <InboxTab questions={questions} user={user} projectId={projectId} onVerified={handleSourcesAdded} />}
        {tab === 'log' && <LogTab log={log} />}
      </div>

      {showPicker && (
        <SourcePicker
          onClose={() => setShowPicker(false)}
          projectId={projectId}
          onAdded={handleSourcesAdded}
        />
      )}
    </div>
  );
}
