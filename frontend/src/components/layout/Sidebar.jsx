// src/components/layout/Sidebar.jsx
import React, { useState, useContext } from 'react'; // Agregamos useContext
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext'; // Importamos el contexto
import { 
  HomeIcon, DocumentArrowUpIcon, UsersIcon, 
  ClipboardDocumentCheckIcon, UserGroupIcon, 
  ArrowLeftOnRectangleIcon, XMarkIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';
import logoUrl from '../../assets/logo-url.webp'; 

const Sidebar = ({ onClose = () => {} }) => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext); // Traemos el usuario activo
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-md font-semibold transition-colors ${isActive ? 'bg-blue-900/50 text-url-yellow' : 'text-gray-300 hover:bg-blue-800 hover:text-white'}`;
  };

  return (
    <aside className="w-64 bg-url-blue text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-900 flex justify-center items-center h-28 relative">
        <img src={logoUrl} alt="Logo URL" className="max-h-full max-w-full object-contain brightness-0 invert" />
        <button onClick={onClose} className="lg:hidden absolute right-4 text-gray-300 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}><HomeIcon className="w-5 h-5" /> Dashboard</NavLink>
        <NavLink to="/files" className={getLinkClass} onClick={onClose}><DocumentArrowUpIcon className="w-5 h-5" /> Archivos</NavLink>
        <NavLink to="/teachers" className={getLinkClass} onClick={onClose}><UsersIcon className="w-5 h-5" /> Docentes</NavLink>
        <NavLink to="/checklist" className={getLinkClass} onClick={onClose}><ClipboardDocumentCheckIcon className="w-5 h-5" /> Checklist</NavLink>
        
        {/* MAGIA: Solo se muestra si el rol es Administrador */}
        {currentUser.rol === 'Administrador' && (
          <NavLink to="/coordinators" className={getLinkClass} onClick={onClose}><UserGroupIcon className="w-5 h-5" /> Coordinadores</NavLink>
        )}
      </nav>

      <div className="relative p-4 border-t border-blue-900">
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl overflow-hidden text-gray-800 border border-gray-200">
            <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors font-semibold text-sm">
              <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Finalizar sesión
            </button>
          </div>
        )}
        <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-900/50 transition-colors focus:outline-none">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-url-yellow text-url-blue flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {currentUser.iniciales}
            </div>
            <div className="text-left truncate">
              <p className="text-sm font-bold truncate">{currentUser.nombre}</p>
              <p className="text-xs text-gray-400">{currentUser.rol}</p>
            </div>
          </div>
          <ChevronUpIcon className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;