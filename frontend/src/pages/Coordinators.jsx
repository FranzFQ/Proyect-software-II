import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  normalizeCoordinador,
} from "../services/user_service";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/24/solid";
import {
  TrashIcon,
  UserPlusIcon,
  PencilSquareIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Coordinators = () => {
  const navigate = useNavigate();
  const { coordinadores, setCoordinadores } = useContext(AppContext);

  // ─── Estados de UI ─────────────────────────────────────────────────────────
  const [filtroTexto, setFiltroTexto] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCargarPensumOpen, setIsCargarPensumOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [coordinadorActual, setCoordinadorActual] = useState(null);
  const [archivoPensum, setArchivoPensum] = useState(null);
  const [esAdminForm, setEsAdminForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  // ─── Estados de carga y error ──────────────────────────────────────────────
  const [isLoadingList, setIsLoadingList] = useState(true); // carga inicial
  const [isSaving, setIsSaving] = useState(false); // guardar/editar
  const [isDeleting, setIsDeleting] = useState(false); // eliminar
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");

  // ─── 1. CARGAR LISTA AL MONTAR ─────────────────────────────────────────────
  // useEffect con [] como dependencia se ejecuta UNA sola vez cuando el
  // componente aparece en pantalla. Aquí pedimos la lista real al backend.
  useEffect(() => {
    const cargarCoordinadores = async () => {
      setIsLoadingList(true);
      setListError("");
      try {
        // getUsuarios() hace GET /api/usuarios/
        // El ViewSet de Django devuelve todos los usuarios paginados (o no,
        // según tu configuración).
        const data = await getUsuarios();

        // data puede ser un array directo o { results: [...] } si usas paginación
        const lista = Array.isArray(data) ? data : data.results || [];

        // Normalizamos cada usuario al formato que espera el componente
        setCoordinadores(lista.map(normalizeCoordinador));
      } catch (err) {
        setListError(
          err.message || "No se pudo cargar la lista de coordinadores.",
        );
      } finally {
        setIsLoadingList(false);
      }
    };

    cargarCoordinadores();
  }, []); // ← Array vacío = solo al montar

  // ─── Filtrado local (sin llamar al backend) ────────────────────────────────
  // Filtramos la lista que ya tenemos en memoria. Para búsquedas más pesadas
  // podrías pasar el texto como parámetro a getUsuarios({ search: filtroTexto })
  const coordinadoresFiltrados = coordinadores.filter(
    (coord) =>
      coord.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      coord.carrera.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      coord.correo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (coord.username &&
        coord.username.toLowerCase().includes(filtroTexto.toLowerCase())),
  );

  // ─── 2. ABRIR MODAL DE ELIMINACIÓN ────────────────────────────────────────
  const confirmarEliminacion = (coord) => {
    setCoordinadorActual(coord);
    setIsDeleteModalOpen(true);
  };

  // ─── 3. EJECUTAR ELIMINACIÓN ──────────────────────────────────────────────
  const ejecutarEliminacion = async () => {
    setIsDeleting(true);
    try {
      // deleteUsuario() hace DELETE /api/usuarios/{id}/
      await deleteUsuario(coordinadorActual.id);

      // ★ Actualización optimista: quitamos el coordinador del estado local
      // sin recargar toda la lista. La UI responde instantáneamente.
      setCoordinadores((prev) =>
        prev.filter((c) => c.id !== coordinadorActual.id),
      );
      setIsDeleteModalOpen(false);
      setCoordinadorActual(null);
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── 4. ABRIR FORMULARIO ──────────────────────────────────────────────────
  const abrirFormulario = (coord = null) => {
    setCoordinadorActual(coord);
    setEsAdminForm(coord ? coord.esAdmin : false);
    setPasswordValue("");
    setConfirmPasswordValue("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // ─── 5. GUARDAR (CREAR O EDITAR) ──────────────────────────────────────────
  const guardarCoordinador = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validación de contraseñas en frontend
    if (passwordValue && passwordValue !== confirmPasswordValue) {
      setFormError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    // Leemos los valores del formulario usando FormData para no necesitar
    // un estado por cada campo del formulario.
    const formData = new FormData(e.target);

    // Construimos el objeto que espera el backend (campos del serializer)
    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      // username: usamos el email como username (práctica común)
      username: formData.get("email"),
      is_staff: esAdminForm,
    };

    // Solo incluimos la contraseña si el usuario escribió una
    // (en edición, campo vacío = no cambiar contraseña)
    if (passwordValue) {
      payload.password = passwordValue;
    }

    setIsSaving(true);
    try {
      if (coordinadorActual) {
        // ─── EDITAR ─────────────────────────────────────────────────────────
        // updateUsuario() hace PATCH /api/usuarios/{id}/
        const updated = await updateUsuario(coordinadorActual.id, payload);
        const normalizado = normalizeCoordinador(updated);

        // Reemplazamos el coordinador en la lista local
        setCoordinadores((prev) =>
          prev.map((c) => (c.id === normalizado.id ? normalizado : c)),
        );
      } else {
        // ─── CREAR ──────────────────────────────────────────────────────────
        // createUsuario() hace POST /api/usuarios/
        const created = await createUsuario(payload);
        const normalizado = normalizeCoordinador(created);

        // Añadimos el nuevo coordinador al final de la lista local
        setCoordinadores((prev) => [...prev, normalizado]);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      // Mostramos el error dentro del modal (no como alert)
      setFormError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue mb-2">
            Coordinadores
          </h1>
          <p className="text-gray-500">
            Mostrando {coordinadoresFiltrados.length} perfiles
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="flex items-center gap-2 border-url-blue text-url-blue hover:bg-url-blue hover:text-white"
            onClick={() => navigate("/semesters")}
          >
            <CalendarIcon className="w-5 h-5" /> Activar semestre
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => abrirFormulario(null)}
          >
            <UserPlusIcon className="w-5 h-5" /> Agregar Administrador
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Búsqueda por nombre, usuario, email o carrera..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#112240]"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            onClick={handleSearch}
            className="bg-[#e2e8f0] text-[#112240] font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-center w-1/3">
                  Nombre / Email
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-center w-1/4">
                  Facultad
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-center w-1/4">
                  Carrera
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-center w-auto">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-gray-500 font-semibold"
                  >
                    No se encontraron resultados.
                  </td>
                </tr>
              ) : (
                currentItems.map((coord, index) => (
                  <tr
                    key={coord.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${coord.esAdmin ? "bg-url-yellow" : "bg-url-blue"}`}
                        >
                          {coord.iniciales}
                        </div>

                        {/* Información de texto */}
                        <div className="flex flex-col">
                          <h4 className="font-bold text-url-blue text-sm leading-tight">
                            {coord.nombre}
                          </h4>

                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Username con ancho fijo para alinear el correo */}
                            <div className="w-28 shrink-0">
                              <span className="text-[10px] font-bold bg-blue-50 text-url-blue px-2 py-0.5 rounded-md border border-blue-100 inline-block w-full text-center">
                                @{coord.username || coord.correo.split("@")[0]}
                              </span>
                            </div>

                            {/* Correo - Ahora todos empezarán en el mismo punto vertical */}
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
                    <td className="py-4 px-6 text-center text-gray-500 text-sm">
                      {coord.carrera}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirFormulario(coord)}
                          className="w-8 h-8 border border-url-yellow bg-yellow-50 text-url-yellow rounded-md flex items-center justify-center hover:bg-url-yellow hover:text-white transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmarEliminacion(coord)}
                          className="w-8 h-8 border border-red-200 bg-red-50 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
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

        <div className="mt-auto flex justify-end items-center pt-4 pb-2 text-sm text-[#112240] font-bold gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            &larr; Anterior
          </button>
          <span>
            Página {safeCurrentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Siguiente &rarr;
          </button>
        </div>

        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={
            coordinadorActual ? "Editar Información" : "Agregar Nuevo perfil"
          }
        >
          <form onSubmit={guardarCoordinador} className="flex flex-col gap-5">
            <div className="flex justify-end items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {esAdminForm ? "Quitar Administrador" : "Dar Administrador"}
              </span>
              <button
                type="button"
                onClick={() => setEsAdminForm(!esAdminForm)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${esAdminForm ? "border-url-yellow bg-url-yellow" : "border-gray-300"}`}
              >
                {esAdminForm && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej. María Elizabet"
                  defaultValue={coordinadorActual?.nombre}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  placeholder="Ej. melizabet"
                  defaultValue={coordinadorActual?.username}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  placeholder="Ej. mtorres@univ.edu.gt"
                  defaultValue={coordinadorActual?.correo}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Facultad
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ingeniería"
                  defaultValue={coordinadorActual?.facultad}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Carrera
                </label>
                <input
                  type="text"
                  placeholder="Ej. Informática y sistemas"
                  defaultValue={coordinadorActual?.carrera}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Apellido
                </label>
                <input
                  name="last_name"
                  type="text"
                  placeholder="Ej. Torres"
                  defaultValue={
                    coordinadorActual?.nombre?.split(" ").slice(1).join(" ") ||
                    ""
                  }
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Correo Institucional
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Ej. mtorres@correo.url.edu.gt"
                  defaultValue={coordinadorActual?.correo || ""}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      coordinadorActual
                        ? "Dejar en blanco para no cambiar"
                        : "Ej. contraseña"
                    }
                    required={!coordinadorActual}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-10"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={
                      coordinadorActual
                        ? "Dejar en blanco para no cambiar"
                        : "Ej. contraseña"
                    }
                    required={!coordinadorActual || passwordValue.length > 0}
                    className={`w-full px-3 py-2 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-10 transition-colors ${passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50"}`}
                    value={confirmPasswordValue}
                    onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordValue &&
                  confirmPasswordValue &&
                  passwordValue !== confirmPasswordValue && (
                    <span className="text-xs text-red-500 font-semibold mt-1">
                      Las contraseñas no coinciden
                    </span>
                  )}
              </div>
            </div>
            <div className="flex justify-start gap-3 mt-4">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving
                  ? "Guardando..."
                  : coordinadorActual
                    ? "Guardar cambios"
                    : "Crear perfil"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormModalOpen(false)}
                className="bg-white border-gray-200 text-gray-600"
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Seguro que quiere eliminar a:"
        >
          <div className="flex flex-col items-center gap-6 py-4">
            <h2 className="text-2xl font-bold text-[#112240]">
              {coordinadorActual?.nombre}
            </h2>
            <p className="text-gray-500 text-sm -mt-4">
              {coordinadorActual?.carrera}
            </p>
            <div className="flex justify-center gap-4 w-full">
              <Button
                variant="secondary"
                className="w-full bg-url-yellow border-none text-white hover:bg-yellow-500"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={ejecutarEliminacion}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={!!alertMessage}
          onClose={() => setAlertMessage("")}
          title="Aviso del Sistema"
          zIndex="z-[60]"
        >
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${alertType === "error" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}
            >
              {alertType === "error" ? (
                <XCircleSolid className="w-8 h-8" />
              ) : (
                <CheckCircleSolid className="w-8 h-8" />
              )}
            </div>
            <p className="text-lg text-[#112240] text-center font-bold">
              {alertMessage}
            </p>
            <Button
              variant="primary"
              className="mt-8 w-full py-3"
              onClick={() => setAlertMessage("")}
            >
              Aceptar
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Coordinators;
