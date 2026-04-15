import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { EyeIcon, TrashIcon, UserPlusIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Teachers = () => {
  const navigate = useNavigate();
  const { docentes, setDocentes } = useContext(AppContext);
  
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [docenteActual, setDocenteActual] = useState(null);

  // ESTADO PARA LA ALERTA ESTÉTICA
  const [alertMessage, setAlertMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ESTADOS PARA EL FORMULARIO DINÁMICO DE CURSOS
  const [cursosForm, setCursosForm] = useState([]);
  const [nuevoCursoInput, setNuevoCursoInput] = useState('');

  const handleSearch = () => { setCurrentPage(1); };
  const handleFilter = (estado) => { setFiltroEstado(filtroEstado === estado ? '' : estado); setCurrentPage(1); };

  const docentesFiltrados = docentes.filter((doc) => {
    const coincideTexto = doc.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || doc.codigo.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEstado = filtroEstado === '' || doc.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const totalPages = Math.ceil(docentesFiltrados.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems = docentesFiltrados.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const renderEstado = (estado) => {
    const colores = { 'Excelente': 'bg-green-100 text-green-700 border-green-200', 'Buena': 'bg-yellow-100 text-yellow-700 border-yellow-200', 'Deficiente': 'bg-red-100 text-red-700 border-red-200' };
    return <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${colores[estado] || 'bg-gray-100'}`}>{estado}</span>;
  };

  const confirmarEliminacion = (docente) => { setDocenteActual(docente); setIsDeleteModalOpen(true); };
  
  const ejecutarEliminacion = () => { 
    setDocentes(docentes.filter(doc => doc.id !== docenteActual.id)); 
    setIsDeleteModalOpen(false); 
    setDocenteActual(null); 
    setAlertMessage("Docente eliminado correctamente del sistema.");
  };
  
  const abrirFormulario = (docente = null) => { 
    setDocenteActual(docente); 
    setCursosForm(docente?.cursosActuales ? docente.cursosActuales.map(c => c.nombre) : []);
    setNuevoCursoInput('');
    setIsFormModalOpen(true); 
  };

  const agregarCursoAlFormulario = () => {
    if (nuevoCursoInput.trim() !== '') { 
      setCursosForm([...cursosForm, nuevoCursoInput.trim()]); 
      setNuevoCursoInput(''); 
    }
  };

  const eliminarCursoDelFormulario = (index) => { 
    setCursosForm(cursosForm.filter((_, i) => i !== index)); 
  };

  const guardarDocente = (e) => { 
    e.preventDefault(); 
    setIsFormModalOpen(false); 
    // Usamos el modal estético en lugar de alert()
    setAlertMessage(docenteActual ? "Información del docente actualizada exitosamente." : "Nuevo docente agregado exitosamente al sistema.");
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue mb-2">Docentes</h1>
          <p className="text-gray-500">Mostrando {docentesFiltrados.length} docentes en total</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" className="flex items-center gap-2" onClick={() => abrirFormulario(null)}>
            <UserPlusIcon className="w-5 h-5" /> Agregar Docente
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input type="text" placeholder="Búsqueda por nombre o código..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#112240]" value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(); }} />
          <button onClick={handleSearch} className="bg-[#e2e8f0] text-[#112240] font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300">Buscar</button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => handleFilter('Deficiente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Deficiente' ? 'bg-red-600 text-white shadow-md' : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'}`}>Deficiente</button>
          <button onClick={() => handleFilter('Buena')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Buena' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'}`}>Buena</button>
          <button onClick={() => handleFilter('Excelente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Excelente' ? 'bg-green-600 text-white shadow-md' : 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'}`}>Excelente</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm">Nombre / Código</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Cursos</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Facultad</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Ponderación</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Estado</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500 font-semibold">No se encontraron docentes.</td></tr>
              ) : (
                currentItems.map((doc, index) => (
                  <tr key={doc.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-2 px-3 md:py-4 md:px-6">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs md:text-base ${doc.estado === 'Excelente' ? 'bg-url-yellow' : 'bg-url-blue'}`}>{doc.iniciales}</div>
                        <div><h4 className="font-bold text-url-blue text-sm md:text-base">{doc.nombre}</h4><p className="text-[10px] md:text-xs text-gray-400">{doc.codigo}</p></div>
                      </div>
                    </td>
                    <td className="py-2 px-3 md:py-4 md:px-6 text-center font-bold text-url-blue text-sm md:text-base">{doc.cursos}</td>
                    <td className="py-2 px-3 md:py-4 md:px-6 text-center text-url-blue font-semibold text-xs md:text-sm">{doc.facultad}</td>
                    <td className="py-2 px-3 md:py-4 md:px-6 text-center text-gray-600 font-bold text-sm md:text-base">{doc.ponderacion}</td>
                    <td className="py-2 px-3 md:py-4 md:px-6 text-center">{renderEstado(doc.estado)}</td>
                    <td className="py-2 px-3 md:py-4 md:px-6 text-center">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button onClick={() => navigate(`/teachers/${doc.id}`)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-url-yellow text-url-yellow rounded-md flex items-center justify-center hover:bg-url-yellow hover:text-white transition-colors" title="Ver perfil"><EyeIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                        <button onClick={() => abrirFormulario(doc)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-blue-400 text-blue-500 rounded-md flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Editar docente"><PencilSquareIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                        <button onClick={() => confirmarEliminacion(doc)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-red-200 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Eliminar docente"><TrashIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-auto flex justify-end items-center pt-4 pb-2 text-sm text-[#112240] font-bold gap-4">
         <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">&larr; Anterior</button>
         <span>Página {safeCurrentPage} de {totalPages}</span>
         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">Siguiente &rarr;</button>
      </div>

      {/* FORMULARIO DINÁMICO */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={docenteActual ? "Editar Docente" : "Agregar Nuevo Docente"}>
        <form onSubmit={guardarDocente} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
              <input type="text" placeholder="Ej. Juan Pérez" defaultValue={docenteActual?.nombre} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Código Docente</label>
              <input type="text" placeholder="Ej. CAT-12345" defaultValue={docenteActual?.codigo} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Plan Docente</label>
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required defaultValue={docenteActual?.tipo || "Tiempo Completo"}>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Tiempo Parcial">Tiempo Parcial</option>
                <option value="Por Horas">Por Horas</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Carrera</label>
              <input type="text" placeholder="Ej. Ingeniería en Sistemas" defaultValue={docenteActual?.departamento} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Facultad</label>
              <input type="text" placeholder="Ej. Facultad de Ingeniería" defaultValue={docenteActual?.facultad || "Ingeniería"} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Dinámica de Agregar Cursos */}
          <div className="flex flex-col gap-3">
             <label className="text-sm font-bold text-[#112240]">Cursos Asignados al Docente</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Escriba el nombre del curso" 
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" 
                  value={nuevoCursoInput}
                  onChange={(e) => setNuevoCursoInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); agregarCursoAlFormulario(); } }}
                />
                <button type="button" onClick={agregarCursoAlFormulario} className="bg-url-blue text-white px-4 py-2 rounded-md font-bold hover:bg-blue-900 transition flex items-center gap-1 text-sm">
                  <PlusIcon className="w-4 h-4"/> Agregar
                </button>
             </div>
             
             {/* Lista de cursos agregados */}
             <div className="flex flex-wrap gap-2 mt-2">
               {cursosForm.length > 0 ? (
                 cursosForm.map((curso, index) => (
                   <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700">
                     <span>{curso}</span>
                     <button type="button" onClick={() => eliminarCursoDelFormulario(index)} className="text-gray-400 hover:text-red-500 transition">
                       <TrashIcon className="w-4 h-4" />
                     </button>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-gray-400 italic">No hay cursos asignados aún.</p>
               )}
             </div>
          </div>

          <div className="flex justify-start gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="submit" variant="primary">{docenteActual ? "Guardar Cambios" : "Guardar Docente"}</Button>
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-gray-700">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><TrashIcon className="w-6 h-6" /></div>
            <p>¿Estás seguro de que deseas eliminar al docente <strong className="text-url-blue">{docenteActual?.nombre}</strong> del sistema?</p>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={ejecutarEliminacion}>Sí, Eliminar</Button>
          </div>
        </div>
      </Modal>

      {/* ALERTA ESTÉTICA */}
      <Modal isOpen={!!alertMessage} onClose={() => setAlertMessage('')} title="Aviso del Sistema" zIndex="z-[60]">
         <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-500">
               <CheckCircleSolid className="w-8 h-8" />
            </div>
            <p className="text-lg text-[#112240] text-center font-bold">{alertMessage}</p>
            <Button variant="primary" className="mt-8 w-full py-3" onClick={() => setAlertMessage('')}>Aceptar</Button>
         </div>
      </Modal>
    </div>
  );
};

export default Teachers;