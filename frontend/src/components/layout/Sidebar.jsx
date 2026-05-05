import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  HomeIcon, DocumentArrowUpIcon, UsersIcon, 
  ClipboardDocumentCheckIcon, UserGroupIcon, 
  ArrowLeftOnRectangleIcon, XMarkIcon, ChevronUpIcon, 
  Cog6ToothIcon, CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import logoUrl from '../../assets/logo-url.webp'; 

const Sidebar = ({ onClose = () => {} }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(AppContext);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Diseño mejorado para el enlace activo (Borde izquierdo y gradiente)
  const getLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-url-yellow/10 to-transparent text-url-yellow border-l-4 border-url-yellow shadow-sm' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
    }`;
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setCurrentUser(null); 
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#112240] text-white min-h-screen flex flex-col shadow-2xl relative z-50">
      
      {/* Logo */}
      <div className="p-6 flex justify-center items-center h-28 relative mb-2">
        <img src={logoUrl} alt="Logo URL" className="max-h-full max-w-full object-contain brightness-0 invert drop-shadow-md" />
        <button onClick={onClose} className="lg:hidden absolute right-4 text-gray-400 hover:text-white transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navegación dividida por categorías */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto">
        
        {/* Categoría 1: Principal */}
        <div>
          <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Menú Principal</p>
          <div className="space-y-1">
            <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}>
              <HomeIcon className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink to="/files" className={getLinkClass} onClick={onClose}>
              <DocumentArrowUpIcon className="w-5 h-5" /> Archivos
            </NavLink>
            <NavLink to="/teachers" className={getLinkClass} onClick={onClose}>
              <UsersIcon className="w-5 h-5" /> Docentes
            </NavLink>
            <NavLink to="/checklist" className={getLinkClass} onClick={onClose}>
              <ClipboardDocumentCheckIcon className="w-5 h-5" /> Checklists
            </NavLink>
          </div>
        </div>
        
        {/* Categoría 2: Administración (Oculto si no es admin) */}
        {currentUser?.rol === 'Administrador' && (
          <div>
            <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Administración</p>
            <div className="space-y-1">
              <NavLink to="/semesters" className={getLinkClass} onClick={onClose}>
                <CalendarDaysIcon className="w-5 h-5" /> Semestres
              </NavLink>
              <NavLink to="/coordinators" className={getLinkClass} onClick={onClose}>
                <UserGroupIcon className="w-5 h-5" /> Coordinadores
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Perfil del Usuario convertido en un Widget Flotante */}
      <div className="p-4 mt-auto">
        <div className="relative bg-[#0a1526] rounded-2xl border border-white/5 shadow-lg">
          
          {/* Menú Desplegable */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-xl shadow-xl overflow-hidden text-gray-800 border border-gray-200 z-50">
              <button onClick={() => { setIsProfileMenuOpen(false); navigate('/profile-settings'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors font-bold text-sm border-b border-gray-100">
                <Cog6ToothIcon className="w-5 h-5 text-gray-400" /> Configuración
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors font-bold text-sm">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-400" /> Cerrar sesión
              </button>
            </div>
          )}

          {/* Botón Principal del Widget */}
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors focus:outline-none">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-url-yellow text-url-blue flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                {currentUser?.iniciales || 'U'}
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-bold text-white truncate">{currentUser?.nombre || 'Usuario'}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{currentUser?.rol || 'Rol'}</p>
              </div>
            </div>
            <ChevronUpIcon className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;