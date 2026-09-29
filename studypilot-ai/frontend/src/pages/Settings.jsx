import { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Moon, Sun, Save, KeyRound, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userApi } from '../api/user';
import { GlassCard } from '../components/ui/Primitives';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      await userApi.updateAccount({ name });
      setUser({ ...user, name });
      toast.success('Account updated.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update.'); }
    finally { setSavingAccount(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await userApi.changePassword(pw);
      toast.success('Password changed.');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password.'); }
    finally { setSavingPw(false); }
  };

  const handleThemeChange = async (t) => {
    setTheme(t);
    try { await userApi.updateTheme(t); } catch { /* ignore */ }
  };

  const deleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account and all data. Continue?')) return;
    await userApi.deleteAccount();
    toast.success('Account deleted.');
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient/10 flex items-center justify-center"><SettingsIcon className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account, appearance, and security.</p>
        </div>
      </div>

      <GlassCard hover={false}>
        <h3 className="font-display font-semibold mb-4">Appearance</h3>
        <div className="flex gap-3">
          <button onClick={() => handleThemeChange('light')} className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'light' ? 'border-brand-500' : 'border-slate-200 dark:border-white/10'}`}>
            <Sun className="w-5 h-5" /> <span className="text-xs font-medium">Light</span>
          </button>
          <button onClick={() => handleThemeChange('dark')} className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-brand-500' : 'border-slate-200 dark:border-white/10'}`}>
            <Moon className="w-5 h-5" /> <span className="text-xs font-medium">Dark</span>
          </button>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <h3 className="font-display font-semibold mb-4">Account</h3>
        <form onSubmit={saveAccount} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Full name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
            <input disabled className="input-field opacity-60" value={user?.email || ''} />
          </div>
          <button type="submit" disabled={savingAccount} className="btn-primary"><Save className="w-4 h-4" /> Save changes</button>
        </form>
      </GlassCard>

      <GlassCard hover={false}>
        <h3 className="font-display font-semibold mb-4">Change password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Current password</label>
            <input type="password" required className="input-field" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">New password</label>
            <input type="password" required minLength={6} className="input-field" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary"><KeyRound className="w-4 h-4" /> Update password</button>
        </form>
      </GlassCard>

      <GlassCard hover={false} className="border border-rose-200 dark:border-rose-500/20">
        <h3 className="font-display font-semibold mb-2 text-rose-500">Danger zone</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Deleting your account permanently removes all study data, quizzes, and progress.</p>
        <button onClick={deleteAccount} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete account
        </button>
      </GlassCard>
    </div>
  );
}
