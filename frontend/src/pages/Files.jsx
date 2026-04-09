import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ModalPonderacion from '../components/common/ModalPonderacion';

import { 
  ArrowUpTrayIcon, TrashIcon, CheckCircleIcon, UserGroupIcon,
  DocumentTextIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, 
  HandRaisedIcon, CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Archivos = () => {
  const { documentos, setDocumentos, setEvaluacionesCompletadas } = useContext(AppContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Ponderaciones
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Modal Drag&Drop
  
  const [activeUploadId, setActiveUploadId] = useState(null); // Qué categoría estamos subiendo
  const [archivoTemporal, setArchivoTemporal] = useState(null); // Archivo seleccionado en el modal

  // --- CARGA DE ARCHIVO MEDIANTE MODAL ---
  const abrirModalCarga = (idCategoria) => {
    setActiveUploadId(idCategoria);
    setArchivoTemporal(null); // Limpiamos si había algo antes
    setIsUploadModalOpen(true);
  };

  const procesarCargaArchivo = () => {
    if (!archivoTemporal) {
      alert("Por favor selecciona un archivo.");
      return;
    }
    
    if (archivoTemporal.name.endsWith('.xlsx') || archivoTemporal.name.endsWith('.csv')) {
      setDocumentos(docs => docs.map(doc => 
        doc.id === activeUploadId ? { ...doc, estado: 'subido', nombreArchivo: archivoTemporal.name } : doc
      ));
      setIsUploadModalOpen(false);
      setArchivoTemporal(null);
    } else {
      alert("Formato no válido. Por favor suba únicamente archivos .xlsx o .csv");
    }
  };

  // --- ELIMINAR ARCHIVO ---
  const handleEliminar = (e, id) => {
    e.stopPropagation(); // Evitamos que abra el modal de carga al hacer clic en borrar
    setDocumentos(docs => docs.map(doc => 
      doc.id === id ? { ...doc, estado: 'pendiente', nombreArchivo: '' } : doc
    ));
  };

  const categoriasCompletadas = documentos.filter(d => d.estado === 'subido').length;

  const handleProcesarTotales = () => {
    if (categoriasCompletadas === 0) {
      alert("No hay archivos para procesar.");
      return;
    }
    const porcentaje = (categoriasCompletadas / 5) * 100;
    setEvaluacionesCompletadas(`${porcentaje}%`);
    alert(`¡Archivos procesados correctamente!\nAvance del semestre: ${porcentaje}%`);
  };

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

  // Buscamos el título de la categoría activa para mostrarlo en el Modal
  const categoriaActivaObj = documentos.find(d => d.id === activeUploadId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-url-blue mb-2">Carga de Archivos</h1>
        <p className="text-gray-500 text-lg">Semestre I — 2025 · {categoriasCompletadas} de 5 categorías completadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentos.map((doc) => (
          // Cambiamos el <label> por un <div> normal y agregamos el onClick para abrir el modal
          <div 
            key={doc.id} 
            onClick={() => doc.estado !== 'subido' ? abrirModalCarga(doc.id) : null}
            className={`bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group min-h-[120px] ${doc.estado === 'subido' ? 'border-green-200 cursor-default' : ''}`}
          >
            <div className="flex items-center gap-6 w-full">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm ${doc.estado === 'subido' ? 'bg-green-50 text-status-success' : 'bg-blue-50 text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}>
                 {getIconForCategory(doc.id)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.estado === 'subido' ? `Archivo cargado: ${doc.nombreArchivo}` : 'Hacer clic para subir archivo Excel o CSV'}
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
                  
                  {/* Botón de acción */}
                  <button 
                    onClick={(e) => doc.estado === 'subido' ? handleEliminar(e, doc.id) : null}
                    className={`px-4 py-1.5 border rounded-md text-sm font-semibold transition-colors flex items-center gap-2
                      ${doc.estado === 'subido' ? 'border-red-200 text-status-danger hover:bg-red-50' : 'border-url-blue text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}
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
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button variant="secondary" className="px-6 py-3 text-lg font-bold" onClick={() => setIsModalOpen(true)}>
          Ponderación
        </Button>
        <Button variant="primary" className="px-8 py-3 text-lg shadow-md" onClick={handleProcesarTotales}>
          Procesar Totales
        </Button>
      </div>

      {/* MODAL 1: Ponderaciones */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modificación de Ponderaciones">
        <ModalPonderacion onClose={() => setIsModalOpen(false)} />
      </Modal>

      {/* MODAL 2: Subir Archivo Drag & Drop */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={`Cargar: ${categoriaActivaObj?.titulo}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Sube el archivo Excel (.xlsx) o CSV con los resultados correspondientes a esta categoría de evaluación.
          </p>

          <label className="border-2 border-dashed border-url-blue bg-blue-50/50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .csv" 
              onChange={(e) => setArchivoTemporal(e.target.files[0])}
            />
            {archivoTemporal ? (
              <>
                <DocumentTextIcon className="w-16 h-16 text-url-blue" />
                <div className="text-center">
                  <p className="font-bold text-url-blue">{archivoTemporal.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Clic para cambiar archivo</p>
                </div>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-16 h-16 text-url-blue group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-bold text-url-blue text-lg">Haz clic o arrastra tu archivo aquí</p>
                  <p className="text-sm text-gray-500 mt-1">Formatos soportados: Excel, CSV</p>
                </div>
              </>
            )}
          </label>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setIsUploadModalOpen(false); setArchivoTemporal(null); }}>Cancelar</Button>
            <Button variant="primary" onClick={procesarCargaArchivo}>Subir Archivo</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Archivos;