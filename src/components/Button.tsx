import React from 'react';

/** 按钮变体类型 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';

/** 按钮尺寸类型 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

/** 按钮组件 Props */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮样式变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 其他 CSS 类 */
  className?: string;
  /** 按钮内容 */
  children: React.ReactNode;
}

/**
 * Button - 可重用的按钮组件，支持多种变体和尺寸。
 * 遵循 Material Design 3 颜色令牌和 Tailwind CSS 样式。
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // 基础样式 - 始终应用
  const baseStyles = `
    inline-flex items-center justify-center
    rounded-md font-medium
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    cursor-pointer
  `.trim().replace(/\s+/g, ' ');

  // 变体样式
  const variants: Record<ButtonVariant, string> = {
    primary: `
      bg-primary text-on-primary
      hover:bg-primary/90 hover:shadow-md
      focus-visible:ring-primary
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),

    secondary: `
      bg-surface-container text-on-surface
      hover:bg-surface-container-high
      border border-outline-variant/30
      focus-visible:ring-outline
    `.trim().replace(/\s+/g, ' '),

    danger: `
      bg-error text-white
      hover:bg-error/90 hover:shadow-md
      focus-visible:ring-error
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),

    ghost: `
      bg-transparent text-on-surface
      hover:bg-surface-container-high
      focus-visible:ring-outline
    `.trim().replace(/\s+/g, ' '),

    outline: `
      bg-transparent text-on-surface
      border border-outline
      hover:bg-surface-container
      focus-visible:ring-outline
    `.trim().replace(/\s+/g, ' '),

    success: `
      bg-[#2e7d32] text-white
      hover:bg-[#1b5e20] hover:shadow-md
      focus-visible:ring-[#2e7d32]
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' ')
  };

  // 尺寸样式
  const sizes: Record<ButtonSize, string> = {
    xs: 'h-6 px-2 text-[10px]',
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9 p-0'
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
