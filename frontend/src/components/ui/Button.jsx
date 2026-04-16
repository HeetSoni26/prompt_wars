/**
 * @fileoverview Reusable Button component with variants, loading state, and accessibility.
 */

import { motion } from 'framer-motion';

/**
 * Button component with primary, ghost, and danger variants.
 * @param {Object} props
 * @param {'primary'|'ghost'|'danger'|'icon'} props.variant - Visual style
 * @param {boolean} props.loading - Shows spinner and disables button
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional classes
 */
export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'px-4 py-2 rounded-btn font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200',
    icon: 'p-2 rounded-btn text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-all duration-200',
  };

  return (
    <motion.button
      type={type}
      className={`${variants[variant]} flex items-center justify-center gap-2 ${className}`}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
