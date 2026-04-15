import { useState, useRef, useEffect } from "react";
import Button from "../common/Button";

function ScoreButton({ value, score, onChange }) {
  const isSelected = score === value;
  const getColor = (v) => {
    if (v >= 9) return isSelected ? "bg-green-100 border-green-500 text-green-700 font-bold" : "border-gray-200 text-gray-400 hover:border-green-300";
    if (v >= 7) return isSelected ? "bg-yellow-100 border-yellow-400 text-yellow-700 font-bold" : "border-gray-200 text-gray-400 hover:border-yellow-300";
    return isSelected ? "bg-red-100 border-red-400 text-red-700 font-bold" : "border-gray-200 text-gray-400 hover:border-red-300";
  };

  return (
    <button
      onClick={() => onChange(value)}
      className={`w-8 h-8 rounded border text-xs transition-all ${getColor(value)}`}
    >
      {value}
    </button>
  );
}

function getScoreBadgeStyle(score) {
  if (score === null) return "bg-gray-100 text-gray-400";
  if (score >= 9) return "bg-green-100 text-green-700";
  if (score >= 7) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-600";
}

export default function ChecklistEjecucion({ checklist, modoEdicion, onGuardar, onCancelar }) {
  const [criterios, setCriterios] = useState(checklist.criteriosList);

  const initialEval = checklist.criteriosList.map(() => ({
    completado: false,
    score: null,
  }));

  const [evaluaciones,  setEvaluaciones]  = useState(initialEval);
  const [observaciones, setObservaciones] = useState("");

  const [editandoIdx,    setEditandoIdx]    = useState(null);
  const [editandoTexto,  setEditandoTexto]  = useState("");
  const [mostrarNuevo,   setMostrarNuevo]   = useState(false);
  const [nuevoCriterio,  setNuevoCriterio]  = useState("");

  const nuevoCriterioRef = useRef(null);
  const editInputRef     = useRef(null);

  useEffect(() => {
    if (mostrarNuevo) nuevoCriterioRef.current?.focus();
  }, [mostrarNuevo]);

  useEffect(() => {
    if (editandoIdx !== null) editInputRef.current?.focus();
  }, [editandoIdx]);

  const completados = evaluaciones.filter((e) => e.completado).length;
  const total = criterios.length;

  const toggle = (i) => {
    setEvaluaciones((prev) =>
      prev.map((e, idx) =>
        idx === i ? { completado: !e.completado, score: !e.completado ? 5 : null } : e
      )
    );
  };

  const setScore = (i, val) => {
    setEvaluaciones((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, score: val } : e))
    );
  };

  const iniciarEdicion = (i) => {
    setEditandoIdx(i);
    setEditandoTexto(criterios[i]);
  };

  const confirmarEdicion = () => {
    if (!editandoTexto.trim()) return;
    setCriterios((prev) =>
      prev.map((c, i) => (i === editandoIdx ? editandoTexto.trim() : c))
    );
    setEditandoIdx(null);
    setEditandoTexto("");
  };

  const cancelarEdicion = () => {
    setEditandoIdx(null);
    setEditandoTexto("");
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") confirmarEdicion();
    if (e.key === "Escape") cancelarEdicion();
  };

  const eliminarCriterio = (i) => {
    setCriterios((prev) => prev.filter((_, idx) => idx !== i));
    setEvaluaciones((prev) => prev.filter((_, idx) => idx !== i));
  };

  const agregarCriterio = () => {
    if (!nuevoCriterio.trim()) return;
    setCriterios((prev) => [...prev, nuevoCriterio.trim()]);
    setEvaluaciones((prev) => [...prev, { completado: false, score: null }]);
    setNuevoCriterio("");
    nuevoCriterioRef.current?.focus();
  };

  const cancelarNuevo = () => {
    setNuevoCriterio("");
    setMostrarNuevo(false);
  };

  const handleNuevoKeyDown = (e) => {
    if (e.key === "Enter") agregarCriterio();
    if (e.key === "Escape") cancelarNuevo();
  };

  const handleGuardar = () => {
    onGuardar({ criteriosList: criterios, evaluaciones, observaciones });
  };

  const breadcrumb = modoEdicion ? "Editar Visita" : "Nueva Visita";

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <span
          className="text-url-blue font-semibold cursor-pointer hover:underline"
          onClick={onCancelar}
        >
          Checklists
        </span>{" "}
        /{" "}
        <span
          className="text-url-blue font-semibold cursor-pointer hover:underline"
          onClick={onCancelar}
        >
          {checklist.nombre}
        </span>{" "}
        / <span>{breadcrumb}</span>
      </div>

      {/* Header card */}
      <div className="bg-url-blue rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-white font-serif font-bold text-xl md:text-2xl tracking-wide">
            {checklist.nombre}
          </h2>
          <p className="text-url-yellow text-sm mt-1">
            Salon B-204 · Docente: {checklist.codigoDocente} · Jueves 14 nov - 2025
          </p>
          {modoEdicion && (
            <button
              onClick={() => setMostrarNuevo(true)}
              className="mt-3 bg-url-yellow text-url-blue text-xs font-bold px-4 py-1.5 rounded hover:opacity-90 transition"
            >
              + Agregar más parámetros
            </button>
          )}
        </div>
        <div className="text-right">
          <div className="text-url-yellow font-bold text-4xl leading-none">
            {completados}/{total}
          </div>
          <div className="text-white text-xs mt-1">Criterios</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Criterios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-url-blue">Criterios de Evaluacion</h3>
            {completados > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                {completados} completados
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {criterios.map((criterio, i) => {
              const e = evaluaciones[i] ?? { completado: false, score: null };
              const estaEditando = modoEdicion && editandoIdx === i;

              return (
                <div
                  key={i}
                  className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-3 transition-colors ${
                    e.completado ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox — solo visible fuera de modo edición */}
                    {!modoEdicion && (
                      <button
                        onClick={() => toggle(i)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          e.completado
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {e.completado && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Texto / input edición */}
                    {estaEditando ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          ref={editInputRef}
                          value={editandoTexto}
                          onChange={(e) => setEditandoTexto(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1"
                        />
                        <button
                          onClick={confirmarEdicion}
                          className="bg-url-yellow text-url-blue px-2.5 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="text-gray-400 hover:text-gray-600 px-1.5 py-1.5 text-base leading-none transition"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className={`text-sm truncate ${e.completado ? "text-gray-800 font-medium" : "text-gray-400"} ${modoEdicion ? "text-gray-700" : ""}`}>
                        {criterio}
                      </span>
                    )}
                  </div>

                  {/* Acciones modo edición */}
                  {modoEdicion && !estaEditando && (
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Button variant="secondary" onClick={() => iniciarEdicion(i)}>
                        Editar
                      </Button>
                      <Button variant="danger" onClick={() => eliminarCriterio(i)}>
                        Eliminar
                      </Button>
                    </div>
                  )}

                  {/* Score — solo modo ejecución */}
                  {!modoEdicion && (
                    <div className="flex items-center gap-2 ml-10 md:ml-0">
                      {e.completado ? (
                        <>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                              <ScoreButton key={v} value={v} score={e.score} onChange={(val) => setScore(i, val)} />
                            ))}
                          </div>
                          <div className={`min-w-[60px] text-center text-sm font-bold px-3 py-1 rounded ${getScoreBadgeStyle(e.score)}`}>
                            {e.score !== null ? `${e.score} / 10` : "— / 10"}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-300 ml-auto">— / 10</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Fila para agregar nuevo criterio inline */}
            {modoEdicion && mostrarNuevo && (
              <div className="flex items-center gap-2 px-6 py-4 bg-yellow-50">
                <input
                  ref={nuevoCriterioRef}
                  value={nuevoCriterio}
                  onChange={(e) => setNuevoCriterio(e.target.value)}
                  onKeyDown={handleNuevoKeyDown}
                  placeholder="Nombre del nuevo criterio..."
                  className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1"
                />
                <button
                  onClick={agregarCriterio}
                  className="bg-url-yellow text-url-blue px-3 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition"
                >
                  ✓ Agregar
                </button>
                <button
                  onClick={cancelarNuevo}
                  className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-base leading-none transition"
                >
                  ×
                </button>
              </div>
            )}

            {modoEdicion && mostrarNuevo && (
              <p className="px-6 pb-3 text-xs text-gray-400">Presiona Enter para agregar · Esc para cancelar</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
              Observaciones generales:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
              rows={5}
              placeholder="Docente muy bien preparada..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <Button variant="primary" onClick={handleGuardar} className="w-full justify-center py-3">
            {modoEdicion ? "Guardar cambios" : "Guardar"}
          </Button>

          <Button variant="secondary" onClick={onCancelar} className="w-full justify-center py-3">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}