// src/components/layout/MainLayout.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppContext } from '../../context/AppContext';
import { Bars3Icon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setCurrentUser, notification } = useContext(AppContext);
  const navigate = useNavigate();
  
  const timerRef = useRef(null);
  const INACTIVITY_LIMIT = 15 * 60 * 1000; 

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden relative">
      
      {/* NOTIFICACIÓN ESTÉTICA (TOAST) */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border animate-in fade-in slide-in-from-right-8 duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <InformationCircleIcon className="w-6 h-6 text-red-500" />}
          <p className="font-bold text-sm">{notification.message}</p>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-20">
          <h1 className="font-bold text-url-blue text-lg">Sistema de Evaluación</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 hover:text-url-blue transition-colors focus:outline-none">
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

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