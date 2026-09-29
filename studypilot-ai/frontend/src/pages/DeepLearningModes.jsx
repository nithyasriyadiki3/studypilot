import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  GraduationCap, Dumbbell, Puzzle, Mic, Briefcase, Send, Loader2, BookOpen,
} from 'lucide-react';
import { learningApi } from '../api/learning';
import { GlassCard } from '../components/ui/Primitives';

const MODES = [
  { key: 'learn', label: 'Learn', icon: GraduationCap, desc: 'Clear, structured explanations' },
  { key: 'practice', label: 'Practice', icon: Dumbbell, desc: 'Hands-on exercises' },
  { key: 'problem_solving', label: 'Problem Solving', icon: Puzzle, desc: 'Interview-style problems' },
  { key: 'interview', label: 'Interview', icon: Mic, desc: 'Simulated mock interview' },
  { key: 'case_study', label: 'Case Study', icon: Briefcase, desc: 'Real-world scenarios' },
];

export default function DeepLearningModes() {
  const location = useLocation();
  const [mode, setMode] = useState('learn');
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [topicName, setTopicName] = useState(location.state?.topicName || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    learningApi.getTopics().then(({ data }) => setTopics(data.data));
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const userMsg = { role: 'user', content: message };
    setMessages((m) => [...m, userMsg]);
    setMessage('');
    setLoading(true);
    try {
      const { data } = await learningApi.runSession({
        mode, topicId: topicId || null, topicName: topicName || 'General',
        message: userMsg.content, history: messages.slice(-6),
      });
      setMessages((m) => [...m, { role: 'assistant', content: data.data.aiResponse }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed. Check your Gemini API key.');
      setMessages((m) => m.slice(0, -1));
    } finally { setLoading(false); }
  };

  const activeMode = MODES.find((m) => m.key === mode);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><BookOpen className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">Deep Learning Modes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Five AI-guided ways to master any topic.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button key={m.key} onClick={() => { setMode(m.key); setMessages([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${active ? 'bg-brand-gradient text-white shadow-lg shadow-brand-500/25' : 'glass hover:-translate-y-0.5'}`}>
              <Icon className="w-4 h-4" /> {m.label}
            </button>
          );
        })}
      </div>

      <GlassCard hover={false} className="!p-0 flex-1 flex flex-col overflow-hidden min-h-[520px]">
        <div className="p-4 border-b border-slate-200/60 dark:border-white/10 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-slate-400">{activeMode.desc}</span>
          <select
            className="input-field !w-auto text-xs py-1.5 ml-auto"
            value={topicId}
            onChange={(e) => {
              const t = topics.find((x) => String(x.id) === e.target.value);
              setTopicId(e.target.value);
              setTopicName(t?.name || '');
            }}
          >
            <option value="">Custom topic...</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.subject_name} — {t.name}</option>)}
          </select>
          {!topicId && (
            <input className="input-field !w-auto text-xs py-1.5" placeholder="Type any topic name"
              value={topicName} onChange={(e) => setTopicName(e.target.value)} />
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-sm text-slate-400 px-8">
              Ask about "{topicName || 'any topic'}" in <b className="mx-1">{activeMode.label}</b> mode to get started.
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-brand-gradient text-white' : 'glass'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="glass rounded-2xl px-4 py-3 text-sm w-fit flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        <form onSubmit={send} className="p-4 border-t border-slate-200/60 dark:border-white/10 flex gap-2">
          <input
            className="input-field flex-1" placeholder={`Message in ${activeMode.label} mode…`}
            value={message} onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary !px-4"><Send className="w-4 h-4" /></button>
        </form>
      </GlassCard>
    </div>
  );
}
