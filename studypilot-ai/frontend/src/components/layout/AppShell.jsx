import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { userApi } from '../../api/user';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    userApi.getLearningProfile().then(({ data }) => setStreak(data.data?.streak_count || 0)).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-mesh-light dark:bg-mesh-dark bg-surface-light dark:bg-surface-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} streak={streak} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
