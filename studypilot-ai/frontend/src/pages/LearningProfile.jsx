import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserCircle2, Save, Check } from 'lucide-react';
import { userApi } from '../api/user';
import { learningApi } from '../api/learning';
import { GlassCard } from '../components/ui/Primitives';

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Working Professional', 'Self-taught'];
const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual' },
  { value: 'reading', label: 'Reading/Writing' },
  { value: 'practice', label: 'Hands-on Practice' },
  { value: 'mixed', label: 'Mixed' },
];

export default function LearningProfile() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    educationLevel: '', primaryGoal: '', targetRole: '', dailyStudyMinutes: 30,
    preferredSubjects: [], learningStyle: 'mixed', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([learningApi.getSubjects(), userApi.getLearningProfile()]).then(([s, p]) => {
      setSubjects(s.data.data);
      const profile = p.data.data;
      setForm((f) => ({
        ...f,
        educationLevel: profile.education_level || '',
        primaryGoal: profile.primary_goal || '',
        targetRole: profile.target_role || '',
        dailyStudyMinutes: profile.daily_study_minutes || 30,
        preferredSubjects: profile.preferred_subjects || [],
        learningStyle: profile.learning_style || 'mixed',
      }));
    }).finally(() => setLoading(false));
  }, []);

  const toggleSubject = (name) => {
    setForm((f) => ({
      ...f,
      preferredSubjects: f.preferredSubjects.includes(name)
        ? f.preferredSubjects.filter((s) => s !== name)
        : [...f.preferredSubjects, name],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateLearningProfile(form);
      toast.success('Learning profile saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 skeleton" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><UserCircle2 className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">Learning Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">This powers your adaptive roadmap and recommendations.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-5">
        <GlassCard hover={false}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Education level</label>
              <select className="input-field" value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}>
                <option value="">Select...</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Target role (optional)</label>
              <input className="input-field" placeholder="e.g. Backend Engineer" value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Primary learning goal</label>
              <textarea className="input-field" rows={2} placeholder="e.g. Crack technical interviews at product companies in 3 months"
                value={form.primaryGoal} onChange={(e) => setForm({ ...form, primaryGoal: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Daily study minutes</label>
              <input type="number" min={10} max={480} className="input-field" value={form.dailyStudyMinutes}
                onChange={(e) => setForm({ ...form, dailyStudyMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Learning style</label>
              <select className="input-field" value={form.learningStyle} onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}>
                {LEARNING_STYLES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <label className="text-xs font-medium text-slate-500 mb-2 block">Preferred subjects</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => {
              const active = form.preferredSubjects.includes(s.name);
              return (
                <button type="button" key={s.id} onClick={() => toggleSubject(s.name)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5
                    ${active ? 'bg-brand-gradient text-white border-transparent' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  {active && <Check className="w-3.5 h-3.5" />} {s.name}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </div>
  );
}
