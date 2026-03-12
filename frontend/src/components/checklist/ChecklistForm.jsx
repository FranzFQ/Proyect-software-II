import { useState } from "react";

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(checklist?.nombre || "");
  const [codigoDocente, setCodigoDocente] = useState(checklist?.codigoDocente || "");
  const [nombreCurso, setNombreCurso] = useState(checklist?.nombreCurso || "");
  const [criterios, setCriterios] = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState("");

  const agregarCriterio = () => {
    if (!nuevoCriterio.trim()) return;

    setCriterios((prev) => [...prev, nuevoCriterio]);
    setNuevoCriterio("");
  };

  const eliminarCriterio = (idx) => {
    setCriterios((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardar = () => {
    onGuardar({
      nombre,
      codigoDocente,
      nombreCurso,
      criteriosList: criterios,
      criterios: criterios.length,
      docente: "Nombre docente",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl">

        <h2 className="text-xl font-bold mb-4">
          {checklist ? "Editar Checklist" : "Nueva Checklist"}
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6">

          <input
            placeholder="Nombre"
            className="border rounded p-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            placeholder="Código docente"
            className="border rounded p-2"
            value={codigoDocente}
            onChange={(e) => setCodigoDocente(e.target.value)}
          />

          <input
            placeholder="Curso"
            className="border rounded p-2"
            value={nombreCurso}
            onChange={(e) => setNombreCurso(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {criterios.map((c, i) => (
            <span
              key={i}
              className="bg-[#1a2744] text-white px-3 py-1 rounded text-sm flex items-center gap-2"
            >
              {c}
              <button onClick={() => eliminarCriterio(i)}>×</button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-col sm:flex-row">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Nuevo criterio"
            value={nuevoCriterio}
            onChange={(e) => setNuevoCriterio(e.target.value)}
          />

          <button
            onClick={agregarCriterio}
            className="border border-yellow-400 px-4 py-2 rounded font-bold"
          >
            Agregar
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={handleGuardar}
            className="bg-[#F5C518] px-5 py-2 rounded font-bold"
          >
            Guardar
          </button>

          <button
            onClick={onCancelar}
            className="border px-5 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}