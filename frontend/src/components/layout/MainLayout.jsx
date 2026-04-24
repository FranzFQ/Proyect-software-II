// src/components/layout/MainLayout.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppContext } from '../../context/AppContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Fondo oscuro para móviles cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Barra superior en móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-20">
          <h1 className="font-bold text-url-blue text-lg">Sistema de Evaluación</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 hover:text-url-blue transition-colors focus:outline-none"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Área de renderizado */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;