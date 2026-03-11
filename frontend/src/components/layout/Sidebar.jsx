// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // Esta función decide qué colores ponerle al botón dependiendo de si está "activo" o no
  const getLinkClass = ({ isActive }) => {
    const baseClass = "block px-4 py-3 rounded-md font-semibold transition-colors";
    const activeClass = "bg-blue-900/50 text-url-yellow";
    const inactiveClass = "text-gray-300 hover:bg-blue-800 hover:text-white";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <aside className="w-64 bg-url-blue text-white min-h-screen flex flex-col shadow-lg">
      
      {/* Área del Logo */}
      <div className="p-6 border-b border-blue-900 flex justify-center">
        <div className="text-url-yellow font-bold text-2xl text-center">
          SISTEMA<br/>EVALUACIÓN
        </div>
      </div>

      {/* Menú de navegación dinámico */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={getLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/archivos" className={getLinkClass}>
          Archivos
        </NavLink>
        
        {/* Dejamos las otras rutas preparadas */}
        <NavLink to="/docentes" className={getLinkClass}>
          Docentes
        </NavLink>
        <NavLink to="/checklist" className={getLinkClass}>
          Checklist
        </NavLink>
        <NavLink to="/coordinadores" className={getLinkClass}>
          Coordinadores
        </NavLink>
      </nav>

      {/* Perfil de usuario inferior */}
      <div className="p-4 border-t border-blue-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400"></div>
        <div>
          <p className="text-sm font-bold">Juan Rodríguez</p>
          <p className="text-xs text-gray-400">Coordinador</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;