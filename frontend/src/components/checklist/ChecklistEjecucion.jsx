import { useState } from "react";

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
  const initialEval = checklist.criteriosList.map(() => ({
    completado: false,
    score: null,
  }));

  const [evaluaciones, setEvaluaciones] = useState(initialEval);
  const [observaciones, setObservaciones] = useState("");

  const completados = evaluaciones.filter((e) => e.completado).length;
  const total = checklist.criteriosList.length;

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

  const breadcrumb = modoEdicion ? "Editar Visita" : "Nueva Visita";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 pt-4 text-sm text-gray-500">
        <span
          className="text-[#1a2744] font-semibold cursor-pointer hover:underline"
          onClick={onCancelar}
        >
          Checklists
        </span>{" "}
        /{" "}
        <span
          className="text-[#1a2744] font-semibold cursor-pointer hover:underline"
          onClick={onCancelar}
        >
          {checklist.nombre}
        </span>{" "}
        / <span>{breadcrumb}</span>
      </div>

      <div className="p-4 md:p-8">
        {/* Header card */}
        <div className="bg-[#1a2744] rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white font-extrabold text-xl md:text-2xl tracking-wide">
              CURSO: {checklist.nombre.toUpperCase()}
            </h2>
            <p className="text-yellow-400 text-sm mt-1">
              Salon B-204 · Docente: {checklist.codigoDocente} · Jueves 14 nov - 2025
            </p>
            {modoEdicion && (
              <button className="mt-3 bg-yellow-400 text-[#1a2744] text-xs font-bold px-4 py-1.5 rounded hover:bg-yellow-300 transition">
                Agregar más parámetros
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="text-yellow-400 font-extrabold text-4xl leading-none">
              {completados}/{total}
            </div>
            <div className="text-white text-xs mt-1">Criterios</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Criterios */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">Criterios de Evaluacion</h3>
              {completados > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {completados} completados
                </span>
              )}
            </div>

            <div className="divide-y">
              {checklist.criteriosList.map((criterio, i) => {
                const e = evaluaciones[i];
                return (
                  <div
                    key={i}
                    className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-3 transition-colors ${
                      e.completado ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                      <span className={`text-sm ${e.completado ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                        {criterio}
                      </span>
                    </div>

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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Observaciones generales:</p>
              <textarea
                className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={5}
                placeholder="Docente muy bien preparada..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>

            <button
              onClick={() => onGuardar({ evaluaciones, observaciones })}
              className="bg-[#F5C518] text-[#1a2744] font-bold py-3 rounded-lg hover:bg-yellow-400 transition"
            >
              {modoEdicion ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}