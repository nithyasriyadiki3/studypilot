import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UserCircle2, Route, GraduationCap, ListChecks,
  BarChart3, CalendarClock, RotateCcw, Settings, Sparkles, X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learning-profile', label: 'Learning Profile', icon: UserCircle2 },
  { to: '/adaptive-learning', label: 'Adaptive Learning', icon: Route },
  { to: '/learn', label: 'Deep Learning Modes', icon: GraduationCap },
  { to: '/quizzes', label: 'Quiz System', icon: ListChecks },
  { to: '/analytics', label: 'Progress Analytics', icon: BarChart3 },
  { to: '/study-planner', label: 'Study Planner', icon: CalendarClock },
  { to: '/revision-planner', label: 'Revision Planner', icon: RotateCcw },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-40 shrink-0
          bg-white/80 dark:bg-surface-darkCard/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/10
          flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">StudyPilot<span className="gradient-text"> AI</span></span>
          </div>
          <button className="lg:hidden btn-ghost p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-brand-gradient text-white shadow-lg shadow-brand-500/25'
                   : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'}`
              }
            >
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-4 mb-4 rounded-xl2 bg-brand-gradient text-white text-xs relative overflow-hidden">
          <p className="font-display font-semibold mb-1">Powered by Gemini AI</p>
          <p className="opacity-90">Your roadmap adapts as you learn — keep practicing to sharpen it.</p>
        </div>
      </motion.aside>
    </>
  );
}
