import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/learning-profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dark bg-mesh-dark text-slate-100 p-6">
      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm glass bg-white/[0.03] rounded-xl2 p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow"><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="font-display font-bold text-xl">StudyPilot AI</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-slate-400 text-sm mb-6">Start your personalized, AI-guided learning journey.</p>

        <label className="text-xs font-medium text-slate-400 mb-1 block">Full name</label>
        <div className="relative mb-4">
          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field pl-10 bg-white/[0.04] border-white/10 text-white" placeholder="Jane Doe" />
        </div>

        <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
        <div className="relative mb-4">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field pl-10 bg-white/[0.04] border-white/10 text-white" placeholder="you@example.com" />
        </div>

        <label className="text-xs font-medium text-slate-400 mb-1 block">Password</label>
        <div className="relative mb-6">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type={showPw ? 'text' : 'password'} required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field pl-10 pr-10 bg-white/[0.04] border-white/10 text-white" placeholder="At least 6 characters" />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'} <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-brand-400 font-medium hover:underline">Log in</Link>
        </p>
      </motion.form>
    </div>
  );
}
