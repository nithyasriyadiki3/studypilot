import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Route, Sparkles, TrendingDown, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { learningApi } from '../api/learning';
import { GlassCard, Badge, EmptyState, Skeleton } from '../components/ui/Primitives';
import { useNavigate } from 'react-router-dom';

export default function AdaptiveLearning() {
  const [roadmap, setRoadmap] = useState(null);
  const [weakStrong, setWeakStrong] = useState({ weak: [], strong: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [r, ws] = await Promise.all([learningApi.getActiveRoadmap(), learningApi.getWeakStrong()]);
      setRoadmap(r.data.data);
      setWeakStrong(ws.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await learningApi.generateRoadmap();
      setRoadmap(data.data);
      toast.success('Your personalized roadmap is ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate roadmap. Check your Gemini API key.');
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><Route className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Adaptive Learning</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your roadmap, rebuilt around real progress data.</p>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary">
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> {generating ? 'Generating…' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {loading ? <Skeleton className="h-80" /> : !roadmap ? (
            <GlassCard hover={false}>
              <EmptyState
                icon={Sparkles}
                title="No roadmap yet"
                description="Complete your learning profile, then generate an AI roadmap tailored to your goals and current mastery."
                action={<button onClick={handleGenerate} className="btn-primary">Generate my roadmap</button>}
              />
            </GlassCard>
          ) : (
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold mb-1">AI summary</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{roadmap.summary}</p>

              <div className="relative pl-8">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-500 to-accent-cyan opacity-40" />
                {(roadmap.roadmap || []).map((phase, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative mb-6 last:mb-0">
                    <div className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-bold shadow-glow">
                      {i + 1}
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{phase.phase}</h4>
                        <Badge color="brand">{phase.estimated_weeks} wk{phase.estimated_weeks !== 1 ? 's' : ''}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{phase.goal}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(phase.topics || []).map((t) => <span key={t} className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5">{t}</span>)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {roadmap?.recommended_next_topics?.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold mb-3">Recommended next topics</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {roadmap.recommended_next_topics.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{t.topic}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.reason}</p>
                    </div>
                    <button onClick={() => navigate('/learn', { state: { topicName: t.topic } })} className="btn-ghost p-1.5 shrink-0"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-5">
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3"><TrendingDown className="w-4 h-4 text-rose-500" /><h3 className="font-display font-semibold text-sm">Weak topics</h3></div>
            {weakStrong.weak.length === 0 ? <p className="text-xs text-slate-400">No weak topics detected yet.</p> : (
              <div className="space-y-2">
                {weakStrong.weak.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{t.name}</span>
                    <Badge color="rose">{Math.round(t.mastery_score)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-emerald-500" /><h3 className="font-display font-semibold text-sm">Strong topics</h3></div>
            {weakStrong.strong.length === 0 ? <p className="text-xs text-slate-400">Keep practicing to build strengths.</p> : (
              <div className="space-y-2">
                {weakStrong.strong.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{t.name}</span>
                    <Badge color="mint">{Math.round(t.mastery_score)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
