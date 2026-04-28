import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { 
  HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon, 
  PlusIcon, ClockIcon, PencilSquareIcon, TrashIcon 
} from '@heroicons/react/24/outline';

const Semesters = () => {
  const navigate = useNavigate();
  const { semestres, setSemestres, showToast } = useContext(AppContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

  // Estados del Formulario
  const [nuevoPeriodo, setNuevoPeriodo] = useState('Semestre I');
  const [nuevaFecha, setNuevaFecha] = useState('');

  // --- VIGILANTE DE ACTIVACIÓN AUTOMÁTICA ---
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    
    const semestresActualizados = semestres.map(sem => {
      if (sem.id && sem.estado === 'Proximo' && sem.fecha_inicio && sem.fecha_inicio <= today) {
        hasChanges = true;
        return { ...sem, estado: 'Activo' };
      }
      return sem;
    });

    if (hasChanges) {
      setSemestres(semestresActualizados);
      showToast("¡Un semestre programado se ha activado automáticamente!", "success");
    }
  }, [semestres, setSemestres, showToast]);

  // --- LÓGICA DE DIVISION DE DATOS ---
  const semestresProgramados = semestres.filter(s => s.estado === 'Proximo');
  const semestresHistoricos = semestres.filter(s => s.estado === 'Activo' || s.estado === 'Finalizado');

  // --- ACCIONES ---
  const abrirConfirmacionEstado = (sem) => {
    setSemestreSeleccionado(sem);
    setIsModalOpen(true);
  };

  const confirmarCambioEstado = () => {
    setSemestres(semestres.map(s => {
      if (s.id === semestreSeleccionado.id) {
        return { ...s, estado: s.estado === 'Activo' ? 'Finalizado' : 'Activo' };
      }
      return s;
    }));
    setIsModalOpen(false);
    showToast(`Estado actualizado a ${semestreSeleccionado.estado === 'Activo' ? 'Finalizado' : 'Activo'}.`, 'success');
  };

  const agregarSemestre = (e) => {
    e.preventDefault();
    if (!nuevaFecha) return showToast("Seleccione una fecha de inicio.", 'error');
    
    const year = new Date(nuevaFecha).getFullYear();
    const existe = semestres.some(s => s.semestre === nuevoPeriodo && String(s.anio) === String(year));
    
    if (existe) return showToast(`El ${nuevoPeriodo} del ${year} ya existe.`, 'error');

    const nuevo = { id: Date.now(), semestre: nuevoPeriodo, anio: year, estado: 'Proximo', fecha_inicio: nuevaFecha };
    setSemestres([nuevo, ...semestres]);
    setIsAddModalOpen(false);
    showToast("Semestre programado correctamente.", 'success');
  };

  const abrirEdicion = (sem) => {
    setSemestreSeleccionado(sem);
    setNuevoPeriodo(sem.semestre);
    setNuevaFecha(sem.fecha_inicio || '');
    setIsEditModalOpen(true);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    setSemestres(semestres.map(s => s.id === semestreSeleccionado.id ? { ...s, semestre: nuevoPeriodo, anio: new Date(nuevaFecha).getFullYear(), fecha_inicio: nuevaFecha } : s));
    setIsEditModalOpen(false);
    showToast("Programación actualizada.", 'success');
  };

  const abrirEliminacion = (sem) => {
    setSemestreSeleccionado(sem);
    setIsDeleteModalOpen(true);
  };

  const confirmarEliminacion = () => {
    setSemestres(semestres.filter(s => s.id !== semestreSeleccionado.id));
    setIsDeleteModalOpen(false);
    showToast("Semestre programado eliminado.", 'success');
  };

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
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
          <ClockIcon className="w-6 h-6 text-url-blue" /> Próximos a iniciar
        </h2>
        {semestresProgramados.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 font-bold italic">No hay semestres programados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semestresProgramados.map((sem) => (
              <div key={sem.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-url-blue flex items-center justify-center shrink-0"><ClockIcon className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-url-blue text-lg leading-tight">{sem.semestre}</h3>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Año {sem.anio}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Inicia: <span className="text-url-blue">{sem.fecha_inicio}</span></span>
                  <div className="flex gap-3">
                    <button onClick={() => abrirEdicion(sem)} className="text-url-yellow hover:text-yellow-600 font-bold text-sm flex items-center gap-1"><PencilSquareIcon className="w-4 h-4"/> Editar</button>
                    <button onClick={() => abrirEliminacion(sem)} className="text-red-400 hover:text-red-600 font-bold text-sm flex items-center gap-1"><TrashIcon className="w-4 h-4"/> Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLA CON BOTONES ESTÉTICOS (Icono + Palabra) */}
      <div>
        <h2 className="text-lg font-bold text-[#112240] mb-4">Periodo Activo e Historial</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse whitespace-nowrap">
              <thead className="bg-[#112240] text-white">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm">Semestre</th>
                  <th className="py-4 px-6 font-semibold text-sm">Año</th>
                  <th className="py-4 px-6 font-semibold text-sm">Estado</th>
                  <th className="py-4 px-6 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {semestresHistoricos.map((sem, index) => (
                  <tr key={sem.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-6 font-bold text-url-blue">{sem.semestre}</td>
                    <td className="py-4 px-6 font-bold text-url-blue">{sem.anio}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sem.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{sem.estado}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        {sem.estado === 'Activo' ? (
                          <button 
                            onClick={() => abrirConfirmacionEstado(sem)} 
                            className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          >
                            <HandThumbDownIcon className="w-4 h-4" /> Deshabilitar
                          </button>
                        ) : (
                          <button 
                            onClick={() => abrirConfirmacionEstado(sem)} 
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-url-blue rounded-full text-xs font-bold hover:bg-url-blue hover:text-white transition-all border border-blue-100"
                          >
                            <ArrowPathIcon className="w-4 h-4" /> Reactivar
                          </button>
                        )}
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Seleccionar Semestre</label>
            <select className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevoPeriodo} onChange={(e) => setNuevoPeriodo(e.target.value)}>
              <option value="Semestre I">Semestre I</option>
              <option value="Semestre II">Semestre II</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Fecha de Inicio</label>
            <input type="date" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} required />
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nueva Fecha de Inicio</label>
            <input type="date" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="bg-url-yellow text-url-blue border-none font-bold">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ELIMINAR */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Programación">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><TrashIcon className="w-10 h-10" /></div>
            <h2 className="text-xl font-bold text-[#112240]">¿Eliminar el {semestreSeleccionado?.semestre} {semestreSeleccionado?.anio}?</h2>
            <p className="text-gray-500 text-sm px-4">Esta acción no se puede deshacer. Se borrará la programación de este periodo.</p>
            <div className="flex justify-center gap-3 w-full mt-4">
               <Button variant="secondary" className="w-full" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
               <Button variant="danger" className="w-full bg-red-600 text-white" onClick={confirmarEliminacion}>Eliminar</Button>
            </div>
         </div>
      </Modal>

      {/* MODAL: ESTADO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <h2 className="text-2xl font-bold text-[#112240] font-serif px-8">¿Confirmar cambio de estado?</h2>
            <div className="mt-2 bg-gray-50 px-8 py-4 rounded-xl border border-gray-100">
               <h3 className="text-xl font-bold text-url-blue">{semestreSeleccionado?.semestre} {semestreSeleccionado?.anio}</h3>
            </div>
            <div className="flex justify-center gap-4 w-full mt-6 px-4">
               <Button variant="secondary" className="w-full" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button variant="primary" className="w-full bg-[#112240] text-white" onClick={confirmarCambioEstado}>Confirmar</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default Semesters;