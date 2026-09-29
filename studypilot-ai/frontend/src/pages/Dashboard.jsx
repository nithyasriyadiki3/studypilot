import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Flame, Trophy, Clock, Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../context/AuthContext';
import { GlassCard, Skeleton, ProgressRing, Badge } from '../components/ui/Primitives';

const STAT_ICONS = { streak: Flame, xp: Trophy, minutes: Clock, tasks: Target };

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getActivityTrend(14),
      analyticsApi.getSubjectBreakdown(),
    ]).then(([s, t, sub]) => {
      setSummary(s.data.data);
      setTrend(t.data.data.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) })));
      setSubjects(sub.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = summary ? [
    { key: 'streak', label: 'Day streak', value: summary.profile?.streak_count || 0, suffix: '🔥' },
    { key: 'xp', label: 'XP earned', value: summary.profile?.xp_points || 0, suffix: `Lvl ${summary.profile?.level || 1}` },
    { key: 'minutes', label: 'Minutes today', value: summary.minutesToday || 0, suffix: `Goal ${summary.profile?.daily_study_minutes || 30}m` },
    { key: 'tasks', label: 'Tasks today', value: `${summary.tasksToday?.completed || 0}/${summary.tasksToday?.total || 0}`, suffix: 'completed' },
  ] : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's how your learning journey is going.</p>
        </div>
        <Link to="/learn" className="btn-primary"><Sparkles className="w-4 h-4" /> Start a study session</Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) :
          stats.map((s, i) => {
            const Icon = STAT_ICONS[s.key];
            return (
              <GlassCard key={s.key} className="!p-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-gradient/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-brand-500" />
                  </div>
                  <span className="text-[11px] text-slate-400">{s.suffix}</span>
                </div>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </GlassCard>
            );
          })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Study activity (last 14 days)</h3>
            <Badge color="brand">minutes</Badge>
          </div>
          {loading ? <Skeleton className="h-56" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Area type="monotone" dataKey="minutes" stroke="#6366F1" strokeWidth={2.5} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="font-display font-semibold mb-4">Mastery by subject</h3>
          {loading ? <Skeleton className="h-56" /> : subjects.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Start practicing topics to see mastery here.</p>
          ) : (
            <div className="space-y-4">
              {subjects.slice(0, 4).map((s) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <ProgressRing value={s.avg_mastery || 0} size={48} stroke={5} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject}</p>
                    <p className="text-xs text-slate-400">{s.topics_tracked} topics tracked</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/adaptive-learning', title: 'View your roadmap', desc: 'See your AI-generated learning path', color: 'from-brand-500 to-accent-violet' },
          { to: '/quizzes', title: 'Take a quiz', desc: 'Test yourself with AI-generated questions', color: 'from-accent-cyan to-brand-500' },
          { to: '/revision-planner', title: 'Review due topics', desc: `${summary?.dueRevisions || 0} items due today`, color: 'from-accent-amber to-accent-rose' },
        ].map((c) => (
          <Link key={c.to} to={c.to} className={`glass-card bg-gradient-to-br ${c.color} text-white flex items-center justify-between`}>
            <div>
              <p className="font-display font-semibold">{c.title}</p>
              <p className="text-xs opacity-90 mt-1">{c.desc}</p>
            </div>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
