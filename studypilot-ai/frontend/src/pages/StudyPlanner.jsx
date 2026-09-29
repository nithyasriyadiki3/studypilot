import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Plus, Trash2, Check, Clock } from 'lucide-react';
import { plannerApi } from '../api/planner';
import { learningApi } from '../api/learning';
import { GlassCard, Badge, EmptyState } from '../components/ui/Primitives';
import Modal from '../components/ui/Modal';

const PRIORITY_COLOR = { high: 'rose', medium: 'amber', low: 'mint' };

export default function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', topicId: '', scheduledDate: new Date().toISOString().slice(0, 10), durationMinutes: 30, priority: 'medium' });

  const load = async () => {
    const { data } = await plannerApi.listTasks();
    setTasks(data.data);
  };

  useEffect(() => { load(); learningApi.getTopics().then(({ data }) => setTopics(data.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await plannerApi.createTask(form);
      toast.success('Task added.');
      setModalOpen(false);
      setForm({ ...form, title: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task.');
    } finally { setSaving(false); }
  };

  const toggleStatus = async (task) => {
    await plannerApi.updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
    load();
  };

  const remove = async (id) => {
    await plannerApi.deleteTask(id);
    toast.success('Task removed.');
    load();
  };

  const grouped = tasks.reduce((acc, t) => {
    (acc[t.scheduled_date] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><CalendarClock className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Study Planner</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Plan and track your daily study tasks.</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add task</button>
      </div>

      {tasks.length === 0 ? (
        <GlassCard hover={false}><EmptyState icon={CalendarClock} title="No tasks scheduled" description="Add your first study task to build a plan."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add task</button>} /></GlassCard>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <div className="space-y-2">
                {items.map((t) => (
                  <GlassCard key={t.id} hover={false} className="!p-4 flex items-center gap-3">
                    <button onClick={() => toggleStatus(t)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-white/20'}`}>
                      {t.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${t.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" /> {t.duration_minutes}m {t.topic_name && `· ${t.topic_name}`}
                      </p>
                    </div>
                    <Badge color={PRIORITY_COLOR[t.priority]}>{t.priority}</Badge>
                    <button onClick={() => remove(t.id)} className="btn-ghost p-2"><Trash2 className="w-4 h-4 text-rose-400" /></button>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add study task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Practice DP problems" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Related topic (optional)</label>
            <select className="input-field" value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
              <option value="">None</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.subject_name} — {t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
              <input type="date" required className="input-field" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Minutes</label>
              <input type="number" min={5} className="input-field" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding…' : 'Add task'}</button>
        </form>
      </Modal>
    </div>
  );
}
