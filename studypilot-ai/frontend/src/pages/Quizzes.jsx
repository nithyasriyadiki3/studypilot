import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ListChecks, Plus, CheckCircle2, XCircle, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { quizApi } from '../api/quiz';
import { learningApi } from '../api/learning';
import { GlassCard, Badge, EmptyState, Skeleton } from '../components/ui/Primitives';
import Modal from '../components/ui/Modal';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ topicId: '', topicName: '', difficulty: 'beginner', numQuestions: 5 });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);

  const loadQuizzes = async () => {
    setLoading(true);
    try { const { data } = await quizApi.list(); setQuizzes(data.data); } finally { setLoading(false); }
  };

  useEffect(() => {
    loadQuizzes();
    learningApi.getTopics().then(({ data }) => setTopics(data.data));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.topicName) return toast.error('Choose or type a topic.');
    setGenerating(true);
    try {
      const { data } = await quizApi.generate(genForm);
      toast.success('Quiz generated!');
      setModalOpen(false);
      loadQuizzes();
      openQuiz(data.data.quizId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz. Check Gemini API key.');
    } finally { setGenerating(false); }
  };

  const openQuiz = async (id) => {
    const { data } = await quizApi.get(id);
    setActiveQuiz({ ...data.data, answers: {}, startedAt: Date.now() });
    setResult(null);
  };

  const submitQuiz = async () => {
    const answers = Object.entries(activeQuiz.answers).map(([questionId, selected]) => ({ questionId: Number(questionId), selected }));
    const timeTakenSeconds = Math.round((Date.now() - activeQuiz.startedAt) / 1000);
    try {
      const { data } = await quizApi.submitAttempt(activeQuiz.id, { answers, timeTakenSeconds });
      setResult(data.data);
      loadQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz.');
    }
  };

  if (activeQuiz) {
    return (
      <QuizRunner
        quiz={activeQuiz}
        setQuiz={setActiveQuiz}
        result={result}
        onSubmit={submitQuiz}
        onExit={() => { setActiveQuiz(null); setResult(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><ListChecks className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Quiz System</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-generated quizzes that update your mastery scores.</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New quiz</button>
      </div>

      {loading ? <Skeleton className="h-64" /> : quizzes.length === 0 ? (
        <GlassCard hover={false}><EmptyState icon={ListChecks} title="No quizzes yet" description="Generate your first AI quiz to test your knowledge."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary">Generate a quiz</button>} /></GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <GlassCard key={q.id} className="cursor-pointer" onClick={() => openQuiz(q.id)}>
              <div className="flex items-center justify-between mb-2">
                <Badge color={q.difficulty === 'advanced' ? 'rose' : q.difficulty === 'intermediate' ? 'amber' : 'mint'}>{q.difficulty}</Badge>
                {q.best_score !== null && <span className="text-xs text-slate-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {q.best_score}/{q.total_questions}</span>}
              </div>
              <h3 className="font-display font-semibold mb-1">{q.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{q.total_questions} questions · {q.attempt_count} attempt{q.attempt_count !== 1 ? 's' : ''}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate a new quiz">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Topic from catalog</label>
            <select className="input-field" value={genForm.topicId}
              onChange={(e) => {
                const t = topics.find((x) => String(x.id) === e.target.value);
                setGenForm({ ...genForm, topicId: e.target.value, topicName: t?.name || genForm.topicName });
              }}>
              <option value="">— or type a custom topic below —</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.subject_name} — {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Topic name</label>
            <input className="input-field" value={genForm.topicName} onChange={(e) => setGenForm({ ...genForm, topicName: e.target.value, topicId: '' })} placeholder="e.g. Binary Search Trees" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Difficulty</label>
              <select className="input-field" value={genForm.difficulty} onChange={(e) => setGenForm({ ...genForm, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Questions</label>
              <input type="number" min={3} max={15} className="input-field" value={genForm.numQuestions}
                onChange={(e) => setGenForm({ ...genForm, numQuestions: Number(e.target.value) })} />
            </div>
          </div>
          <button type="submit" disabled={generating} className="btn-primary w-full">{generating ? 'Generating…' : 'Generate quiz'}</button>
        </form>
      </Modal>
    </div>
  );
}

function QuizRunner({ quiz, setQuiz, result, onSubmit, onExit }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={onExit} className="btn-ghost !px-2"><ArrowLeft className="w-4 h-4" /> Back to quizzes</button>

      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl font-bold">{quiz.title}</h2>
          {result && <Badge color={result.masteryScore >= 75 ? 'mint' : result.masteryScore < 45 ? 'rose' : 'amber'}>{result.score}/{result.total} correct</Badge>}
        </div>
        {!result && <p className="text-xs text-slate-400 mb-4">Select an answer for each question, then submit.</p>}

        <div className="space-y-5 mt-4">
          {quiz.questions.map((q, idx) => {
            const graded = result?.graded?.find((g) => g.questionId === q.id);
            return (
              <div key={q.id}>
                <p className="font-medium text-sm mb-2">{idx + 1}. {q.question_text}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = quiz.answers[q.id] === opt;
                    let style = 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5';
                    if (result && graded) {
                      if (opt === graded.selected && graded.isCorrect) style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
                      else if (opt === graded.selected && !graded.isCorrect) style = 'border-rose-400 bg-rose-50 dark:bg-rose-500/10';
                    } else if (selected) style = 'border-brand-500 bg-brand-50 dark:bg-brand-500/10';

                    return (
                      <button key={opt} type="button" disabled={!!result}
                        onClick={() => setQuiz({ ...quiz, answers: { ...quiz.answers, [q.id]: opt } })}
                        className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between ${style}`}>
                        {opt}
                        {result && graded && opt === graded.selected && (graded.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />)}
                      </button>
                    );
                  })}
                </div>
                {result && q.explanation && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">💡 {q.explanation}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          {!result ? (
            <button onClick={onSubmit} className="btn-primary w-full">Submit quiz</button>
          ) : (
            <div className="text-center p-4 rounded-xl bg-brand-gradient text-white">
              <p className="font-display font-bold text-lg">Mastery score: {result.masteryScore}%</p>
              <p className="text-xs opacity-90">Updated in your Adaptive Learning progress.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
