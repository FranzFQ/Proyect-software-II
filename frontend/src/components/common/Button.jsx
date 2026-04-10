import React from 'react';

// Componente de botón reutilizable con variantes de diseño
const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  // Estilo base común para todos los botones
  const baseStyle = "px-4 py-2 rounded-md font-bold transition-colors duration-200 text-sm";
  
  // Variantes de estilo para diferentes tipos de botones
  const variants = {
    primary: "bg-url-yellow text-url-blue hover:bg-yellow-500",
    secondary: "border-2 border-url-blue text-url-blue hover:bg-url-blue hover:text-white",
    danger: "bg-status-danger text-white hover:bg-red-500",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;