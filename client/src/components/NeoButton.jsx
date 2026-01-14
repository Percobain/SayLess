import { forwardRef } from 'react';

const variants = {
  default: 'neo-btn',
  sage: 'neo-btn-sage',
  mint: 'neo-btn-mint',
  wheat: 'neo-btn-wheat',
  caramel: 'neo-btn-caramel',
  dark: 'neo-btn-dark',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const NeoButton = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'md',
  danger = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <button 
      ref={ref}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${danger ? 'neo-danger' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

NeoButton.displayName = 'NeoButton';

export default NeoButton;
