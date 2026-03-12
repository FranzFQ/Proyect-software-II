import React, { useState } from 'react';
import Sidebar from './Sidebar';

// El MainLayout es el contenedor principal que incluye el Sidebar y el área de contenido
const MainLayout = ({ children }) => {
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F7FE]">
      
      {/* 1. Fondo oscuro semitransparente (Overlay) para móviles cuando el menú está abierto */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Contenedor del Sidebar: 
          - En móviles (fuera de pantalla por defecto, entra con translate-x-0)
          - En escritorio (lg: relative, siempre visible) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* 3. Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra superior (Header) SOLO para celulares */}
        <div className="lg:hidden bg-url-blue text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold text-url-yellow text-lg">SISTEMA EVALUACIÓN</span>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 focus:outline-none focus:ring-2 focus:ring-url-yellow rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* El contenido de las páginas (Dashboard, Archivos, etc.) */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
};

export default MainLayout;