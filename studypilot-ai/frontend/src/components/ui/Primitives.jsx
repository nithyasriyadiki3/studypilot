import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`glass rounded-xl2 p-5 ${hover ? 'hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-500/15 text-brand-600 dark:text-brand-300',
    mint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  };
  return <span className={`badge ${colors[color] || colors.brand}`}>{children}</span>;
}

export function ProgressRing({ value = 0, size = 72, stroke = 7, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-slate-200 dark:stroke-white/10" fill="none" />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none"
          stroke="url(#ringGrad)" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold font-display">{Math.round(value)}%</span>
        {label && <span className="text-[10px] text-slate-400">{label}</span>}
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-gradient/10 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-brand-500" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
