// src/pages/Docentes.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { 
  EyeIcon, TrashIcon, ArrowUpTrayIcon, UserPlusIcon, 
  PencilSquareIcon, CloudArrowUpIcon, DocumentTextIcon 
} from '@heroicons/react/24/outline';

const Docentes = () => {
  const navigate = useNavigate();
  const { docentes, setDocentes } = useContext(AppContext);
  
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Estados para Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCargarDocentesOpen, setIsCargarDocentesOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  const [docenteActual, setDocenteActual] = useState(null);
  const [archivoDocentes, setArchivoDocentes] = useState(null);

  const docentesFiltrados = docentes.filter((doc) => {
    const coincideTexto = 
      doc.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      doc.codigo.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEstado = filtroEstado === '' || doc.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const renderEstado = (estado) => {
    const colores = {
      'Excelente': 'bg-green-100 text-green-700 border-green-200',
      'Buena': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Deficiente': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${colores[estado] || 'bg-gray-100'}`}>
        {estado}
      </span>
    );
  };

  const toggleFiltroEstado = (estado) => {
    setFiltroEstado(filtroEstado === estado ? '' : estado);
  };

  // --- ELIMINAR ---
  const confirmarEliminacion = (docente) => {
    setDocenteActual(docente);
    setIsDeleteModalOpen(true);
  };

  const ejecutarEliminacion = () => {
    setDocentes(docentes.filter(doc => doc.id !== docenteActual.id));
    setIsDeleteModalOpen(false);
    setDocenteActual(null);
  };

  // --- AGREGAR / EDITAR ---
  const abrirFormulario = (docente = null) => {
    setDocenteActual(docente);
    setIsFormModalOpen(true);
  };

  const guardarDocente = (e) => {
    e.preventDefault();
    alert(docenteActual ? "Docente actualizado con éxito" : "Nuevo docente agregado al sistema");
    setIsFormModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue mb-2 font-serif">Lista de Docentes</h1>
          <p className="text-gray-500">
            Mostrando {docentesFiltrados.length} de {docentes.length} docentes · Semestre I - 2025
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => setIsCargarDocentesOpen(true)}>
            <ArrowUpTrayIcon className="w-5 h-5" />
            Cargar Docentes
          </Button>
          <Button variant="primary" className="flex items-center gap-2" onClick={() => abrirFormulario(null)}>
            <UserPlusIcon className="w-5 h-5" />
            Agregar Docente
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input 
          type="text" 
          placeholder="Búsqueda por nombre o código..." 
          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-url-blue transition-shadow w-full"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => toggleFiltroEstado('Deficiente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Deficiente' ? 'bg-red-600 text-white shadow-md' : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'}`}>Deficiente</button>
          <button onClick={() => toggleFiltroEstado('Buena')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Buena' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'}`}>Buena</button>
          <button onClick={() => toggleFiltroEstado('Excelente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Excelente' ? 'bg-green-600 text-white shadow-md' : 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'}`}>Excelente</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm">Nombre / Código</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Cursos</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Facultad</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Ponderación</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Estado</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-semibold">
                    No se encontraron docentes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((doc, index) => (
                  <tr key={doc.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${doc.estado === 'Excelente' ? 'bg-url-yellow' : 'bg-url-blue'}`}>
                          {doc.iniciales}
                        </div>
                        <div>
                          <h4 className="font-bold text-url-blue">{doc.nombre}</h4>
                          <p className="text-xs text-gray-400">{doc.codigo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-url-blue">{doc.cursos}</td>
                    <td className="py-4 px-6 text-center text-url-blue font-semibold">{doc.facultad}</td>
                    <td className="py-4 px-6 text-center text-gray-600 font-bold">{doc.ponderacion}</td>
                    <td className="py-4 px-6 text-center">
                      {renderEstado(doc.estado)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate(`/docentes/${doc.id}`)} className="w-8 h-8 border-2 border-url-yellow text-url-yellow rounded-md flex items-center justify-center hover:bg-url-yellow hover:text-white transition-colors" title="Ver perfil">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {/* NUEVO: Botón Editar */}
                        <button onClick={() => abrirFormulario(doc)} className="w-8 h-8 border-2 border-blue-400 text-blue-500 rounded-md flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors" title="Editar docente">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmarEliminacion(doc)} className="w-8 h-8 border-2 border-red-200 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors" title="Eliminar docente">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AGREGAR / EDITAR DOCENTE */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={docenteActual ? "Editar Docente" : "Agregar Nuevo Docente"}>
        <form onSubmit={guardarDocente} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
              <input type="text" defaultValue={docenteActual?.nombre} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Carnet / Código</label>
              <input type="text" defaultValue={docenteActual?.codigo} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Facultad</label>
              <input type="text" defaultValue={docenteActual?.facultad || "Ingeniería"} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cursos Asignados</label>
              <input type="number" min="0" defaultValue={docenteActual?.cursos || 0} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{docenteActual ? "Guardar Cambios" : "Agregar Docente"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CARGAR DOCENTES MASIVAMENTE */}
      <Modal isOpen={isCargarDocentesOpen} onClose={() => setIsCargarDocentesOpen(false)} title="Cargar Listado de Docentes">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Sube un archivo Excel (.xlsx) o CSV con el listado de docentes para actualizar el sistema masivamente.
          </p>
          <label className="border-2 border-dashed border-url-blue bg-blue-50/50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
            <input type="file" className="hidden" accept=".xlsx, .csv" onChange={(e) => setArchivoDocentes(e.target.files[0])} />
            {archivoDocentes ? (
              <>
                <DocumentTextIcon className="w-16 h-16 text-url-blue" />
                <div className="text-center">
                  <p className="font-bold text-url-blue">{archivoDocentes.name}</p>
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
            <Button variant="secondary" onClick={() => { setIsCargarDocentesOpen(false); setArchivoDocentes(null); }}>Cancelar</Button>
            <Button variant="primary" onClick={() => {
                if(!archivoDocentes) return alert("Selecciona un archivo primero");
                alert("Docentes cargados exitosamente");
                setIsCargarDocentesOpen(false);
                setArchivoDocentes(null);
              }}>Subir y Procesar Archivo</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL ELIMINAR DOCENTE */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-gray-700">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <TrashIcon className="w-6 h-6" />
            </div>
            <p>
              ¿Estás seguro de que deseas eliminar al docente <strong className="text-url-blue">{docenteActual?.nombre}</strong> del sistema? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={ejecutarEliminacion}>Sí, Eliminar Docente</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Docentes;