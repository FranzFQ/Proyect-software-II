// src/components/layout/MainLayout.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppContext } from '../../context/AppContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Ref para almacenar el temporizador
  const timerRef = useRef(null);
  
  // =================================================================
  // TIEMPO DE INACTIVIDAD (En milisegundos)
  // Para pruebas: 10000 (10 segundos)
  // Para producción: 15 * 60 * 1000 (15 minutos)
  // =================================================================
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos

  const handleLogout = () => {
    // Limpiamos el usuario del contexto y lo mandamos al login
    setCurrentUser(null);
    navigate('/login');
  };

  const resetTimer = () => {
    // Si ya hay un timer corriendo, lo destruimos
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Creamos uno nuevo que ejecutará handleLogout cuando acabe el tiempo
    timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Lista de eventos que demuestran que el usuario está "activo"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Función que se dispara en cada evento
    const handleActivity = () => {
      resetTimer();
    };
    
    // Asignamos el escuchador a todos esos eventos
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Iniciamos el temporizador por primera vez al cargar el componente
    resetTimer();

    // Función de limpieza cuando el componente se desmonta
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Fondo oscuro para móviles cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Navegación lateral) */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Barra superior solo visible en celulares (Reemplaza al Header) */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-20">
          <h1 className="font-bold text-url-blue text-lg">Sistema de Evaluación</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 hover:text-url-blue transition-colors focus:outline-none"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Área de renderizado (Dashboard, Perfiles, etc.) */}
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