import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  className = '',
  disabled,
  icon,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brandBg focus:ring-brandPrimary";
  
  const variants = {
    primary: "bg-brandPrimary text-white hover:bg-brandPrimaryHover border border-transparent shadow-lg shadow-brandPrimary/20",
    secondary: "bg-brandSurfaceLight text-brandTextPrimary hover:bg-slate-700 border border-brandBorder hover:border-slate-600",
    outline: "border border-brandBorder text-brandTextSecondary hover:border-brandPrimary hover:text-brandPrimary bg-transparent",
    ghost: "bg-transparent text-brandTextSecondary hover:text-brandTextPrimary hover:bg-brandSurfaceLight",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">Carregando...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};