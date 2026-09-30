'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Browser from '@/components/Browser';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        setUser(await res.json());
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-page">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-ink h-9 flex items-center gap-2 px-3 border-b border-line">
          <div className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded-sm">
            support.internal/tickets/48213
          </div>
          <div className="flex gap-1 ml-auto">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-2 h-2 rounded-full bg-muted" />
          </div>
        </div>
        <Browser user={user} projectId={selectedProjectId} />
      </div>
      <div className="w-[420px] border-l border-line flex flex-col bg-surface">
        <Sidebar user={user} onSelectProject={setSelectedProjectId} />
      </div>
    </div>
  );
}
