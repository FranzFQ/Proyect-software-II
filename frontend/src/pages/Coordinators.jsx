import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  normalizeCoordinador,
} from '../services/user_service'; 
import { getFacultades, getCarreras } from '../services/academico_service';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import {
  TrashIcon,
  UserPlusIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Coordinators = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useContext(AppContext);
  const { coordinadores, setCoordinadores } = useContext(AppContext);
  const [filtroTexto, setFiltroTexto]           = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [coordinadorActual, setCoordinadorActual] = useState(null);
  const [esAdminForm, setEsAdminForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue]       = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);   
  const [isSaving, setIsSaving]           = useState(false);  
  const [isDeleting, setIsDeleting]       = useState(false);  
  const [listError, setListError]         = useState('');
  const [formError, setFormError]         = useState('');

  // Estados para Facultades y Carreras (Combo Box Dinámico)
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [formFacultadId, setFormFacultadId] = useState('');
  const [formCarreraId, setFormCarreraId] = useState('');

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [dataF, dataC] = await Promise.all([
          getFacultades(),
          getCarreras(),
        ]);
        setFacultades(Array.isArray(dataF) ? dataF : dataF.results ?? []);
        setCarreras(Array.isArray(dataC) ? dataC : dataC.results ?? []);
      } catch (e) {
        console.error("Error al cargar catálogos:", e);
      }
    };
    
    const cargarCoordinadores = async () => {
      setIsLoadingList(true);
      setListError("");

      try {
        const data = await getUsuarios();
        const lista = Array.isArray(data) ? data : data.results || [];

        const filtrados = lista.filter((u) =>
          u.is_active === true &&
          u.id !== currentUser?.id
        );

        setCoordinadores(filtrados.map(normalizeCoordinador));
      } catch (err) {
        setListError(
          err.message || "No se pudo cargar la lista de coordinadores."
        );
      } finally {
        setIsLoadingList(false);
      }
    };

    cargarCatalogos();
    cargarCoordinadores();
  }, [currentUser, setCoordinadores]);

  const coordinadoresFiltrados = coordinadores.filter((coord) => {
    const texto = filtroTexto.toLowerCase();
    return (
      coord.nombre_completo?.toLowerCase().includes(texto) ||
      coord.nombre?.toLowerCase().includes(texto) ||
      coord.apellido?.toLowerCase().includes(texto) ||
      coord.carrera?.toLowerCase().includes(texto) ||
      coord.correo?.toLowerCase().includes(texto) ||
      coord.username?.toLowerCase().includes(texto)
    );
  });

  const confirmarEliminacion = (coord) => {
    setCoordinadorActual(coord);
    setIsDeleteModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    setIsDeleting(true);
    try {
      await deleteUsuario(coordinadorActual.id);
      setCoordinadores(prev => prev.filter(c => c.id !== coordinadorActual.id));
      showToast('Coordinador eliminado con éxito.', 'success');
      setIsDeleteModalOpen(false);
      setCoordinadorActual(null);
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const abrirFormulario = (coord = null) => {
    setCoordinadorActual(coord);
    setEsAdminForm(coord ? coord.esAdmin : false);
    setPasswordValue("");
    setConfirmPasswordValue("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError("");

    if (coord) {
      const facMatch = facultades.find(f => f.nombre === coord.facultad);
      setFormFacultadId(facMatch ? facMatch.id : '');
      const carMatch = carreras.find(c => c.nombre === coord.carrera);
      setFormCarreraId(carMatch ? carMatch.id : '');
    } else {
      setFormFacultadId('');
      setFormCarreraId('');
    }

    setIsFormModalOpen(true);
  };

  const carrerasFiltradas = carreras.filter(c => String(c.facultad) === String(formFacultadId));

  const guardarCoordinador = async (e) => {
    e.preventDefault();
    setFormError("");

    if (passwordValue && passwordValue.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (passwordValue && passwordValue !== confirmPasswordValue) {
      setFormError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    const formData = new FormData(e.target);

    const payload = {
      first_name: formData.get('first_name'),
      last_name:  formData.get('last_name'),
      email:      formData.get('email'),
      username:   formData.get('username'),
      is_staff:   esAdminForm,
      facultad:   formFacultadId ? parseInt(formFacultadId) : null,
      carrera:    formCarreraId ? parseInt(formCarreraId) : null
    };

    if (passwordValue) {
      payload.password = passwordValue;
    }

    setIsSaving(true);
    try {
      if (coordinadorActual) {
        const updated = await updateUsuario(coordinadorActual.id, payload);
        const normalizado = normalizeCoordinador(updated);
        setCoordinadores(prev =>
          prev.map(c => c.id === normalizado.id ? normalizado : c)
        );
        showToast('Perfil de coordinador actualizado correctamente.', 'success');
      } else {
        const created = await createUsuario(payload);
        const normalizado = normalizeCoordinador(created);
        setCoordinadores(prev => [...prev, normalizado]);
        showToast('Nuevo coordinador creado correctamente.', 'success');
      }

      setIsFormModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112240] mb-2">
            Coordinadores
          </h1>
          <p className="text-gray-500 font-medium">
            Mostrando {coordinadoresFiltrados.length} perfiles activos
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            className="flex items-center gap-2 bg-url-yellow text-[#112240] hover:bg-yellow-500 font-bold border-none shadow-md"
            onClick={() => abrirFormulario(null)}
          >
            <UserPlusIcon className="w-5 h-5" /> Agregar Coordinador
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2 shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <input
            type="text"
            placeholder="Búsqueda por nombre, usuario, email o carrera..."
            className="w-full px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#112240]"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <button className="bg-[#112240] text-white font-bold px-6 py-2 hover:bg-blue-900 transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {isLoadingList && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-url-blue rounded-full animate-spin"></div>
        </div>
      )}

      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold text-center">
          {listError}
        </div>
      )}

      {!isLoadingList && !listError && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm">Coordinador</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Facultad</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Carrera</th>
                <th className="py-4 px-6 font-semibold text-sm text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {coordinadoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500 font-bold">
                    No se encontraron resultados.
                  </td>
                </tr>
              ) : (
                coordinadoresFiltrados.map((coord, index) => (
                  <tr key={coord.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${coord.esAdmin ? "bg-url-yellow text-[#112240]" : "bg-url-blue"}`}>
                          {coord.iniciales}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold text-[#112240] text-sm leading-tight">
                            {coord.nombre_completo}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold bg-blue-50 text-url-blue px-2 py-0.5 rounded-md border border-blue-100 inline-block text-center">
                              @{coord.username || coord.correo.split("@")[0]}
                            </span>
                            <p className="text-[11px] text-gray-400 font-medium italic">
                              {coord.correo}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-url-blue font-bold text-sm">
                      {coord.facultad}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500 text-sm font-semibold">
                      {coord.carrera}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirFormulario(coord)}
                          className="w-8 h-8 border border-[#112240] bg-gray-50 text-[#112240] rounded-md flex items-center justify-center hover:bg-[#112240] hover:text-white transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmarEliminacion(coord)}
                          className="w-8 h-8 border border-red-200 bg-red-50 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                          title="Eliminar"
                        >
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
      )}

      {/* MODAL: FORMULARIO */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={coordinadorActual ? "Editar Perfil" : "Agregar Nuevo Perfil"}>
        <form onSubmit={guardarCoordinador} className="flex flex-col gap-5" autoComplete="off">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-semibold text-center">
              {formError}
            </div>
          )}
          <div className="flex justify-end items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {esAdminForm ? "Quitar Permisos Admin" : "Dar Permisos Admin"}
            </span>
            <button type="button" onClick={() => setEsAdminForm(!esAdminForm)} className={`w-8 h-5 rounded-full border-2 flex items-center transition-colors ${esAdminForm ? "border-url-yellow bg-url-yellow justify-end" : "border-gray-300 bg-gray-100 justify-start"}`}>
              <div className="w-3 h-3 bg-white rounded-full mx-1"></div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre</label>
              <input name="first_name" type="text" placeholder="Ej. María" defaultValue={coordinadorActual?.nombre} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Apellido</label>
              <input name="last_name" type="text" placeholder="Ej. García" defaultValue={coordinadorActual?.apellido} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre de Usuario</label>
              <input name="username" type="text" placeholder="Ej. melizabet" defaultValue={coordinadorActual?.username} autoComplete="off" className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Institucional</label>
              <input name="email" type="email" placeholder="Ej. mtorres@univ.edu.gt" defaultValue={coordinadorActual?.correo} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Facultad</label>
              <select 
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                value={formFacultadId}
                onChange={(e) => {
                  setFormFacultadId(e.target.value);
                  setFormCarreraId('');
                }}
                required
              >
                <option value="">Seleccione una facultad...</option>
                {facultades.map(fac => <option key={fac.id} value={fac.id}>{fac.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Carrera a cargo</label>
              <select 
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                value={formCarreraId}
                onChange={(e) => setFormCarreraId(e.target.value)}
                required
                disabled={!formFacultadId}
              >
                <option value="">Seleccione la carrera...</option>
                {carrerasFiltradas.map(car => <option key={car.id} value={car.id}>{car.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={coordinadorActual ? "Dejar blanco si no se cambia" : "Limite mínimo 8 caracteres"}
                  required={!coordinadorActual}
                  minLength={8}
                  className={`w-full px-3 py-2 bg-gray-50 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-10 transition-colors ${passwordValue && passwordValue.length < 8 ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {passwordValue && passwordValue.length < 8 && (
                <p className="text-xs text-red-500 font-medium">Mínimo 8 caracteres ({passwordValue.length}/8)</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={coordinadorActual ? "Dejar blanco si no se cambia" : "Reingrese la contraseña"}
                  required={!coordinadorActual || passwordValue.length > 0}
                  className={`w-full px-3 py-2 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-10 transition-colors ${passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50"}`}
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isSaving} className="bg-[#112240]  hover:bg-blue-900 border-none">
              {isSaving ? "Guardando..." : coordinadorActual ? "Guardar cambios" : "Crear perfil"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ELIMINAR */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2"><TrashIcon className="w-8 h-8" /></div>
          <h2 className="text-xl font-bold text-[#112240]">¿Eliminar a {coordinadorActual?.nombre}?</h2>
          <p className="text-gray-500 text-sm">Esta acción no se puede deshacer y borrará el acceso al sistema para este usuario.</p>
          <div className="flex justify-center gap-3 w-full mt-4">
            <Button variant="secondary" className="w-full" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={ejecutarEliminacion} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Coordinators;