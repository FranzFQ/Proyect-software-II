import { useState } from "react";
import ChecklistForm from "../components/checklist/ChecklistForm";
import ChecklistEjecucion from "../components/checklist/ChecklistEjecucion";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CHECKLISTS = [
  {
    id: 1,
    nombre: "Observacion Pedagogica",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 8,
    punteo: 7.5,
    color: "#F5C518",
    criteriosList: [
      "Claridad en la explicacion",
      "Dominio del contenido",
      "Interaccion con estudiantes",
      "Uso de recursos didacticos",
      "Puntualidad y orden",
      "Evaluacion formativa",
      "Retroalimentacion al grupo",
      "Cumplimiento del programa",
    ],
  },
  {
    id: 2,
    nombre: "Manejo de Aula",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 6,
    punteo: 9.4,
    color: "#22c55e",
    criteriosList: [
      "Control del ambiente",
      "Manejo del tiempo",
      "Dinamicas grupales",
      "Atencion individualizada",
      "Gestion de conflictos",
      "Participacion estudiantil",
    ],
  },
  {
    id: 3,
    nombre: "Uso de Tecnologia",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 5,
    punteo: 7.2,
    color: "#1d4ed8",
    criteriosList: [
      "Uso de proyector",
      "Plataformas digitales",
      "Material multimedia",
      "Herramientas interactivas",
      "Accesibilidad digital",
    ],
  },
  {
    id: 4,
    nombre: "Respeto dentro del aula",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 4,
    punteo: 9.1,
    color: "#22c55e",
    criteriosList: [
      "Trato igualitario",
      "Lenguaje adecuado",
      "Escucha activa",
      "Ambiente inclusivo",
    ],
  },
  {
    id: 5,
    nombre: "Puntual",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 1,
    punteo: 7.5,
    color: "#1d4ed8",
    criteriosList: ["Llegada a tiempo"],
  },
  {
    id: 6,
    nombre: "Dominio del tema",
    docente: "Nombre del docente",
    codigoDocente: "CAT - 1038462",
    criterios: 10,
    punteo: 8.5,
    color: "#F5C518",
    criteriosList: [
      "Profundidad conceptual",
      "Ejemplos pertinentes",
      "Respuesta a preguntas",
      "Actualizacion del contenido",
      "Conexion con la practica",
      "Vocabulario tecnico",
      "Estructura logica",
      "Fuentes utilizadas",
      "Aplicacion real",
      "Sintesis efectiva",
    ],
  },
];

// ─── Score Bar Component ──────────────────────────────────────────────────────
function ScoreBar({ punteo, color }) {
  const pct = (punteo / 10) * 100;
  return (
    <div style={{ width: "100%", height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ─── Checklist Card ───────────────────────────────────────────────────────────
function ChecklistCard({ checklist, onEditar }) {
  const scoreColor =
    checklist.punteo >= 9 ? "#22c55e" : checklist.punteo >= 7 ? "#F5C518" : "#ef4444";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "20px",
        borderTop: `4px solid ${checklist.color}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.13)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a2744" }}>
          {checklist.nombre}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Docente: {checklist.docente}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#6b7280" }}>
        <span>{checklist.criterios} criterios</span>
        <span>
          Punteo de visita{" "}
          <strong style={{ color: scoreColor, fontSize: 15 }}>{checklist.punteo}</strong>
        </span>
      </div>

      <ScoreBar punteo={checklist.punteo} color={checklist.color} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{
          background: "#1a2744",
          color: "#fff",
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 4,
          fontWeight: 600,
        }}>
          {checklist.codigoDocente}
        </span>
        <button
          onClick={() => onEditar(checklist)}
          style={{
            background: "#1a2744",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 18px",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#2d3e6e"}
          onMouseLeave={e => e.currentTarget.style.background = "#1a2744"}
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
      setChecklists(prev =>
        prev.map(c => c.id === editingChecklist.id ? { ...c, ...data } : c)
      );
    } else {
      const nueva = {
        ...data,
        id: Date.now(),
        punteo: 0,
        color: "#F5C518",
        codigoDocente: `CAT - ${data.codigoDocente}`,
      };
      setChecklists(prev => [...prev, nueva]);
    }
    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleProcesar = (checklist) => {
    setEjecutandoChecklist(checklist);
  };

  const handleGuardarEjecucion = (resultado) => {
    console.log("Visita guardada:", resultado);
    // Aquí conectarías con tu API
    setEjecutandoChecklist(null);
  };

  // Vista: Ejecucion de visita
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
    <div style={{ padding: "32px 36px", background: "#f4f6fb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#1a2744" }}>Checklists</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
            Semestre I — 2025 · <strong>{checklists.length} checklists activos</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => checklists.length > 0 && handleProcesar(checklists[0])}
            style={{
              background: "#1a2744",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#2d3e6e"}
            onMouseLeave={e => e.currentTarget.style.background = "#1a2744"}
          >
            Procesar
          </button>
          <button
            onClick={handleNuevaChecklist}
            style={{
              background: "#F5C518",
              color: "#1a2744",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e6b800"}
            onMouseLeave={e => e.currentTarget.style.background = "#F5C518"}
          >
            + Nueva Checklist
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20,
      }}>
        {checklists.map(checklist => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onEditar={handleEditar}
          />
        ))}
      </div>

      {/* Modal: Crear / Editar */}
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