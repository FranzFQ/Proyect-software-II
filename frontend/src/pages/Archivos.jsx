
import React, { useState } from 'react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ModalPonderacion from '../components/common/ModalPonderacion';
// 

// Ahora esto es el estado inicial, no una constante fija
const documentosIniciales = [
  { id: 'estudiantil', titulo: 'Evaluación Estudiantil', estado: 'pendiente', nombreArchivo: '' },
  { id: 'autoevaluacion', titulo: 'Autoevaluaciones', estado: 'pendiente', nombreArchivo: '' },
  { id: 'coordinador', titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
  { id: 'ceat', titulo: 'Evaluaciones CEAT', estado: 'pendiente', nombreArchivo: '' }, 
  { id: 'apoyo', titulo: 'Apoyo y Colaboración', estado: 'pendiente', nombreArchivo: '' },
];

// Página de carga de archivos con estado dinámico para cada documento
const Archivos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Controlamos los documentos con React State
  const [documentos, setDocumentos] = useState(documentosIniciales);

  // Validación y carga del archivo
  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        // Actualizamos el estado de ESA tarjeta en específico
        setDocumentos(docs => docs.map(doc => 
          doc.id === id ? { ...doc, estado: 'subido', nombreArchivo: file.name } : doc
        ));
      } else {
        alert("Formato no válido. Por favor suba únicamente archivos .xlsx o .csv");
      }
    }
    // Reseteamos el input para que permita subir el mismo archivo si se borra
    e.target.value = null; 
  };

  // Función para eliminar archivo cargado
  const handleEliminar = (e, id) => {
    e.preventDefault();
    setDocumentos(docs => docs.map(doc => 
      doc.id === id ? { ...doc, estado: 'pendiente', nombreArchivo: '' } : doc
    ));
  };

  const categoriasCompletadas = documentos.filter(d => d.estado === 'subido').length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-url-blue mb-2">Carga de Archivos</h1>
        <p className="text-gray-500 text-lg">Semestre I — 2025 · {categoriasCompletadas} de 5 categorías completadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentos.map((doc) => (
          <label 
            key={doc.id} 
            className={`bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group min-h-[120px] relative ${doc.estado === 'subido' ? 'pointer-events-none border-green-200' : ''}`}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .csv" 
              disabled={doc.estado === 'subido'}
              onChange={(e) => handleFileChange(e, doc.id)}
            />

            <div className="flex items-center gap-6 w-full">
              {/* Icono de la tarjeta */}
              <div className="w-16 h-16 bg-blue-50 text-url-blue rounded-xl flex items-center justify-center shrink-0">
                 {doc.id === 'ceat' && <span className="text-3xl">🏛️</span>}
                 {doc.id === 'estudiantil' && <span className="text-3xl">📝</span>}
                 {doc.id === 'autoevaluacion' && <span className="text-3xl">🔍</span>}
                 {doc.id === 'coordinador' && <span className="text-3xl">📋</span>}
                 {doc.id === 'apoyo' && <span className="text-3xl">🤝</span>}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.estado === 'subido' ? `Archivo cargado: ${doc.nombreArchivo}` : 'Subir archivo Excel o CSV'}
                </p>
                
                {/* Indicadores de estado */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${doc.estado === 'subido' ? 'bg-status-success' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm font-bold ${doc.estado === 'subido' ? 'text-status-success' : 'text-gray-400'}`}>
                      {doc.estado === 'subido' ? 'Cargado' : 'Sin cargar aún'}
                    </span>
                  </div>
                  
                  {/* Botón Quitar/Cargar */}
                  <button 
                    onClick={(e) => doc.estado === 'subido' ? handleEliminar(e, doc.id) : null}
                    className={`px-4 py-1.5 border rounded-md text-sm font-semibold transition-colors pointer-events-auto
                      ${doc.estado === 'subido' ? 'border-gray-300 text-gray-600 hover:bg-gray-100' : 'border-url-blue text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}
                  >
                    {doc.estado === 'subido' ? 'Quitar' : 'Cargar'}
                  </button>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button variant="secondary" className="px-6 py-3 text-lg font-bold" onClick={() => setIsModalOpen(true)}>
          Ponderación
        </Button>
        <Button variant="primary" className="px-8 py-3 text-lg shadow-md">
          Procesar
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modificación de Ponderaciones">
        <ModalPonderacion onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Archivos;