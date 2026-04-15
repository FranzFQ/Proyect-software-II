import React from 'react';

// Agregamos zIndex="z-50" por defecto, para poder sobreescribirlo cuando necesitemos que un modal esté encima de otro
const Modal = ({ isOpen, onClose, title, children, zIndex = "z-50" }) => {
  if (!isOpen) return null;

  return (
    // Reemplazamos la clase estática z-50 por nuestra variable zIndex
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity`}>
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-url-blue">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-status-danger transition-colors"
            title="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;