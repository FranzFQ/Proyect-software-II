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
    criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa", "Retroalimentacion al grupo", "Cumplimiento del programa"],
  },
  {
    id: 2,
    nombre: "Manejo de Aula",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 6,
    punteo: 9.4,
    color: "#22c55e",
    criteriosList: [],
  },
  {
    id: 3,
    nombre: "Uso de Tecnologia",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 5,
    punteo: 7.2,
    color: "#1a2744",
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

function ChecklistCard({ checklist, onEditar, onEjecutar }) {
  const scoreColor =
    checklist.punteo >= 9
      ? "text-green-600"
      : checklist.punteo >= 7
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div
      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-3 border-t-4 cursor-pointer"
      style={{ borderColor: checklist.color }}
      onClick={() => onEjecutar(checklist)}
    >
      <div>
        <h3 className="font-bold text-gray-800 text-base">{checklist.nombre}</h3>
        <p className="text-sm text-gray-500">Docente: {checklist.docente}</p>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{checklist.criterios} criterios</span>
        <span>
          Punteo de visita{" "}
          <strong className={`${scoreColor} text-base`}>{checklist.punteo}</strong>
        </span>
      </div>

      <ScoreBar punteo={checklist.punteo} color={checklist.color} />

      <div className="flex justify-between items-center pt-2">
        <span className="bg-[#1a2744] text-white text-xs px-3 py-1 rounded font-semibold">
          {checklist.codigoDocente}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditar(checklist);
          }}
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
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleNuevaChecklist = () => {
    setEditingChecklist(null);
    setShowForm(true);
  };

  const handleEditar = (checklist) => {
    setEditingChecklist(checklist);
    setModoEdicion(true);
    setEjecutandoChecklist(checklist);
  };

  const handleEjecutar = (checklist) => {
    setModoEdicion(false);
    setEjecutandoChecklist(checklist);
  };

  const handleGuardarChecklist = (data) => {
    if (editingChecklist) {
      setChecklists((prev) =>
        prev.map((c) => (c.id === editingChecklist.id ? { ...c, ...data } : c))
      );
      setShowForm(false);
      setEditingChecklist(null);
    } else {
      const nueva = {
        ...data,
        id: Date.now(),
        punteo: 0,
        color: "#F5C518",
        codigoDocente: `CAT - ${data.codigoDocente}`,
      };
      setChecklists((prev) => [...prev, nueva]);
      setShowForm(false);
      setEditingChecklist(null);
      // Abrir directamente en modo ejecución
      setModoEdicion(false);
      setEjecutandoChecklist(nueva);
    }
  };

  const handleGuardarEjecucion = (resultado) => {
    // En modo edición, persiste los criterios modificados en la lista
    if (modoEdicion && ejecutandoChecklist) {
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === ejecutandoChecklist.id
            ? {
                ...c,
                criteriosList: resultado.criteriosList,
                criterios: resultado.criteriosList.length,
              }
            : c
        )
      );
    }

    console.log("Resultado guardado:", resultado);
    setEjecutandoChecklist(null);
    setModoEdicion(false);
  };

  if (ejecutandoChecklist) {
    return (
      <ChecklistEjecucion
        checklist={ejecutandoChecklist}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardarEjecucion}
        onCancelar={() => {
          setEjecutandoChecklist(null);
          setModoEdicion(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a2744]">Checklists</h1>
          <p className="text-sm text-gray-500">
            Semestre I — 2025 · <strong>{checklists.length} activos</strong>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {/* lógica de cargar */}}
            className="bg-[#1a2744] text-white px-5 py-2 rounded font-bold text-sm hover:bg-[#2d3e6e]"
          >
            Cargar
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
            onEjecutar={handleEjecutar}
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