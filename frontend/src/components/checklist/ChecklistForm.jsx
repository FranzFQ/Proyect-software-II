import { useState, useRef, useEffect } from "react";

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(checklist?.nombre || "");
  const [codigoDocente, setCodigoDocente] = useState(checklist?.codigoDocente || "");
  const [nombreCurso, setNombreCurso] = useState(checklist?.nombreCurso || "");
  const [criterios, setCriterios] = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mostrarInput) inputRef.current?.focus();
  }, [mostrarInput]);

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
    if (!nombre.trim()) return;
    onGuardar({
      nombre,
      codigoDocente,
      nombreCurso,
      criteriosList: criterios,
      criterios: criterios.length,
      docente: "Nombre del docente",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-extrabold text-[#1a2744]">
            {checklist ? "Editar Checklist" : "Crear Nueva Checklist"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Define el nombre y agrega los criterios de evaluacion que se usaran durante la visita de clase
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Fields */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Nombre de la Checklist
              </label>
              <input
                placeholder="Ej. Observacion Metodologica"
                className="border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Codigo Docente
              </label>
              <input
                placeholder="Ej. 1037492"
                className="border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={codigoDocente}
                onChange={(e) => setCodigoDocente(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Nombre del Curso
              </label>
              <input
                placeholder="Ej. Progra web"
                className="border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={nombreCurso}
                onChange={(e) => setNombreCurso(e.target.value)}
              />
            </div>
          </div>

          {/* Criterios */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Criterios de Evaluacion (arrastra para reordenar):
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {criterios.map((c, i) => (
                <span
                  key={i}
                  className="bg-[#1a2744] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                >
                  {c}
                  <button
                    onClick={() => eliminarCriterio(i)}
                    className="hover:text-yellow-400 transition text-base leading-none"
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
                    className="border-2 border-yellow-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none w-48"
                  />
                  <button
                    onClick={agregarCriterio}
                    className="bg-yellow-400 text-[#1a2744] px-2.5 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition"
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
                  className="border-2 border-yellow-400 text-[#1a2744] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-50 transition"
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
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={handleGuardar}
            className="bg-[#F5C518] text-[#1a2744] px-6 py-2.5 rounded-lg font-extrabold hover:bg-yellow-400 transition"
          >
            Guardar Checklist
          </button>
          <button
            onClick={onCancelar}
            className="border px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}