import { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Button from "../common/Button";

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const { docentes } = useContext(AppContext);

  const [nombre,        setNombre]        = useState(checklist?.nombre        || "");
  const [docenteId,     setDocenteId]     = useState(checklist?.docenteId     || "");
  const [cursoNombre,   setCursoNombre]   = useState(checklist?.nombreCurso   || "");
  const [seccion,       setSeccion]       = useState(checklist?.seccion       || "");
  const [criterios,     setCriterios]     = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [mostrarInput,  setMostrarInput]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mostrarInput) inputRef.current?.focus();
  }, [mostrarInput]);

  const docenteSeleccionado = docentes.find((d) => String(d.id) === String(docenteId));
  const cursosDisponibles   = docenteSeleccionado?.cursosActuales || [];
  const cursoSeleccionado   = cursosDisponibles.find((c) => c.nombre === cursoNombre);
  const seccionesDisponibles = cursoSeleccionado?.secciones || [];

  const handleDocenteChange = (e) => {
    setDocenteId(e.target.value);
    setCursoNombre("");
    setSeccion("");
  };

  const handleCursoChange = (e) => {
    setCursoNombre(e.target.value);
    setSeccion("");
  };

  const agregarCriterio = () => {
    if (!nuevoCriterio.trim()) return;
    setCriterios((prev) => [...prev, nuevoCriterio.trim()]);
    setNuevoCriterio("");
    inputRef.current?.focus();
  };

  const cancelarInput = () => {
    setNuevoCriterio("");
    setMostrarInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") agregarCriterio();
    if (e.key === "Escape") cancelarInput();
  };

  const eliminarCriterio = (idx) => {
    setCriterios((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardar = () => {
    if (!nombre.trim() || !docenteId) return;
    onGuardar({
      nombre,
      docenteId,
      codigoDocente: docenteSeleccionado?.codigo || "",
      docente:       docenteSeleccionado?.nombre  || "",
      nombreCurso:   cursoNombre,
      seccion,
      criteriosList: criterios,
      criterios:     criterios.length,
    });
  };

  const selectClass = "border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent bg-white w-full transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-url-blue">
            {checklist ? "Editar Checklist" : "Crear Nueva Checklist"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define el nombre y agrega los criterios de evaluacion que se usaran durante la visita de clase
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Fila 1: nombre + docente */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* Nombre de la checklist */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nombre de la Checklist
              </label>
              <input
                placeholder="Ej. Observacion Metodologica"
                className="px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            {/* Select Docente */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Docente
              </label>
              <select
                className={selectClass}
                value={docenteId}
                onChange={handleDocenteChange}
              >
                <option value="">Seleccionar docente...</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: curso + sección */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* Select Curso */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Curso
              </label>
              <select
                className={selectClass}
                value={cursoNombre}
                onChange={handleCursoChange}
                disabled={!docenteId}
              >
                <option value="">
                  {docenteId ? "Seleccionar curso..." : "Primero selecciona docente"}
                </option>
                {cursosDisponibles.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Sección */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sección
              </label>
              <select
                className={selectClass}
                value={seccion}
                onChange={(e) => setSeccion(e.target.value)}
                disabled={!cursoNombre}
              >
                <option value="">
                  {cursoNombre ? "Seleccionar sección..." : "Primero selecciona curso"}
                </option>
                {seccionesDisponibles.map((s) => (
                  <option key={s} value={s}>
                    Sección {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Criterios */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Criterios de Evaluacion:
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {criterios.map((c, i) => (
                <span
                  key={i}
                  className="bg-url-blue text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                >
                  {c}
                  <button
                    onClick={() => eliminarCriterio(i)}
                    className="hover:text-url-yellow transition text-base leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}

              {mostrarInput ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    value={nuevoCriterio}
                    onChange={(e) => setNuevoCriterio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nombre del criterio..."
                    className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none w-48"
                  />
                  <button
                    onClick={agregarCriterio}
                    className="bg-url-yellow text-url-blue px-2.5 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelarInput}
                    className="text-gray-400 hover:text-gray-600 px-1.5 py-1.5 text-base leading-none transition"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMostrarInput(true)}
                  className="border-2 border-url-blue text-url-blue px-3 py-1.5 rounded-md text-sm font-bold hover:bg-url-blue hover:text-white transition"
                >
                  + Agregar criterio
                </button>
              )}
            </div>
            {mostrarInput && (
              <p className="text-xs text-gray-400 mt-1.5">Presiona Enter para agregar · Esc para cancelar</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <Button
            variant="primary"
            onClick={handleGuardar}
            className={!nombre.trim() || !docenteId ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
          >
            Guardar Checklist
          </Button>
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}