// src/pages/Archivos.jsx
import React from 'react';
import Button from '../components/common/Button';

// Exactamente los 5 criterios mencionados
const documentos = [
  { id: 'estudiantil', titulo: 'Evaluación Estudiantil', estado: 'pendiente' },
  { id: 'autoevaluacion', titulo: 'Autoevaluaciones', estado: 'pendiente' },
  { id: 'coordinador', titulo: 'Criterios de Coordinador', estado: 'pendiente' },
  { id: 'ceat', titulo: 'Evaluaciones CEAT', estado: 'subido' }, // Simulado como subido para ver los íconos
  { id: 'apoyo', titulo: 'Apoyo y Colaboración', estado: 'pendiente' },
];

const Archivos = () => {
  return (
    <div className="flex flex-col gap-8"> {/* Aumenté el gap general para dar más aire */}
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-url-blue mb-2">Carga de Archivos de Evaluación</h1>
        <p className="text-gray-500 text-lg">Seleccione el tipo de documento y suba el archivo correspondiente (.xlsx, .csv)</p>
      </div>

      {/* Grid de Tarjetas (2 columnas en pantallas grandes para que sean más anchas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentos.map((doc) => (
          <div 
            key={doc.id} 
            className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group min-h-[120px]"
          >
            <div className="flex items-center gap-6">
              {/* Icono del documento más grande */}
              <div className="w-16 h-16 bg-blue-50 text-url-blue rounded-xl flex items-center justify-center group-hover:bg-url-blue group-hover:text-white transition-colors shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              
              {/* Textos más grandes */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.estado === 'subido' ? 'Archivo cargado correctamente' : 'Subir archivo Excel o CSV'}
                </p>
              </div>
            </div>

            {/* Zona de Acciones (Subir, Completado, Eliminar) */}
            <div>
              {doc.estado === 'subido' ? (
                // Si está subido, mostramos el basurero y el chequecito verde
                <div className="flex items-center gap-3">
                  {/* Botón de Eliminar (Basurero rojo) */}
                  <button 
                    className="w-10 h-10 bg-red-50 text-status-danger rounded-full flex items-center justify-center hover:bg-status-danger hover:text-white transition-colors"
                    title="Eliminar archivo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  
                  {/* Chequecito verde */}
                  <div className="w-10 h-10 bg-status-success rounded-full flex items-center justify-center text-white shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                // Si está pendiente, mostramos la flecha de subir
                <div className="w-12 h-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-url-yellow group-hover:border-url-yellow group-hover:text-url-blue transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción inferiores */}
      <div className="flex justify-end mt-4 gap-4">
        {/* Botón de Ponderación (para abrir el modal del siguiente mockup) */}
        <Button variant="secondary" className="px-6 py-3 text-lg font-bold">
          Configurar Ponderación
        </Button>
        
        {/* Botón de Procesar */}
        <Button variant="primary" className="px-8 py-3 text-lg shadow-md">
          Procesar Archivos
        </Button>
      </div>

    </div>
  );
};

export default Archivos;