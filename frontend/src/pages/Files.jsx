import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ModalPonderacion from '../components/common/ModalPonderacion';

import { subirExcels } from '../services/evaluaciones_service';
import { getChecklistCount } from '../services/checklist_service';

import { 
  ArrowUpTrayIcon, TrashIcon, CheckCircleIcon, UserGroupIcon,
  DocumentTextIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, 
  CloudArrowUpIcon, ChevronDownIcon, FolderOpenIcon, 
  Cog6ToothIcon, BookOpenIcon, IdentificationIcon, ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Files = () => {
  const navigate = useNavigate();
  const { 
    documentos = [], 
    setDocumentos, 
    setEvaluacionesCompletadas, 
    showToast = () => {},
    semestreActivo
  } = useContext(AppContext) || {};
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);

  const [activeUploadId, setActiveUploadId] = useState(null); 
  const [archivoTemporal, setArchivoTemporal] = useState(null); 
  const [cargando, setCargando] = useState(false);
  const [checklistCount, setChecklistCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getChecklistCount();
        setChecklistCount(data.count || 0);
      } catch (e) {
        console.error("Error fetching checklist count:", e);
      }
    };
    fetchCount();
  }, [semestreActivo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mapIdToOrigen = (id) => {
    switch(id) {
      case 'ceat': return 'ceat';
      case 'estudiantil': return 'evaluacion_docente';
      case 'coordinador': return 'control_docente';
      case 'nomina': return 'nomina';
      case 'pensum': return 'pensum';
      case 'comentarios': return 'comentarios';
      default: return id;
    }
  };

  // Solo 3 categorías principales requeridas para el 100% de la barra de progreso
  const categoriasPrincipalesIds = ['estudiantil', 'coordinador', 'ceat', 'comentarios'];
  const completadasPrincipales = documentos.filter(d => d.estado === 'subido' && categoriasPrincipalesIds.includes(d.id)).length;

  const abrirModalCarga = (idCategoria) => { 
    setActiveUploadId(idCategoria); 
    setArchivoTemporal(null); 
    setIsUploadModalOpen(true); 
  };
  
  const procesarCargaArchivo = async () => {
    if (!archivoTemporal) return showToast("Por favor selecciona un archivo.", "error");
    
    const fileName = archivoTemporal.name.toLowerCase();
    const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
    
    if (!isValidFormat) return showToast("Formato no válido. Por favor suba únicamente archivos .xlsx", "error");

    if (activeUploadId === 'nomina' || activeUploadId === 'pensum') {
      setCargando(true);
      const formData = new FormData();
      formData.append('archivo', archivoTemporal);
      formData.append('tipo', mapIdToOrigen(activeUploadId));

      try {
        await subirExcels(formData);
        
        setDocumentos(docs => docs.map(doc => 
          doc.id === activeUploadId 
            ? { ...doc, estado: 'subido', nombreArchivo: archivoTemporal.name, file: null }
            : doc
        ));
        showToast(`¡${activeUploadId.toUpperCase()} cargado con éxito!`, "success");
        setIsUploadModalOpen(false);
      } catch (error) {
        showToast(`Error al cargar ${activeUploadId}: ${error.message || "Error desconocido"}`, "error");
      } finally {
        setCargando(false);
        setArchivoTemporal(null);
      }
      return;
    }

    setDocumentos(docs => docs.map(doc => doc.id === activeUploadId ? { ...doc, estado: 'subido', nombreArchivo: archivoTemporal.name, file: archivoTemporal } : doc));
    setIsUploadModalOpen(false); 
    setArchivoTemporal(null);
    showToast("Archivo cargado y listo para procesar.", "success");
  };

  const handleEliminar = (e, id) => { 
    e.stopPropagation(); 
    setDocumentos(docs => docs.map(doc => doc.id === id ? { ...doc, estado: 'pendiente', nombreArchivo: '', file: null } : doc)); 
  };
  
  const handleProcesarTotales = async () => {
    const archivosAProcesar = documentos.filter(doc => doc.estado === 'subido' && doc.file);

    if (archivosAProcesar.length === 0) return showToast("No hay archivos cargados para procesar.", "error");
    
    setCargando(true);
    let errores = [];
    let exitos = 0;

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
      formData.append('tipo', mapIdToOrigen(doc.id));

      try {
        await subirExcels(formData);
        exitos++;
      } catch (error) {
        errores.push(`${doc.titulo}: ${error.message}`);
      }
    }

    setCargando(false);

    if (exitos > 0) {
      const porcentaje = Math.round((completadasPrincipales / documentosGrid.length) * 100);
      setEvaluacionesCompletadas(`${porcentaje}%`);
      showToast(`¡Proceso completado! Archivos procesados con éxito: ${exitos}`, "success");
      if (errores.length > 0) showToast("Se guardaron algunos archivos pero otros tuvieron errores.", "error");
    } else if (errores.length > 0) {
      showToast(`Error al procesar archivos. Revisa el formato.`, "error");
    }
  };

  const getIconForCategory = (id) => {
    switch(id) {
      case 'pensum': return <BookOpenIcon className="w-8 h-8" />;
      case 'nomina': return <IdentificationIcon className="w-8 h-8" />;
      case 'comentarios': return <ChatBubbleLeftIcon className="w-8 h-8" />;
      case 'estudiantil': return <UserGroupIcon className="w-8 h-8" />;
      case 'coordinador': return <ClipboardDocumentCheckIcon className="w-8 h-8" />;
      case 'ceat': return <AcademicCapIcon className="w-8 h-8" />;
      default: return <DocumentTextIcon className="w-8 h-8" />;
    }
  };

  const categoriaActivaObj = documentos.find(d => d.id === activeUploadId);
  
  // Ignoramos completamente Autoevaluacion y Apoyo en el Grid visual
  const documentosGrid = documentos.filter(doc => 
    doc.id !== 'pensum' && doc.id !== 'nomina' && doc.id !== 'autoevaluacion' && doc.id !== 'apoyo'
  );

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#112240] mb-2">Carga de Archivos e Información</h1>
        <p className="text-gray-500 font-medium">Carga de archivos para el semestre: {semestreActivo || 'Cargando semestre...'} · {completadasPrincipales} de {documentosGrid.length} archivos cargados</p>
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
                <p className="text-sm text-gray-500 mt-1">{doc.estado === 'subido' ? `Archivo cargado: ${doc.nombreArchivo}` : 'Hacer clic para subir archivo (.xlsx)'}</p>
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

        {/* Tarjeta de Checklists */}
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
              <span className="text-sm font-bold text-[#112240] bg-gray-100 px-3 py-1 rounded-md">Creadas: {checklistCount}</span>
              <button onClick={() => navigate('/checklist')} className="px-5 py-1.5 bg-url-yellow text-[#112240] border border-transparent rounded-md text-sm font-bold hover:bg-yellow-500 transition-colors shadow-sm">Ver detalles</button>
           </div>
        </div>

        {/* LOS BOTONES DE ACCIÓN */}
        <div className="flex flex-col lg:flex-row justify-end items-end gap-3 h-full pt-4 md:pt-0 w-full" ref={dropdownContainerRef}>
           
           <div className="relative w-full lg:w-auto">
             <Button 
               variant="primary" 
               className="w-full lg:w-auto px-6 py-0 h-[44px] text-sm font-bold flex justify-center items-center gap-2 shadow-sm bg-url-yellow text-[#112240] hover:bg-yellow-500 border-none transition-colors" 
               onClick={() => setActiveDropdown(prev => prev === 'config' ? null : 'config')}
             >
               <Cog6ToothIcon className="w-5 h-5" /> Configuración <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'config' ? 'rotate-180' : ''}`} />
             </Button>
             
             {activeDropdown === 'config' && (
                <div className="absolute bottom-full right-0 mb-2 w-full lg:w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1">
                   <button onClick={() => { setActiveDropdown(null); setIsModalOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100">
                     Editar ponderación
                   </button>
                </div>
             )}
           </div>

           <div className="relative w-full lg:w-auto">
             <Button 
               variant="primary" 
               className="w-full lg:w-auto px-6 py-0 h-[44px] text-sm font-bold flex justify-center items-center gap-2 shadow-sm bg-url-yellow text-[#112240] hover:bg-yellow-500 border-none transition-colors" 
               onClick={() => setActiveDropdown(prev => prev === 'archivos' ? null : 'archivos')}
             >
               <FolderOpenIcon className="w-5 h-5" /> Archivos Principales <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'archivos' ? 'rotate-180' : ''}`} />
             </Button>
             
             {activeDropdown === 'archivos' && (
                <div className="absolute bottom-full right-0 mb-2 w-full lg:w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1">
                   <button onClick={() => { setActiveDropdown(null); abrirModalCarga('nomina'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-url-blue hover:bg-blue-50 rounded-lg transition-colors border-b border-gray-100">
                     Agregar Docentes
                   </button>
                   <button onClick={() => { setActiveDropdown(null); abrirModalCarga('pensum'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-url-blue hover:bg-blue-50 rounded-lg transition-colors">
                     Agregar Pensum
                   </button>
                </div>
             )}
           </div>

           <Button 
             variant="primary" 
             className="w-full lg:w-auto px-6 py-0 h-[44px] text-sm font-bold flex justify-center items-center gap-2 shadow-sm bg-[#112240] hover:bg-blue-900 border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
             onClick={handleProcesarTotales}
             disabled={cargando || completadasPrincipales === 0}
           >
             {cargando ? 'Procesando...' : 'Procesar Archivos'}
           </Button>
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modificación de Ponderaciones">
        <ModalPonderacion onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={categoriaActivaObj ? `Cargar: ${categoriaActivaObj.titulo}` : 'Cargar Archivo'}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Sube el archivo (.xlsx) con los resultados correspondientes a esta categoría.</p>
          <label className="border-2 border-dashed border-url-blue bg-blue-50/50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => setArchivoTemporal(e.target.files[0])} />
            {archivoTemporal ? (
              <div className="text-center"><DocumentTextIcon className="w-16 h-16 text-url-blue mx-auto" /><p className="font-bold text-url-blue mt-2">{archivoTemporal.name}</p><p className="text-xs text-gray-500 mt-1">Clic para cambiar archivo</p></div>
            ) : (
              <div className="text-center"><CloudArrowUpIcon className="w-16 h-16 text-url-blue mx-auto group-hover:scale-110 transition-transform" /><p className="font-bold text-url-blue text-lg mt-2">Haz clic o arrastra tu archivo aquí</p><p className="text-sm text-gray-500 mt-1">Formatos: .xlsx</p></div>
            )}
          </label>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setIsUploadModalOpen(false); setArchivoTemporal(null); }}>Cancelar</Button>
            <Button variant="primary" onClick={procesarCargaArchivo} className="bg-[#112240] hover:bg-blue-900 border-none shadow-sm">Cargar Archivo</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Files;