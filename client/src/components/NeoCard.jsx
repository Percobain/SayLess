const variants = {
  default: 'neo-card',
  orange: 'neo-card-orange',
  green: 'neo-card-green',
  purple: 'neo-card-purple',
  black: 'neo-card-black',
};

export default function NeoCard({ 
  children, 
  variant = 'default', 
  className = '',
  hover = false,
  ...props 
}) {
  return (
    <div 
      className={`
        ${variants[variant]}
        ${hover ? 'transition-all duration-150 hover:-translate-y-1 hover:shadow-neo-lg cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
