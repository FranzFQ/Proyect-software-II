import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { 
  HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon, 
  PlusIcon, ClockIcon, PencilSquareIcon, TrashIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

// Servicios
import { 
  getSemestres, 
  createSemestre, 
  updateSemestre, 
  deleteSemestre 
} from '../services/academico_service';

const Semesters = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);
  
  const [listaSemestres, setListaSemestres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

  // Estados del Formulario
  const [nuevoCiclo, setNuevoCiclo] = useState(1);
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    fetchSemestres();
  }, []);

  const fetchSemestres = async () => {
    setLoading(true);
    try {
      // Usamos all: true para que el admin vea los semestres futuros/ocultos
      const data = await getSemestres({ all: true });
      const results = data ? (Array.isArray(data) ? data : data.results || []) : [];
      setListaSemestres(results);
    } catch (error) {
      console.error("Error al cargar semestres:", error);
      showToast("Error al cargar semestres.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE DIVISION DE DATOS ---
  // Clasificamos por el estado devuelto por el backend
  const semestresProgramados = listaSemestres.filter(s => s.estado === 'Próximo');
  const semestresHistoricos = listaSemestres.filter(s => s.estado !== 'Próximo');

  const agregarSemestre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        anio: parseInt(nuevoAnio),
        ciclo: parseInt(nuevoCiclo),
        fecha: nuevaFecha || null,
        visible: false,
        activo_para_carga: false,
        finalizado: false
      };
      await createSemestre(payload);
      setIsAddModalOpen(false);
      showToast("Semestre programado correctamente.", 'success');
      fetchSemestres();
    } catch (error) {
      showToast("Error al crear semestre.", 'error');
    }
  };

  const abrirEdicion = (sem) => {
    setSemestreSeleccionado(sem);
    setNuevoCiclo(sem.ciclo);
    setNuevoAnio(sem.anio);
    setNuevaFecha(sem.fecha ? sem.fecha.substring(0, 16) : '');
    setIsEditModalOpen(true);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        anio: parseInt(nuevoAnio),
        ciclo: parseInt(nuevoCiclo),
        fecha: nuevaFecha || null
      };
      await updateSemestre(semestreSeleccionado.id, payload);
      setIsEditModalOpen(false);
      showToast("Programación actualizada.", 'success');
      fetchSemestres();
    } catch (error) {
      showToast("Error al actualizar.", 'error');
    }
  };

  const abrirEliminacion = (sem) => {
    setSemestreSeleccionado(sem);
    setIsDeleteModalOpen(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await deleteSemestre(semestreSeleccionado.id);
      setIsDeleteModalOpen(false);
      showToast("Semestre eliminado.", 'success');
      fetchSemestres();
    } catch (error) {
      showToast("Error al eliminar.", 'error');
    }
  };

  const abrirConfirmacionEstado = (sem) => {
    setSemestreSeleccionado(sem);
    setIsStatusModalOpen(true);
  };

  const confirmarCambioEstado = async () => {
    try {
      // Si está activo, lo finalizamos. Si está finalizado (y es visible), lo activamos.
      const payload = {
        activo_para_carga: !semestreSeleccionado.activo_para_carga,
        finalizado: semestreSeleccionado.activo_para_carga ? true : false
      };
      await updateSemestre(semestreSeleccionado.id, payload);
      setIsStatusModalOpen(false);
      showToast("Estado actualizado.", 'success');
      fetchSemestres();
    } catch (error) {
      showToast("Error al cambiar estado.", 'error');
    }
  };

  const getStatusColor = (estado) => {
    if (!estado) return 'bg-red-100 text-red-700 border-red-200';
    if (estado.includes('Activo')) return 'bg-green-100 text-green-700';
    if (estado.includes('Finalizado')) return 'bg-gray-100 text-gray-500';
    if (estado.includes('Próximo')) return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-2 text-sm">
            &larr; Volver
          </button>
          <h1 className="text-3xl font-bold text-url-blue">Gestión de Semestres</h1>
          <p className="text-gray-500 mt-1 font-medium">Administración de periodos académicos y activaciones automáticas.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 bg-url-yellow text-[#112240] hover:bg-yellow-500 font-bold border-none" onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="w-5 h-5" /> Programar Semestre
        </Button>
      </div>

      {/* SECCIÓN PRÓXIMOS */}
      <div>
        <h2 className="text-lg font-bold text-[#112240] mb-4 flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-url-blue" /> Próximos a iniciar (Programados)
        </h2>
        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">Cargando...</div>
        ) : semestresProgramados.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 font-bold italic">No hay semestres programados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semestresProgramados.map((sem) => (
              <div key={sem.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(sem.estado)}`}><ClockIcon className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-url-blue text-lg leading-tight">Ciclo {sem.ciclo}</h3>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Año {sem.anio}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Estado: <span className={getStatusColor(sem.estado).split(' ')[1]}>{sem.estado}</span></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Inicia: <span className="text-url-blue">{sem.fecha ? new Date(sem.fecha).toLocaleString() : 'Sin fecha'}</span></span>
                  </div>
                  <div className="flex gap-3 mt-2 justify-end">
                    <button onClick={() => abrirEdicion(sem)} className="text-url-yellow hover:text-yellow-600 font-bold text-sm flex items-center gap-1"><PencilSquareIcon className="w-4 h-4"/> Editar</button>
                    <button onClick={() => abrirEliminacion(sem)} className="text-red-400 hover:text-red-600 font-bold text-sm flex items-center gap-1"><TrashIcon className="w-4 h-4"/> Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLA HISTORIAL */}
      <div>
        <h2 className="text-lg font-bold text-[#112240] mb-4">Periodo Activo e Historial</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse whitespace-nowrap">
              <thead className="bg-[#112240] text-white">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm">Ciclo</th>
                  <th className="py-4 px-6 font-semibold text-sm">Año</th>
                  <th className="py-4 px-6 font-semibold text-sm">Estado</th>
                  <th className="py-4 px-6 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="py-10 text-center text-gray-400">Cargando...</td></tr>
                ) : semestresHistoricos.length === 0 ? (
                  <tr><td colSpan="4" className="py-10 text-center text-gray-400 italic">No hay historial disponible.</td></tr>
                ) : semestresHistoricos.map((sem, index) => (
                  <tr key={sem.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-6 font-bold text-url-blue">Ciclo {sem.ciclo}</td>
                    <td className="py-4 px-6 font-bold text-url-blue">{sem.anio}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(sem.estado)}`}>{sem.estado}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {sem.activo_para_carga ? (
                          <button 
                            onClick={() => abrirConfirmacionEstado(sem)} 
                            className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          >
                            <CheckBadgeIcon className="w-4 h-4" /> Finalizar
                          </button>
                        ) : (
                          <button 
                            onClick={() => abrirConfirmacionEstado(sem)} 
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-url-blue rounded-full text-xs font-bold hover:bg-url-blue hover:text-white transition-all border border-blue-100"
                          >
                            <ArrowPathIcon className="w-4 h-4" /> Activar Carga
                          </button>
                        )}
                        <button onClick={() => abrirEliminacion(sem)} className="p-2 text-red-400 hover:text-red-600 transition" title="Eliminar">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: AGREGAR */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Programar Nuevo Periodo">
        <form onSubmit={agregarSemestre} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Ciclo</label>
              <select className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevoCiclo} onChange={(e) => setNuevoCiclo(parseInt(e.target.value))}>
                <option value={1}>Ciclo I</option>
                <option value={2}>Ciclo II</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Año</label>
              <input type="number" min="2020" max="2050" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevoAnio} onChange={(e) => setNuevoAnio(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Fecha de Referencia (Visibilidad)</label>
            <input type="datetime-local" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
            <p className="text-[10px] text-gray-400 italic">El semestre se volverá visible automáticamente en esta fecha.</p>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="bg-[#112240] text-white">Programar</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDITAR */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modificar Programación">
        <form onSubmit={guardarEdicion} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Ciclo</label>
              <select className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevoCiclo} onChange={(e) => setNuevoCiclo(parseInt(e.target.value))}>
                <option value={1}>Ciclo I</option>
                <option value={2}>Ciclo II</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Año</label>
              <input type="number" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevoAnio} onChange={(e) => setNuevoAnio(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nueva Fecha de Referencia</label>
            <input type="datetime-local" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="bg-url-yellow text-url-blue border-none font-bold">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ELIMINAR */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Periodo">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><TrashIcon className="w-10 h-10" /></div>
            <h2 className="text-xl font-bold text-[#112240]">¿Eliminar Ciclo {semestreSeleccionado?.ciclo} {semestreSeleccionado?.anio}?</h2>
            <p className="text-gray-500 text-sm px-4">Esta acción no se puede deshacer. Se borrarán todos los datos asociados a este periodo.</p>
            <div className="flex justify-center gap-3 w-full mt-4">
               <Button variant="secondary" className="w-full" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
               <Button variant="danger" className="w-full bg-red-600 text-white" onClick={confirmarEliminacion}>Eliminar</Button>
            </div>
         </div>
      </Modal>

      {/* MODAL: ESTADO (ACTIVAR/FINALIZAR) */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Cambio de Estado">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <h2 className="text-2xl font-bold text-[#112240] font-serif px-8">¿Confirmar cambio de estado?</h2>
            <div className="mt-2 bg-gray-50 px-8 py-4 rounded-xl border border-gray-100">
               <h3 className="text-xl font-bold text-url-blue">Ciclo {semestreSeleccionado?.ciclo} {semestreSeleccionado?.anio}</h3>
               <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                 Acción: {semestreSeleccionado?.activo_para_carga ? 'Finalizar Periodo' : 'Activar para Carga'}
               </p>
            </div>
            <div className="flex justify-center gap-4 w-full mt-6 px-4">
               <Button variant="secondary" className="w-full" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
               <Button variant="primary" className="w-full bg-[#112240] text-white" onClick={confirmarCambioEstado}>Confirmar</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default Semesters;