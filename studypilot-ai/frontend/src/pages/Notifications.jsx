import { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { notificationApi } from '../api/notifications';
import { GlassCard, Badge, EmptyState } from '../components/ui/Primitives';

const TYPE_COLOR = { streak: 'amber', reminder: 'brand', achievement: 'mint', revision: 'rose', system: 'slate', quiz: 'brand' };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await notificationApi.list();
    setItems(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await notificationApi.markRead(id); load(); };
  const markAllRead = async () => { await notificationApi.markAllRead(); load(); };
  const remove = async (id) => { await notificationApi.remove(id); load(); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><Bell className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reminders, achievements, and system updates.</p>
          </div>
        </div>
        <button onClick={markAllRead} className="btn-secondary"><CheckCheck className="w-4 h-4" /> Mark all read</button>
      </div>

      {!loading && items.length === 0 && (
        <GlassCard hover={false}><EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here." /></GlassCard>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <GlassCard key={n.id} hover={false} className={`!p-4 flex items-start gap-3 ${!n.is_read ? 'border-brand-400/40' : ''}`}>
            <div className="flex-1 cursor-pointer" onClick={() => markRead(n.id)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={TYPE_COLOR[n.type] || 'slate'}>{n.type}</Badge>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                <span className="text-xs text-slate-400 ml-auto">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
            </div>
            <button onClick={() => remove(n.id)} className="btn-ghost p-1.5"><Trash2 className="w-4 h-4 text-rose-400" /></button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
