import React from 'react';
import { NavLink } from 'react-router-dom';

// Recibimos 'onClose' para cerrar el menú en móviles al hacer clic en un link
const Sidebar = ({ onClose = () => {} }) => {
  const getLinkClass = ({ isActive }) => {
    const baseClass = "block px-4 py-3 rounded-md font-semibold transition-colors";
    const activeClass = "bg-blue-900/50 text-url-yellow";
    const inactiveClass = "text-gray-300 hover:bg-blue-800 hover:text-white";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  // En pantallas grandes, el menú siempre está visible. En móviles, se muestra u oculta según 'onClose'.
  return (
    <aside className="w-64 bg-url-blue text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-900 flex justify-between items-center">
        <div className="text-url-yellow font-bold text-xl text-center w-full">
          SISTEMA<br/>EVALUACIÓN
        </div>
        {/* Botón de cerrar solo visible en móviles (lg:hidden) */}
        <button onClick={onClose} className="lg:hidden text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}>
          Dashboard
        </NavLink>
        <NavLink to="/archivos" className={getLinkClass} onClick={onClose}>
          Archivos
        </NavLink>
        <NavLink to="/docentes" className={getLinkClass} onClick={onClose}>
          Docentes
        </NavLink>
        <NavLink to="/checklist" className={getLinkClass} onClick={onClose}>
          Checklist
        </NavLink>
        <NavLink to="/coordinadores" className={getLinkClass} onClick={onClose}>
          Coordinadores
        </NavLink>
      </nav>

      <div className="p-4 border-t border-blue-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400 shrink-0"></div>
        <div className="truncate">
          <p className="text-sm font-bold truncate">Juan Rodríguez</p>
          <p className="text-xs text-gray-400">Coordinador</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;