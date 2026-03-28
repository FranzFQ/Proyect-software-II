
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Importamos los Heroicons
import { 
  HomeIcon, 
  DocumentArrowUpIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Componente de Sidebar con navegación y perfil de usuario
const Sidebar = ({ onClose = () => {} }) => {
  const navigate = useNavigate();

  // Función para determinar las clases de los enlaces de navegación según si están activos o no
  const getLinkClass = ({ isActive }) => {
    // Agregamos flex y gap para alinear el ícono con el texto
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-md font-semibold transition-colors";
    const activeClass = "bg-blue-900/50 text-url-yellow";
    const inactiveClass = "text-gray-300 hover:bg-blue-800 hover:text-white";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Aquí a futuro el backend limpiará los tokens. Por ahora, navegamos al login.
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-url-blue text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-900 flex justify-between items-center">
        <div className="text-url-yellow font-bold text-xl text-center w-full">
          SISTEMA<br/>EVALUACIÓN
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-300 hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}>
          <HomeIcon className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink to="/archivos" className={getLinkClass} onClick={onClose}>
          <DocumentArrowUpIcon className="w-5 h-5" />
          Archivos
        </NavLink>
        <NavLink to="/docentes" className={getLinkClass} onClick={onClose}>
          <UsersIcon className="w-5 h-5" />
          Docentes
        </NavLink>
        <NavLink to="/checklist" className={getLinkClass} onClick={onClose}>
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          Checklist
        </NavLink>
        <NavLink to="/coordinadores" className={getLinkClass} onClick={onClose}>
          <UserGroupIcon className="w-5 h-5" />
          Coordinadores
        </NavLink>
      </nav>

      {/* Perfil y Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-blue-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-400 shrink-0"></div>
          <div className="truncate">
            <p className="text-sm font-bold truncate">Juan Rodríguez</p>
            <p className="text-xs text-gray-400">Coordinador</p>
          </div>
        </div>
        
        {/* Nuevo botón de Finalizar Sesión */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors font-semibold"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Finalizar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;