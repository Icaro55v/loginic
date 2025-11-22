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
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide";
  
  const variants = {
    primary: "bg-brandPrimary text-white hover:bg-brandPrimaryHover border border-transparent shadow-lg shadow-blue-900/20",
    secondary: "bg-brandSurfaceLight text-white hover:bg-slate-700 border border-brandBorder",
    outline: "border border-slate-600 text-slate-300 hover:border-brandPrimary hover:text-brandPrimary bg-transparent",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-brandSurfaceLight",
    danger: "bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50",
    success: "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
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