import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
  className?: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-8 py-3 font-display font-bold tracking-wider uppercase transition-all duration-300 transform clip-path-slant";
  
  const variants = {
    primary: `
      bg-neon-green text-black 
      hover:shadow-neon-hover hover:scale-105
      active:scale-95
    `,
    outline: `
      bg-transparent text-neon-green border-2 border-neon-green
      hover:bg-neon-green/10 hover:shadow-neon
      active:scale-95
    `
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeonButton;