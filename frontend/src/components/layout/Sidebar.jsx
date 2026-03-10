import React from 'react';

const Sidebar = () => { // Componente de barra lateral fija con menú de navegación
  return (
    <aside className="w-64 bg-url-blue text-white min-h-screen flex flex-col shadow-lg">
      {/* Área del Logo */}
      <div className="p-6 border-b border-blue-900 flex justify-center">
        {/* Aquí se reemplazara el src por el logo real */}
        <div className="text-url-yellow font-bold text-2xl text-center">
          SISTEMA<br/>EVALUACIÓN
        </div>
      </div>

      {/* Menú de navegación provisional */}
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="block px-4 py-3 bg-blue-900/50 rounded-md text-url-yellow font-semibold hover:bg-blue-800 transition">
          Dashboard
        </a>
        <a href="#" className="block px-4 py-3 rounded-md text-gray-300 hover:bg-blue-800 hover:text-white transition">
          Archivos
        </a>
        <a href="#" className="block px-4 py-3 rounded-md text-gray-300 hover:bg-blue-800 hover:text-white transition">
          Resultados
        </a>
      </nav>

      {/* Perfil de usuario inferior */}
      <div className="p-4 border-t border-blue-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400"></div> {/* Avatar placeholder */}
        <div>
          <p className="text-sm font-bold">Juan Rodríguez</p>
          <p className="text-xs text-gray-400">Coordinador</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;