'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewProjectModal from './NewProjectModal';

export default function Sidebar({
  user,
  onSelectProject,
}: {
  user: any;
  onSelectProject: (id: string | null) => void;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          setProjects(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleProjectCreated = async () => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      setProjects(await res.json());
    }
    setShowNewProject(false);
  };

  return (
    <div
      className="w-96 bg-slate-50 border-r border-slate-200 flex flex-col"
      style={{ width: '420px' }}
    >
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Ripple</h1>
      </div>

      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-600">{user.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition mb-6"
          >
            + New project
          </button>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Projects
            </p>
            {loading ? (
              <p className="text-sm text-slate-600">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-slate-600">No projects yet</p>
            ) : (
              projects.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="w-full text-left p-3 rounded hover:bg-slate-200 transition text-sm text-slate-900 font-medium"
                >
                  {p.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          Log out
        </button>
      </div>

      {showNewProject && (
        <NewProjectModal
          user={user}
          onClose={() => setShowNewProject(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
