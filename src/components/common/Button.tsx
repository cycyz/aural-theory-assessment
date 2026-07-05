import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
    transition: 'all var(--transition-fast)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: '2px solid transparent',
    fontSize: size === 'sm' ? 'var(--font-sm)' : size === 'lg' ? 'var(--font-lg)' : 'var(--font-md)',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '12px 24px',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-primary)',
      color: '#fff',
      borderColor: 'var(--color-primary)',
    },
    secondary: {
      background: '#fff',
      color: 'var(--color-primary)',
      borderColor: 'var(--color-primary)',
    },
    success: {
      background: 'var(--color-success)',
      color: '#fff',
      borderColor: 'var(--color-success)',
    },
    danger: {
      background: 'var(--color-danger)',
      color: '#fff',
      borderColor: 'var(--color-danger)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-light)',
      borderColor: 'transparent',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyles, ...variants[variant] }}
    >
      {children}
    </button>
  );
};
