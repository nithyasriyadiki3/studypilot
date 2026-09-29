import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi } from '../api/analytics';
import { GlassCard, Skeleton } from '../components/ui/Primitives';

const COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#34D399', '#FB7185', '#8B5CF6'];
const MODE_LABELS = { learn: 'Learn', practice: 'Practice', problem_solving: 'Problem Solving', interview: 'Interview', case_study: 'Case Study' };

export default function Analytics() {
  const [quizTrend, setQuizTrend] = useState([]);
  const [modeDist, setModeDist] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getQuizPerformance(),
      analyticsApi.getModeDistribution(),
      analyticsApi.getSubjectBreakdown(),
    ]).then(([q, m, s]) => {
      setQuizTrend(q.data.data.map((d, i) => ({ attempt: i + 1, score: d.score_pct, title: d.title })));
      setModeDist(m.data.data.map((d) => ({ name: MODE_LABELS[d.mode] || d.mode, sessions: d.sessions })));
      setSubjects(s.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">Progress Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Insights derived from your real quiz and study activity.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard hover={false}>
          <h3 className="font-display font-semibold mb-4">Quiz score trend</h3>
          {loading ? <Skeleton className="h-64" /> : quizTrend.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">Take some quizzes to see your trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={quizTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-display font-semibold mb-4">Deep learning mode usage</h3>
          {loading ? <Skeleton className="h-64" /> : modeDist.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">Use a learning mode to see distribution.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={modeDist} dataKey="sessions" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {modeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard hover={false} className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Average mastery by subject</h3>
          {loading ? <Skeleton className="h-64" /> : subjects.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">Start practicing topics to populate this chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjects}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Bar dataKey="avg_mastery" radius={[8, 8, 0, 0]}>
                  {subjects.map((s, i) => <Cell key={i} fill={s.color || COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
