import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import ChecklistForm from "../components/checklist/ChecklistForm";
import ChecklistEjecucion from "../components/checklist/ChecklistEjecucion";

const CHECKLISTS_INICIALES = [
  {
    id: 1,
    nombre: "Observacion Pedagogica",
    docente: "Marta Alvarado Fuentes",
    docenteId: 1,
    codigoDocente: "CAT - 9831751",
    nombreCurso: "Redes y telecomunicaciones",
    criterios: 6,
    punteo: 8.8,
    color: "#F5C518",
    criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"],
  },
  {
    id: 2,
    nombre: "Manejo de Aula",
    docente: "Marta Alvarado Fuentes",
    docenteId: 1,
    codigoDocente: "CAT - 9831751",
    nombreCurso: "Programación web",
    criterios: 6,
    punteo: 9.1,
    color: "#22c55e",
    criteriosList: ["Control del grupo", "Clima de aula", "Gestion del tiempo", "Disciplina positiva", "Participacion estudiantil", "Ambiente inclusivo"],
  },
  {
    id: 3,
    nombre: "Uso de Tecnologia",
    docente: "Pedro José García Moreno",
    docenteId: 3,
    codigoDocente: "CAT - 9831730",
    nombreCurso: "Física I",
    criterios: 5,
    punteo: 6.5,
    color: "#1a2744",
    criteriosList: ["Uso de proyector", "Recursos digitales", "Plataforma virtual", "Material de apoyo", "Interactividad digital"],
  },
];

function ScoreBar({ punteo, color }) {
  const pct = (punteo / 10) * 100;
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ChecklistCard({ checklist, onEditar, onEjecutar }) {
  const scoreColor =
    checklist.punteo >= 9 ? "text-green-600" :
    checklist.punteo >= 7 ? "text-yellow-500" : "text-red-500";

  return (
    <div
      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-3 border-t-4 cursor-pointer"
      style={{ borderColor: checklist.color }}
      onClick={() => onEjecutar(checklist)}
    >
      <div>
        <h3 className="font-bold text-gray-800 text-base">{checklist.nombre}</h3>
        <p className="text-sm text-gray-500">Docente: {checklist.docente}</p>
        {checklist.nombreCurso && (
          <p className="text-xs text-gray-400">Curso: {checklist.nombreCurso}</p>
        )}
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
          onClick={(e) => { e.stopPropagation(); onEditar(checklist); }}
          className="bg-[#1a2744] text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-[#2d3e6e]"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

export default function Checklist() {
  const { guardarVisitaEnDocente, docentes } = useContext(AppContext);

  const [checklists,          setChecklists]          = useState(CHECKLISTS_INICIALES);
  const [showForm,            setShowForm]            = useState(false);
  const [editingChecklist,    setEditingChecklist]    = useState(null);
  const [ejecutandoChecklist, setEjecutandoChecklist] = useState(null);
  const [modoEdicion,         setModoEdicion]         = useState(false);

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
    } else {
      const nueva = {
        ...data,
        id: Date.now(),
        punteo: 0,
        color: "#F5C518",
      };
      setChecklists((prev) => [...prev, nueva]);
      setShowForm(false);
      setEditingChecklist(null);
      setModoEdicion(false);
      setEjecutandoChecklist(nueva);
      return;
    }
    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleGuardarEjecucion = (resultado) => {
    const { criteriosList, evaluaciones, observaciones } = resultado;

    // Calcular punteo promedio de las evaluaciones completadas
    const completadas = evaluaciones.filter((e) => e.completado && e.score !== null);
    const punteoCalculado = completadas.length
      ? parseFloat((completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1))
      : ejecutandoChecklist.punteo;

    // Actualizar checklist en la lista local
    if (modoEdicion) {
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === ejecutandoChecklist.id
            ? { ...c, criteriosList, criterios: criteriosList.length, punteo: punteoCalculado }
            : c
        )
      );
    } else {
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === ejecutandoChecklist.id
            ? { ...c, punteo: punteoCalculado }
            : c
        )
      );
    }

    // Persistir la visita en el docente del contexto global
    if (ejecutandoChecklist.docenteId) {
      const docente = docentes.find((d) => String(d.id) === String(ejecutandoChecklist.docenteId));
      const visitasActuales = docente?.visitas || [];
      const numeroVisita = visitasActuales.length + 1;

      const visitaGuardada = {
        id: ejecutandoChecklist.id,
        numero: numeroVisita,
        nombre: ejecutandoChecklist.nombre,
        fecha: new Date().toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" }),
        materia: ejecutandoChecklist.nombreCurso || "",
        punteo: punteoCalculado,
        codigoDocente: ejecutandoChecklist.codigoDocente,
        color: ejecutandoChecklist.color || "#F5C518",
        criteriosList,
        criterios: criteriosList.length,
        evaluacionesGuardadas: evaluaciones,
        observacionesGuardadas: observaciones,
      };

      guardarVisitaEnDocente(ejecutandoChecklist.docenteId, visitaGuardada);
    }

    setEjecutandoChecklist(null);
    setModoEdicion(false);
  };

  if (ejecutandoChecklist) {
    return (
      <ChecklistEjecucion
        checklist={ejecutandoChecklist}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardarEjecucion}
        onCancelar={() => { setEjecutandoChecklist(null); setModoEdicion(false); }}
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
            onClick={() => {}}
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
          onCancelar={() => { setShowForm(false); setEditingChecklist(null); }}
        />
      )}
    </div>
  );
}
