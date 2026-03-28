// src/pages/Archivos.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext'; // Importamos el contexto global
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ModalPonderacion from '../components/common/ModalPonderacion';

import { 
  ArrowUpTrayIcon, TrashIcon, CheckCircleIcon, UserGroupIcon,
  DocumentTextIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, HandRaisedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Archivos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Usamos el estado global
  const { documentos, setDocumentos, setEvaluacionesCompletadas } = useContext(AppContext);

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        setDocumentos(docs => docs.map(doc => 
          doc.id === id ? { ...doc, estado: 'subido', nombreArchivo: file.name } : doc
        ));
      } else {
        alert("Formato no válido. Por favor suba únicamente archivos .xlsx o .csv");
      }
    }
    e.target.value = null; 
  };

  const handleEliminar = (e, id) => {
    e.preventDefault();
    setDocumentos(docs => docs.map(doc => 
      doc.id === id ? { ...doc, estado: 'pendiente', nombreArchivo: '' } : doc
    ));
  };

  const categoriasCompletadas = documentos.filter(d => d.estado === 'subido').length;

  const getIconForCategory = (id) => {
    switch(id) {
      case 'estudiantil': return <UserGroupIcon className="w-8 h-8" />;
      case 'autoevaluacion': return <DocumentTextIcon className="w-8 h-8" />;
      case 'coordinador': return <ClipboardDocumentCheckIcon className="w-8 h-8" />;
      case 'ceat': return <AcademicCapIcon className="w-8 h-8" />;
      case 'apoyo': return <HandRaisedIcon className="w-8 h-8" />;
      default: return <DocumentTextIcon className="w-8 h-8" />;
    }
  };

  // LÓGICA DE PROCESAR
  const handleProcesar = () => {
    if (categoriasCompletadas === 0) {
      alert("No hay archivos para procesar.");
      return;
    }
    const porcentaje = (categoriasCompletadas / 5) * 100;
    setEvaluacionesCompletadas(`${porcentaje}%`);
    alert(`¡Archivos procesados correctamente!\nAvance del semestre: ${porcentaje}%`);
  };

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
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm ${doc.estado === 'subido' ? 'bg-green-50 text-status-success' : 'bg-blue-50 text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}>
                 {getIconForCategory(doc.id)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.estado === 'subido' ? `Archivo cargado: ${doc.nombreArchivo}` : 'Subir archivo Excel o CSV'}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc.estado === 'subido' ? (
                      <CheckCircleSolid className="w-5 h-5 text-status-success" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-gray-300" />
                    )}
                    <span className={`text-sm font-bold ${doc.estado === 'subido' ? 'text-status-success' : 'text-gray-400'}`}>
                      {doc.estado === 'subido' ? 'Cargado' : 'Sin cargar aún'}
                    </span>
                  </div>
                  
                  {/* ARREGLO DEL BOTÓN: pointer-events-none si está pendiente para no bloquear el input file */}
                  <button 
                    onClick={(e) => doc.estado === 'subido' ? handleEliminar(e, doc.id) : null}
                    className={`px-4 py-1.5 border rounded-md text-sm font-semibold transition-colors flex items-center gap-2
                      ${doc.estado === 'subido' ? 'border-red-200 text-status-danger hover:bg-red-50 pointer-events-auto' : 'border-url-blue text-url-blue group-hover:bg-url-blue group-hover:text-white pointer-events-none'}`}
                  >
                    {doc.estado === 'subido' ? (
                      <><TrashIcon className="w-4 h-4" /> Quitar</>
                    ) : (
                      <><ArrowUpTrayIcon className="w-4 h-4" /> Cargar</>
                    )}
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
        <Button variant="primary" className="px-8 py-3 text-lg shadow-md" onClick={handleProcesar}>
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