import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

// ─── FormField wrapper ────────────────────────────────────────────────────────
interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      {label && (
        <label className="flex items-center gap-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, suffix, className, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`
          input
          ${icon ? 'pl-10' : ''}
          ${suffix ? 'pr-10' : ''}
          ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
          {suffix}
        </div>
      )}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className, ...props }, ref) => (
    <select
      ref={ref}
      className={`input ${error ? 'border-danger' : ''} ${className || ''}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
);
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`input resize-none ${error ? 'border-danger' : ''} ${className || ''}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// ─── Toggle/Switch ────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, disabled, size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 'w-9' : 'w-11';
  const h = size === 'sm' ? 'h-5' : 'h-6';
  const knobW = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative ${w} ${h} rounded-full transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-accent shadow-glow-sm' : 'bg-white/15'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${label ? 'flex items-center' : ''}
      `}
    >
      <span className={`
        absolute top-0.5 left-0.5 ${knobW} bg-white rounded-full shadow-sm
        transition-transform duration-200
        ${checked ? translate : 'translate-x-0'}
      `} />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
