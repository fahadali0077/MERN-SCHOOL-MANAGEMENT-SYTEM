import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  role?: string;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const roleGradients: Record<string, string> = {
  superAdmin: 'from-red-500 to-orange-500',
  schoolAdmin: 'from-accent to-blue-600',
  teacher: 'from-green-500 to-emerald-600',
  student: 'from-amber-500 to-yellow-500',
  parent: 'from-purple-500 to-violet-600',
};

export function Avatar({ name, src, size = 'md', role, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';
  const gradient = role ? roleGradients[role] || 'from-accent to-purple-500' : 'from-accent to-purple-500';

  return (
    <div className={`${sizeMap[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className || ''}`}>
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-display font-bold`}>
          {initials}
        </div>
      )}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'accent' | 'neutral' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  danger: 'bg-danger/15 text-danger border-danger/20',
  accent: 'bg-accent/15 text-accent border-accent/20',
  neutral: 'bg-white/8 text-text-secondary border-white/10',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

export function Badge({ variant = 'neutral', children, dot, className }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[variant]} ${className || ''}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${
        variant === 'success' ? 'bg-success' :
        variant === 'danger' ? 'bg-danger' :
        variant === 'warning' ? 'bg-warning' : 'bg-accent'
      }`} />}
      {children}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  onClick?: () => void;
}

export function StatCard({ label, value, subtext, icon, color = '#0066FF', trend, onClick }: StatCardProps) {
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <div style={{ color }}>{icon}</div>
          </div>
        )}
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-text-primary leading-none">{value}</p>
      <p className="text-sm font-medium text-text-primary mt-2">{label}</p>
      {subtext && <p className="text-xs text-text-tertiary mt-0.5">{subtext}</p>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title = 'Nothing here yet', description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className || ''}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 opacity-50">
          {icon}
        </div>
      )}
      <p className="font-display font-semibold text-text-secondary">{title}</p>
      {description && <p className="text-text-tertiary text-sm mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, badge, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fade-up">
      <div>
        {breadcrumbs && (
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-accent transition-colors">{crumb.label}</a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-text-primary">{title}</h1>
          {badge && <Badge variant="accent">{badge}</Badge>}
        </div>
        {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title = 'Are you sure?', description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', isLoading
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmBtnClass = variant === 'danger'
    ? 'bg-danger hover:bg-red-600 text-white'
    : variant === 'warning'
    ? 'bg-warning hover:bg-yellow-500 text-white'
    : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'danger' ? 'bg-danger/15' : variant === 'warning' ? 'bg-warning/15' : 'bg-accent/15'
          }`}>
            <AlertTriangle size={18} className={
              variant === 'danger' ? 'text-danger' : variant === 'warning' ? 'text-warning' : 'text-accent'
            } />
          </div>
          <div>
            <h3 className="font-display font-bold text-text-primary">{title}</h3>
            {description && <p className="text-text-secondary text-sm mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${confirmBtnClass}`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-accent ${className || ''}`} />;
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <p className="text-text-secondary text-sm">{message}</p>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div className={`absolute ${posClasses[position]} z-50 px-2 py-1 text-xs text-white bg-bg-tertiary border border-white/10 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
        {content}
      </div>
    </div>
  );
}
