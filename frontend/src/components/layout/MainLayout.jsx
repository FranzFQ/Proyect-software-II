import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F4F7FE]">
      {/* Menú lateral fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal a la derecha que ocupa el resto del espacio */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;