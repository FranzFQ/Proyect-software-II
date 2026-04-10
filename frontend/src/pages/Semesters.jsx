import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { HandThumbUpIcon, HandThumbDownIcon, PlusIcon } from '@heroicons/react/24/solid';

const Semestres = () => {
  const navigate = useNavigate();
  const { semestres, setSemestres } = useContext(AppContext);
  
  // Modal de confirmación de estado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

  // Modal de agregar semestre
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nuevoPeriodo, setNuevoPeriodo] = useState('Semestre I');
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear().toString());

  const abrirConfirmacion = (sem) => {
    setSemestreSeleccionado(sem);
    setIsModalOpen(true);
  };

  const confirmarAccion = () => {
    setSemestres(semestres.map(s => {
      if (s.id === semestreSeleccionado.id) {
        return { ...s, estado: s.estado === 'Activo' ? 'Finalizado' : 'Activo' };
      }
      return s;
    }));
    setIsModalOpen(false);
  };

  const agregarSemestre = (e) => {
    e.preventDefault();
    const nuevo = {
      id: Date.now(), // Generamos un ID temporal
      semestre: nuevoPeriodo,
      anio: nuevoAnio,
      estado: 'Proximo' // Por defecto entra como próximo
    };
    // Lo agregamos al inicio de la lista
    setSemestres([nuevo, ...semestres]);
    setIsAddModalOpen(false);
    alert("Semestre agregado con éxito");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <button onClick={() => navigate('/coordinators')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
            &larr; Volver a Coordinadores
          </button>
          <h1 className="text-3xl font-bold text-url-blue font-serif">Semestres</h1>
          <p className="text-gray-500">Semestres registrados - {semestres.length}</p>
        </div>

        {/* NUEVO BOTÓN: Agregar Semestre */}
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="w-5 h-5" />
          Agregar Semestre
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse whitespace-nowrap">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm">Semestre</th>
                <th className="py-4 px-6 font-semibold text-sm">Año del semestre</th>
                <th className="py-4 px-6 font-semibold text-sm">Estado</th>
                <th className="py-4 px-6 font-semibold text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {semestres.map((sem, index) => (
                <tr key={sem.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-4 px-6 font-bold text-url-blue">{sem.semestre}</td>
                  <td className="py-4 px-6 font-bold text-url-blue">{sem.anio}</td>
                  <td className="py-4 px-6 text-gray-500">{sem.estado}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {sem.estado === 'Proximo' && (
                        <button onClick={() => abrirConfirmacion(sem)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition" title="Habilitar Semestre">
                          <HandThumbUpIcon className="w-5 h-5" />
                        </button>
                      )}
                      {sem.estado === 'Activo' && (
                        <button onClick={() => abrirConfirmacion(sem)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition" title="Deshabilitar Semestre">
                          <HandThumbDownIcon className="w-5 h-5" />
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

      {/* Modal Agregar Semestre */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Agregar Nuevo Semestre">
        <form onSubmit={agregarSemestre} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Semestre</label>
            <select 
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
              value={nuevoPeriodo}
              onChange={(e) => setNuevoPeriodo(e.target.value)}
            >
              <option value="Semestre I">Semestre I</option>
              <option value="Semestre II">Semestre II</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Año</label>
            <input 
              type="number" 
              min="2020" 
              max="2050" 
              placeholder="Ej. 2026" 
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" 
              value={nuevoAnio}
              onChange={(e) => setNuevoAnio(e.target.value)}
              required 
            />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Crear Semestre</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmación de Estado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <h2 className="text-2xl font-bold text-[#112240] font-serif px-8">
              Seguro que desea {semestreSeleccionado?.estado === 'Activo' ? 'deshabilitar' : 'habilitar'} el semestre:
            </h2>
            <div className="mt-4">
               <h3 className="text-xl font-bold text-[#112240]">{semestreSeleccionado?.semestre}</h3>
               <p className="text-gray-500 text-sm">Año - {semestreSeleccionado?.anio}</p>
            </div>
            <div className="flex justify-center gap-4 w-full mt-6">
               <Button variant="secondary" className="w-full bg-url-yellow border-none text-white hover:bg-yellow-500" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button variant="primary" className="w-full" onClick={confirmarAccion}>Confirmar</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};
export default Semestres;