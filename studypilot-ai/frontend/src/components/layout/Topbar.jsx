import { useEffect, useRef, useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notifications';
import { AnimatePresence, motion } from 'framer-motion';

export default function Topbar({ onMenuClick, streak = 0 }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  const loadNotifications = async () => {
    try {
      const { data } = await notificationApi.list();
      setNotifications(data.data);
      setUnread(data.unread);
    } catch { /* silent */ }
  };

  useEffect(() => { loadNotifications(); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setNotifOpen(false); setUserOpen(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await notificationApi.markRead(id);
    loadNotifications();
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-surface-dark/70 border-b border-slate-200/60 dark:border-white/10">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button className="lg:hidden btn-ghost p-2" onClick={onMenuClick}><Menu className="w-5 h-5" /></button>
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-gradient text-white text-xs font-bold">
              <Flame className="w-3.5 h-3.5" /> {streak} day streak
            </div>
          )}
        </div>

        <div className="flex items-center gap-2" ref={ref}>
          <button onClick={toggleTheme} className="btn-ghost p-2.5 rounded-full">
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} className="btn-ghost p-2.5 rounded-full relative">
              <Bell className="w-[18px] h-[18px]" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-80 glass bg-white dark:bg-surface-darkCard rounded-xl2 p-2 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button onClick={() => navigate('/notifications')} className="text-xs text-brand-500 font-medium hover:underline">View all</button>
                  </div>
                  {notifications.length === 0 && <p className="text-xs text-slate-400 px-3 py-4 text-center">You're all caught up 🎉</p>}
                  {notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-white/5 ${!n.is_read ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-52 glass bg-white dark:bg-surface-darkCard rounded-xl2 p-2"
                >
                  <p className="px-3 py-2 text-sm font-semibold truncate">{user?.name}</p>
                  <p className="px-3 pb-2 text-xs text-slate-400 truncate">{user?.email}</p>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
