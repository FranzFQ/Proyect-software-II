import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ModalPonderacion from '../components/common/ModalPonderacion';
import { API_URL } from '../services/global_URL';

import { 
  ArrowUpTrayIcon, TrashIcon, CheckCircleIcon, UserGroupIcon,
  DocumentTextIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, 
  HandRaisedIcon, CloudArrowUpIcon, ChevronDownIcon, FolderOpenIcon, 
  Cog6ToothIcon, BookOpenIcon, IdentificationIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Files = () => {
  const navigate = useNavigate();
  const { documentos, setDocumentos, setEvaluacionesCompletadas } = useContext(AppContext);
  
  // --- ESTADOS DE UI ---
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
  const [alertMessage, setAlertMessage] = useState(''); 
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // --- ESTADOS DE CARGA Y BACKEND ---
  const [activeUploadId, setActiveUploadId] = useState(null); 
  const [archivoTemporal, setArchivoTemporal] = useState(null); 
  const [cargando, setCargando] = useState(false);

  // Mapeo de IDs internos a nombres de origen esperados por el backend (IngestaViewSet)
  const mapIdToOrigen = (id) => {
    switch(id) {
      case 'ceat': return 'ceat';
      case 'estudiantil': return 'evaluacion_docente';
      case 'autoevaluacion': return 'control_docente'; 
      case 'coordinador': return 'control_docente';
      case 'nomina': return 'nomina';
      case 'pensum': return 'pensum';
      default: return id;
    }
  };

  const abrirModalCarga = (idCategoria) => { 
    setActiveUploadId(idCategoria); 
    setArchivoTemporal(null); 
    setIsUploadModalOpen(true); 
  };
  
  const procesarCargaArchivo = () => {
    if (!archivoTemporal) return setAlertMessage("Por favor selecciona un archivo.");
    
    const fileName = archivoTemporal.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      setDocumentos(docs => docs.map(doc => 
        doc.id === activeUploadId 
          ? { ...doc, estado: 'subido', nombreArchivo: archivoTemporal.name, file: archivoTemporal } 
          : doc
      ));
      setIsUploadModalOpen(false); 
      setArchivoTemporal(null);
    } else { 
      setAlertMessage("Formato no válido. Por favor suba únicamente archivos .xlsx, .xls o .csv"); 
    }
  };

  const handleEliminar = (e, id) => { 
    e.stopPropagation(); 
    setDocumentos(docs => docs.map(doc => doc.id === id ? { ...doc, estado: 'pendiente', nombreArchivo: '', file: null } : doc)); 
  };
  
  const categoriasCompletadas = documentos.filter(d => d.estado === 'subido').length;
  
  // --- LÓGICA DE FETCH AL BACKEND ---
  const handleProcesarTotales = async () => {
    const archivosAProcesar = documentos.filter(doc => doc.estado === 'subido' && doc.file);

    if (archivosAProcesar.length === 0) {
      setAlertMessage("No hay archivos cargados para procesar.");
      return;
    }
    
    setCargando(true);
    let errores = [];
    let exitos = 0;

    // Ordenamos para procesar PENSUM y NOMINA primero (importante para la BD)
    const ordenados = [...archivosAProcesar].sort((a, b) => {
      if (a.id === 'pensum') return -1;
      if (b.id === 'pensum') return 1;
      if (a.id === 'nomina') return -1;
      if (b.id === 'nomina') return 1;
      return 0;
    });

    for (const doc of ordenados) {
      const formData = new FormData();
      formData.append('archivo', doc.file);
      formData.append('tipo', mapIdToOrigen(doc.id)); // Usar 'tipo' en lugar de 'origen' para el backend

      try {
        const response = await fetch(`${API_URL}evaluaciones/ingesta/subir-archivo/`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          exitos++;
        } else {
          errores.push(`${doc.titulo}: ${data.error || data.message || "Error desconocido"}`);
        }
      } catch (error) {
        errores.push(`${doc.titulo}: Error de conexión con el servidor`);
      }
    }

    setCargando(false);

    if (exitos > 0) {
      const porcentaje = Math.round((categoriasCompletadas / documentos.length) * 100);
      setEvaluacionesCompletadas(`${porcentaje}%`);
      
      let msg = `¡Proceso completado!\nArchivos procesados con éxito: ${exitos}`;
      if (errores.length > 0) {
        msg += `\n\nErrores encontrados:\n${errores.join('\n')}`;
      }
      setAlertMessage(msg);
    } else if (errores.length > 0) {
      setAlertMessage(`Error al procesar archivos:\n${errores.join('\n')}`);
    }
  };

  const getIconForCategory = (id) => {
    switch(id) {
      case 'pensum': return <BookOpenIcon className="w-8 h-8" />;
      case 'nomina': return <IdentificationIcon className="w-8 h-8" />;
      case 'estudiantil': return <UserGroupIcon className="w-8 h-8" />;
      case 'autoevaluacion': return <DocumentTextIcon className="w-8 h-8" />;
      case 'coordinador': return <ClipboardDocumentCheckIcon className="w-8 h-8" />;
      case 'ceat': return <AcademicCapIcon className="w-8 h-8" />;
      case 'apoyo': return <HandRaisedIcon className="w-8 h-8" />;
      default: return <DocumentTextIcon className="w-8 h-8" />;
    }
  };

  const categoriaActivaObj = documentos.find(d => d.id === activeUploadId);

  // Filtramos para NO mostrar Pensum y Nómina en el grid principal
  const documentosGrid = documentos.filter(doc => doc.id !== 'pensum' && doc.id !== 'nomina');

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#112240] mb-2">Carga de Archivos e Información</h1>
        <p className="text-gray-500 text-lg">Semestre I — 2025 · {categoriasCompletadas} de {documentos.length} archivos cargados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentosGrid.map((doc) => (
          <div key={doc.id} onClick={() => doc.estado !== 'subido' ? abrirModalCarga(doc.id) : null} className={`bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group min-h-[140px] ${doc.estado === 'subido' ? 'border-green-200 cursor-default' : ''}`}>
            <div className="flex items-center gap-6 w-full">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm ${doc.estado === 'subido' ? 'bg-green-50 text-status-success' : 'bg-blue-50 text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}>
                 {getIconForCategory(doc.id)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.estado === 'subido' ? `Archivo cargado: ${doc.nombreArchivo}` : 'Hacer clic para subir archivo (.xlsx, .xls, .csv)'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc.estado === 'subido' ? <CheckCircleSolid className="w-5 h-5 text-status-success" /> : <CheckCircleIcon className="w-5 h-5 text-gray-300" />}
                    <span className={`text-sm font-bold ${doc.estado === 'subido' ? 'text-status-success' : 'text-gray-400'}`}>{doc.estado === 'subido' ? 'Listo para procesar' : 'Sin cargar aún'}</span>
                  </div>
                  <button onClick={(e) => doc.estado === 'subido' ? handleEliminar(e, doc.id) : null} className={`px-4 py-1.5 border rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${doc.estado === 'subido' ? 'border-red-200 text-status-danger hover:bg-red-50' : 'border-url-blue text-url-blue group-hover:bg-url-blue group-hover:text-white'}`}>
                    {doc.estado === 'subido' ? <><TrashIcon className="w-4 h-4" /> Quitar</> : <><ArrowUpTrayIcon className="w-4 h-4" /> Cargar</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition-all min-h-[140px]">
           <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-blue-50 text-url-blue flex items-center justify-center shrink-0 shadow-sm">
                 <ClipboardDocumentCheckIcon className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="font-bold text-gray-800 text-lg">Checklists creadas</h3>
                 <p className="text-sm text-gray-500 mt-1 leading-snug">Visitas realizadas por el coordinador a los catedráticos</p>
              </div>
           </div>
           <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-bold text-[#112240] bg-gray-100 px-3 py-1 rounded-md">Creadas: 3</span>
              <button onClick={() => navigate('/checklist')} className="px-5 py-1.5 bg-url-yellow text-[#112240] border border-transparent rounded-md text-sm font-bold hover:bg-yellow-500 transition-colors shadow-sm">Ver detalles</button>
           </div>
        </div>
      </div>

      <div className="flex justify-end flex-wrap mt-4 gap-4">
        
        <Button variant="primary" className="px-6 py-3 text-lg font-bold flex items-center gap-2 shadow-md" onClick={() => setIsModalOpen(true)}>
          <Cog6ToothIcon className="w-6 h-6" /> Editar Ponderación
        </Button>

        <div className="relative">
          <Button variant="primary" className="px-6 py-3 text-lg font-bold flex items-center gap-2 shadow-md" onClick={() => setIsConfigOpen(!isConfigOpen)}>
            <FolderOpenIcon className="w-6 h-6" /> Archivos Principales <ChevronDownIcon className={`w-4 h-4 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {isConfigOpen && (
             <div className="absolute bottom-full right-0 mb-3 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 p-3 flex flex-col gap-2">
                <button onClick={() => { setIsConfigOpen(false); abrirModalCarga('nomina'); }} className="w-full text-center px-4 py-3 text-sm font-bold bg-blue-50 text-url-blue rounded-lg border border-blue-100 hover:bg-url-blue hover:text-white transition-all shadow-sm">
                  Agregar Docentes
                </button>
                <button onClick={() => { setIsConfigOpen(false); abrirModalCarga('pensum'); }} className="w-full text-center px-4 py-3 text-sm font-bold bg-blue-50 text-url-blue rounded-lg border border-blue-100 hover:bg-url-blue hover:text-white transition-all shadow-sm">
                  Agregar Pensum
                </button>
             </div>
          )}
        </div>

        <Button 
          variant="primary" 
          className="px-6 py-3 text-lg font-bold flex items-center gap-2 shadow-md" 
          onClick={handleProcesarTotales}
          disabled={cargando || categoriasCompletadas === 0}
        >
          {cargando ? 'Procesando...' : 'Procesar Archivos'}
        </Button>
      </div>

      <Modal isOpen={!!alertMessage} onClose={() => setAlertMessage('')} title="Aviso del Sistema" zIndex="z-[60]">
         <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${alertMessage.includes('No hay') || alertMessage.includes('válido') || alertMessage.includes('selecciona') || alertMessage.includes('Error') ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
               {alertMessage.includes('No hay') || alertMessage.includes('válido') || alertMessage.includes('selecciona') || alertMessage.includes('Error') ? <TrashIcon className="w-8 h-8" /> : <CheckCircleIcon className="w-8 h-8" />}
            </div>
            <p className="text-lg text-[#112240] text-center font-bold whitespace-pre-line">{alertMessage}</p>
            <Button variant="primary" className="mt-8 w-full py-3" onClick={() => setAlertMessage('')}>Aceptar y Continuar</Button>
         </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modificación de Ponderaciones">
        <ModalPonderacion 
        onClose={(msg) => {
          setIsModalOpen(false);
          if (msg) setAlertMessage(msg); 
          }} 
          onError={(msg) => setAlertMessage(msg)} 
        />
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={`Cargar: ${categoriaActivaObj?.titulo}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Sube el archivo (.xlsx, .xls, .csv) con los resultados correspondientes a esta categoría.</p>
          <label className="border-2 border-dashed border-url-blue bg-blue-50/50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={(e) => setArchivoTemporal(e.target.files[0])}
            />
            {archivoTemporal ? (
              <div className="text-center"><DocumentTextIcon className="w-16 h-16 text-url-blue mx-auto" /><p className="font-bold text-url-blue mt-2">{archivoTemporal.name}</p><p className="text-xs text-gray-500 mt-1">Clic para cambiar archivo</p></div>
            ) : (
              <div className="text-center"><CloudArrowUpIcon className="w-16 h-16 text-url-blue mx-auto group-hover:scale-110 transition-transform" /><p className="font-bold text-url-blue text-lg mt-2">Haz clic o arrastra tu archivo aquí</p><p className="text-sm text-gray-500 mt-1">Formatos: .xlsx, .xls, .csv</p></div>
            )}
          </label>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setIsUploadModalOpen(false); setArchivoTemporal(null); }}>Cancelar</Button>
            <Button variant="primary" onClick={procesarCargaArchivo}>Cargar Archivo</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Files;