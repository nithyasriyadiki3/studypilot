import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-dark bg-mesh-dark text-slate-100">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow"><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="font-display font-bold text-xl">StudyPilot AI</span>
        </div>
        <div className="z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Learn smarter with a roadmap that <span className="gradient-text">adapts to you</span>.
          </h1>
          <p className="text-slate-400">
            Real progress tracking, AI-guided study sessions, and a revision system that knows exactly
            when your memory needs a refresh.
          </p>
        </div>
        <div className="flex gap-6 z-10 text-sm text-slate-400">
          <div><span className="text-2xl font-display font-bold text-white block">5</span>Deep learning modes</div>
          <div><span className="text-2xl font-display font-bold text-white block">100%</span>Adaptive to you</div>
          <div><span className="text-2xl font-display font-bold text-white block">24/7</span>AI tutor access</div>
        </div>
        <motion.div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl animate-floaty" />
        <motion.div className="absolute top-24 right-24 w-64 h-64 rounded-full bg-accent-cyan/20 blur-3xl animate-floaty" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.form
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm glass bg-white/[0.03] rounded-xl2 p-8"
        >
          <h2 className="font-display text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Log in to continue your learning path.</p>

          <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
          <div className="relative mb-4">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field pl-10 bg-white/[0.04] border-white/10 text-white" placeholder="you@example.com"
            />
          </div>

          <label className="text-xs font-medium text-slate-400 mb-1 block">Password</label>
          <div className="relative mb-6">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPw ? 'text' : 'password'} required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field pl-10 pr-10 bg-white/[0.04] border-white/10 text-white" placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in…' : 'Log in'} <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-sm text-slate-400 mt-6 text-center">
            New to StudyPilot? <Link to="/signup" className="text-brand-400 font-medium hover:underline">Create an account</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
