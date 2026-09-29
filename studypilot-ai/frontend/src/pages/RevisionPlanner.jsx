import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RotateCcw, Plus, Trash2, Calendar } from 'lucide-react';
import { plannerApi } from '../api/planner';
import { learningApi } from '../api/learning';
import { GlassCard, Badge, EmptyState } from '../components/ui/Primitives';
import Modal from '../components/ui/Modal';

const QUALITY_OPTIONS = [
  { value: 1, label: 'Forgot', color: 'rose' },
  { value: 3, label: 'Hard', color: 'amber' },
  { value: 4, label: 'Good', color: 'brand' },
  { value: 5, label: 'Easy', color: 'mint' },
];

export default function RevisionPlanner() {
  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', notes: '', topicId: '' });
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const { data } = await plannerApi.listRevisionItems();
    setItems(data.data);
  };

  useEffect(() => { load(); learningApi.getTopics().then(({ data }) => setTopics(data.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await plannerApi.createRevisionItem(form);
      toast.success('Added to revision planner.');
      setModalOpen(false);
      setForm({ title: '', notes: '', topicId: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item.');
    } finally { setSaving(false); }
  };

  const review = async (id, quality) => {
    const { data } = await plannerApi.reviewRevisionItem(id, quality);
    toast.success(`Next review in ${data.data.nextIntervalDays} day(s).`);
    load();
  };

  const remove = async (id) => { await plannerApi.deleteRevisionItem(id); load(); };

  const today = new Date().toISOString().slice(0, 10);
  const visible = items.filter((i) => filter === 'all' || (filter === 'due' && i.next_review_date <= today));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><RotateCcw className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Revision Planner</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Spaced repetition keeps concepts fresh in memory.</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add item</button>
      </div>

      <div className="flex gap-2">
        {['all', 'due'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium ${filter === f ? 'bg-brand-gradient text-white' : 'glass'}`}>
            {f === 'all' ? 'All items' : 'Due today'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <GlassCard hover={false}><EmptyState icon={RotateCcw} title="Nothing here" description="Add topics you want to revisit with spaced repetition."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add item</button>} /></GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((item) => {
            const isDue = item.next_review_date <= today;
            return (
              <GlassCard key={item.id} hover={false}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.topic_name && <p className="text-xs text-slate-400">{item.topic_name}</p>}
                  </div>
                  <button onClick={() => remove(item.id)} className="btn-ghost p-1.5"><Trash2 className="w-4 h-4 text-rose-400" /></button>
                </div>
                {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{item.notes}</p>}
                <div className="flex items-center gap-2 mb-3">
                  <Badge color={isDue ? 'rose' : 'slate'}><Calendar className="w-3 h-3" /> {isDue ? 'Due now' : `Next: ${item.next_review_date}`}</Badge>
                  <span className="text-xs text-slate-400">Reps: {item.repetitions}</span>
                </div>
                {isDue && (
                  <div className="flex gap-1.5">
                    {QUALITY_OPTIONS.map((q) => (
                      <button key={q.value} onClick={() => review(item.id, q.value)}
                        className="flex-1 text-xs py-1.5 rounded-lg font-medium glass hover:-translate-y-0.5 transition-all">
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add revision item">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Graph traversal algorithms" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Related topic (optional)</label>
            <select className="input-field" value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
              <option value="">None</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.subject_name} — {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding…' : 'Add item'}</button>
        </form>
      </Modal>
    </div>
  );
}
