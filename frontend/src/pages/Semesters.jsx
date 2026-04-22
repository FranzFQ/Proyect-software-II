// src/pages/Semesters.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Semesters = () => {
  const navigate = useNavigate();
  const { semestres, setSemestres, showToast } = useContext(AppContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

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
    showToast(`Semestre ${semestreSeleccionado.estado === 'Activo' ? 'deshabilitado' : 'habilitado'} correctamente.`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div className="flex flex-col mb-2">
        <button onClick={() => navigate('/coordinators')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition w-max mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a Coodinadores
        </button>
        <h1 className="text-3xl font-bold text-url-blue font-serif">Configuración de Semestres</h1>
        <p className="text-gray-500 mt-1">Semestres registrados en el sistema: {semestres.length}</p>
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
                        <button onClick={() => abrirConfirmacion(sem)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition shadow-sm" title="Habilitar Semestre">
                          <HandThumbUpIcon className="w-5 h-5" />
                        </button>
                      )}
                      {sem.estado === 'Activo' && (
                        <button onClick={() => abrirConfirmacion(sem)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition shadow-sm" title="Deshabilitar Semestre">
                          <HandThumbDownIcon className="w-5 h-5" />
                        </button>
                      )}
                      {sem.estado === 'Finalizado' && (
                        <button onClick={() => abrirConfirmacion(sem)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm" title="Reactivar Semestre">
                          <ArrowPathIcon className="w-5 h-5" />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
         <div className="flex flex-col items-center text-center gap-4 py-4">
            <h2 className="text-2xl font-bold text-[#112240] font-serif px-8">
              ¿Seguro que desea {semestreSeleccionado?.estado === 'Activo' ? 'deshabilitar' : semestreSeleccionado?.estado === 'Finalizado' ? 'reactivar' : 'habilitar'} el semestre?
            </h2>
            <div className="mt-4 bg-gray-50 px-8 py-4 rounded-xl border border-gray-100">
               <h3 className="text-xl font-bold text-url-blue">{semestreSeleccionado?.semestre}</h3>
               <p className="text-gray-500 font-semibold mt-1">Año {semestreSeleccionado?.anio}</p>
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

export default Semesters;