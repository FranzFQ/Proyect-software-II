import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-url-blue mb-8">
        Configuración Base Exitosa
      </h1>
      
      {/* Prueba de colores globales */}
      <div className="flex gap-4">
        <button className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold hover:bg-yellow-500 transition-colors">
          Botón Institucional
        </button>
        <button className="bg-status-success text-white px-6 py-2 rounded-md font-bold">
          Estado Correcto
        </button>
      </div>
    </div>
  );
}

export default App;