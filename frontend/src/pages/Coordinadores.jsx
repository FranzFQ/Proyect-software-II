// src/pages/Coordinadores.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { 
  TrashIcon, 
  ArrowUpTrayIcon, 
  UserPlusIcon, 
  PencilSquareIcon,
  CloudArrowUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Coordinadores = () => {
  const { coordinadores, setCoordinadores } = useContext(AppContext);
  const [filtroTexto, setFiltroTexto] = useState('');
  
  // Estados para Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCargarPensumOpen, setIsCargarPensumOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  // Estado para el coordinador seleccionado (para editar o eliminar)
  const [coordinadorActual, setCoordinadorActual] = useState(null);
  
  // Archivo de pensum simulado
  const [archivoPensum, setArchivoPensum] = useState(null);

  // Filtrado solo por texto
  const coordinadoresFiltrados = coordinadores.filter((coord) => 
    coord.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    coord.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    coord.carrera.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  // --- FUNCIONES DE ELIMINACIÓN ---
  const confirmarEliminacion = (coord) => {
    setCoordinadorActual(coord);
    setIsDeleteModalOpen(true);
  };

  const ejecutarEliminacion = () => {
    setCoordinadores(coordinadores.filter(c => c.id !== coordinadorActual.id));
    setIsDeleteModalOpen(false);
    setCoordinadorActual(null);
  };

  // --- FUNCIONES DE FORMULARIO (Agregar/Editar) ---
  const abrirFormulario = (coord = null) => {
    setCoordinadorActual(coord); // Si es null, es agregar. Si tiene datos, es editar.
    setIsFormModalOpen(true);
  };

  const guardarCoordinador = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar al backend
    alert(coordinadorActual ? "Coordinador actualizado con éxito" : "Nuevo coordinador creado con acceso al sistema");
    setIsFormModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Encabezado y Botones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue mb-2 font-serif">Coordinadores</h1>
          <p className="text-gray-500">
            Gestión de coordinadores y asignación de pensum
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2 border-url-blue text-url-blue hover:bg-url-blue hover:text-white" onClick={() => setIsCargarPensumOpen(true)}>
            <ArrowUpTrayIcon className="w-5 h-5" />
            Cargar Pensum
          </Button>
          <Button variant="primary" className="flex items-center gap-2" onClick={() => abrirFormulario(null)}>
            <UserPlusIcon className="w-5 h-5" />
            Agregar Coordinador
          </Button>
        </div>
      </div>

      {/* Barra de Búsqueda Limpia */}
      <div className="flex w-full">
        <input 
          type="text" 
          placeholder="Buscar por nombre, código o carrera..." 
          className="w-full md:w-1/2 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-url-blue transition-shadow shadow-sm"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
      </div>

      {/* Tabla Estructurada a tus mockups */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm">Nombre / Código</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Facultad</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Carrera</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coordinadoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500 font-semibold">
                    No se encontraron resultados.
                  </td>
                </tr>
              ) : (
                coordinadoresFiltrados.map((coord, index) => (
                  <tr key={coord.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-url-blue text-url-yellow flex items-center justify-center font-bold">
                          {coord.iniciales}
                        </div>
                        <div>
                          <h4 className="font-bold text-url-blue">{coord.nombre}</h4>
                          <p className="text-xs text-gray-400">{coord.codigo} · {coord.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-url-blue font-semibold">{coord.facultad}</td>
                    <td className="py-4 px-6 text-center text-gray-700 font-medium">{coord.carrera}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Editar */}
                        <button 
                          onClick={() => abrirFormulario(coord)}
                          className="w-9 h-9 border-2 border-url-blue text-url-blue rounded-md flex items-center justify-center hover:bg-url-blue hover:text-white transition-colors"
                          title="Editar información"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => confirmarEliminacion(coord)}
                          className="w-9 h-9 border-2 border-red-200 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                          title="Eliminar coordinador"
                        >
                          <TrashIcon className="w-5 h-5" />
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

      {/* 1. MODAL: AGREGAR / EDITAR COORDINADOR */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={coordinadorActual ? "Editar Coordinador" : "Agregar Nuevo Coordinador"}>
        <form onSubmit={guardarCoordinador} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
              <input type="text" defaultValue={coordinadorActual?.nombre} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Código / ID</label>
              <input type="text" defaultValue={coordinadorActual?.codigo} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Facultad</label>
              <input type="text" defaultValue={coordinadorActual?.facultad || "Ingeniería"} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Carrera</label>
              <input type="text" defaultValue={coordinadorActual?.carrera} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
          </div>
          
          <hr className="my-2 border-gray-200" />
          <h4 className="font-bold text-url-blue text-sm">Credenciales de Acceso</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Correo Institucional</label>
              <input type="email" defaultValue={coordinadorActual?.correo} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
              <input type="password" placeholder={coordinadorActual ? "Dejar en blanco para no cambiar" : "••••••••"} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-url-blue" required={!coordinadorActual} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{coordinadorActual ? "Guardar Cambios" : "Crear Acceso"}</Button>
          </div>
        </form>
      </Modal>

      {/* 2. MODAL: CARGAR PENSUM */}
      <Modal isOpen={isCargarPensumOpen} onClose={() => setIsCargarPensumOpen(false)} title="Cargar Pensum o Listado">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Sube el archivo Excel (.xlsx) o CSV con el pensum de estudios y asignaciones para actualizar la base de datos de los coordinadores.
          </p>

          <label className="border-2 border-dashed border-url-blue bg-blue-50/50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .csv" 
              onChange={(e) => setArchivoPensum(e.target.files[0])}
            />
            {archivoPensum ? (
              <>
                <DocumentTextIcon className="w-16 h-16 text-url-blue" />
                <div className="text-center">
                  <p className="font-bold text-url-blue">{archivoPensum.name}</p>
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
            <Button variant="secondary" onClick={() => { setIsCargarPensumOpen(false); setArchivoPensum(null); }}>Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if(!archivoPensum) return alert("Selecciona un archivo primero");
                alert("Pensum cargado exitosamente");
                setIsCargarPensumOpen(false);
                setArchivoPensum(null);
              }}
            >
              Subir y Procesar Archivo
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. MODAL: ELIMINAR */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-gray-700">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <TrashIcon className="w-6 h-6" />
            </div>
            <p>
              ¿Estás seguro de que deseas eliminar a <strong className="text-url-blue">{coordinadorActual?.nombre}</strong>? Esta acción revocará su acceso al sistema.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={ejecutarEliminacion}>Sí, Eliminar</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Coordinadores;