import React from 'react';

// Componente de tarjeta reutilizable para mostrar contenido con un título opcional
const Card = ({ children, title, className = '' }) => { // Recibimos 'title' para mostrar un encabezado, 'children' para el contenido dinámico, y 'className' para estilos adicionales
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Si le pasamos un título, lo renderiza con el azul institucional */}
      {title && <h3 className="text-xl font-bold text-url-blue mb-4">{title}</h3>}
      
      {/* Aquí adentro irá el contenido dinámico (tablas, gráficas, textos) */}
      <div>{children}</div>
    </div>
  );
};

export default Card;