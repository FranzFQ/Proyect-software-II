import { useState } from "react";
import ChecklistForm from "../components/checklist/ChecklistForm";
import ChecklistEjecucion from "../components/checklist/ChecklistEjecucion";

const MOCK_CHECKLISTS = [
  {
    id: 1,
    nombre: "Observacion Pedagogica",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 8,
    punteo: 7.5,
    color: "#F5C518",
    criteriosList: [],
  },
];

function ScoreBar({ punteo, color }) {
  const pct = (punteo / 10) * 100;

  return (
    <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
      <div
        className="h-full rounded transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ChecklistCard({ checklist, onEditar }) {
  const scoreColor =
    checklist.punteo >= 9
      ? "text-green-600"
      : checklist.punteo >= 7
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-3 border-t-4"
      style={{ borderColor: checklist.color }}
    >
      <div>
        <h3 className="font-bold text-gray-800 text-base">
          {checklist.nombre}
        </h3>

        <p className="text-sm text-gray-500">
          Docente: {checklist.docente}
        </p>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{checklist.criterios} criterios</span>

        <span>
          Punteo{" "}
          <strong className={`${scoreColor} text-base`}>
            {checklist.punteo}
          </strong>
        </span>
      </div>

      <ScoreBar punteo={checklist.punteo} color={checklist.color} />

      <div className="flex justify-between items-center pt-2">
        <span className="bg-[#1a2744] text-white text-xs px-3 py-1 rounded font-semibold">
          {checklist.codigoDocente}
        </span>

        <button
          onClick={() => onEditar(checklist)}
          className="bg-[#1a2744] text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-[#2d3e6e]"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

export default function Checklist() {
  const [checklists, setChecklists] = useState(MOCK_CHECKLISTS);
  const [showForm, setShowForm] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [ejecutandoChecklist, setEjecutandoChecklist] = useState(null);

  const handleNuevaChecklist = () => {
    setEditingChecklist(null);
    setShowForm(true);
  };

  const handleEditar = (checklist) => {
    setEditingChecklist(checklist);
    setShowForm(true);
  };

  const handleGuardarChecklist = (data) => {
    if (editingChecklist) {
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === editingChecklist.id ? { ...c, ...data } : c
        )
      );
    } else {
      const nueva = {
        ...data,
        id: Date.now(),
        punteo: 0,
        color: "#F5C518",
        codigoDocente: `CAT - ${data.codigoDocente}`,
      };

      setChecklists((prev) => [...prev, nueva]);
    }

    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleProcesar = (checklist) => {
    setEjecutandoChecklist(checklist);
  };

  const handleGuardarEjecucion = (resultado) => {
    console.log(resultado);
    setEjecutandoChecklist(null);
  };

  if (ejecutandoChecklist) {
    return (
      <ChecklistEjecucion
        checklist={ejecutandoChecklist}
        onGuardar={handleGuardarEjecucion}
        onCancelar={() => setEjecutandoChecklist(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a2744]">
            Checklists
          </h1>

          <p className="text-sm text-gray-500">
            Semestre I — 2025 ·{" "}
            <strong>{checklists.length} activos</strong>
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={() =>
              checklists.length > 0 && handleProcesar(checklists[0])
            }
            className="bg-[#1a2744] text-white px-5 py-2 rounded font-bold text-sm hover:bg-[#2d3e6e]"
          >
            Procesar
          </button>

          <button
            onClick={handleNuevaChecklist}
            className="bg-[#F5C518] text-[#1a2744] px-5 py-2 rounded font-bold text-sm hover:bg-yellow-500"
          >
            + Nueva Checklist
          </button>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onEditar={handleEditar}
          />
        ))}
      </div>

      {showForm && (
        <ChecklistForm
          checklist={editingChecklist}
          onGuardar={handleGuardarChecklist}
          onCancelar={() => {
            setShowForm(false);
            setEditingChecklist(null);
          }}
        />
      )}
    </div>
  );
}