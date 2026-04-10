import React from 'react';
// Esto es para crear un componente de campo de entrada reutilizable con estilos consistentes
const Input = ({ label, type = 'text', placeholder, value, onChange, id }) => { //
  return (
    <div className="flex flex-col w-full mb-4">
      {/* Etiqueta del campo (Label) */}
      {label && (
        <label htmlFor={id} className="mb-1 text-xs font-bold tracking-wider text-gray-700 uppercase">
          {label}
        </label>
      )}
      
      {/* Campo de entrada de texto */}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
      />
    </div>
  );
};

export default Input;