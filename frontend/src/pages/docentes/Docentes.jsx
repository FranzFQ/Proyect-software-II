import { useState } from "react";
import DocenteHistorico from "./DocenteHistorico";
import DocenteDetalle from "./DocenteDetalle";
import ChecklistResultados from "./ChecklistResultados";
import VisitaDetalle from "./VisitaDetalle";

// ── Mock data ──────────────────────────────────────────────────────────────────
export const MOCK_DOCENTES = [
  {
    id: 1,
    nombre: "Marta Alvarado Fuentes",
    iniciales: "MA",
    departamento: "Ingeniería de Sistemas",
    tipo: "Tiempo Completo",
    semestres: [
      {
        id: "s1-2024",
        label: "Semestre I - 2024",
        calificacion: 9.3,
        nivel: "Excelente",
        cursos: [
          {
            codigo: "CS301",
            nombre: "Estructuras de Datos",
            creditos: 3,
            punteoFinal: 9.3,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 9.6, color: "#FFD700" },
              { nombre: "Autoevaluación",    valor: 9.8, color: "#1a2a4a" },
              { nombre: "Coordinador",       valor: 9.0, color: "#FFD700" },
              { nombre: "Checklist",         valor: 8.8, color: "#6b7280" },
            ],
            comentarios: [
              "Excelente docente, explica con mucha claridad y está disponible para dudas.",
              "Buen manejo del tiempo, clase organizada con ejemplos prácticos.",
              "Podría mejorar el material, pero su explicación oral es muy efectiva.",
            ],
            sugerencias: [
              "El docente cuenta con la experiencia y los conocimientos necesarios para impartir el curso.",
            ],
          },
        ],
      },
      {
        id: "s2-2024",
        label: "Semestre II - 2024",
        calificacion: 9.2,
        nivel: "Excelente",
        cursos: [
          {
            codigo: "CS410",
            nombre: "Algoritmos Avanzados",
            creditos: 4,
            punteoFinal: 9.2,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 9.4, color: "#FFD700" },
              { nombre: "Autoevaluación",    valor: 9.5, color: "#1a2a4a" },
              { nombre: "Coordinador",       valor: 9.1, color: "#FFD700" },
              { nombre: "Checklist",         valor: 8.6, color: "#6b7280" },
            ],
            comentarios: [
              "Excelente dominio del tema, los ejemplos son muy ilustrativos.",
              "El ritmo de la clase es adecuado y las evaluaciones son justas.",
            ],
            sugerencias: ["Sería beneficioso incluir más ejercicios prácticos en laboratorio."],
          },
        ],
      },
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 5.6,
        nivel: "Bueno",
        cursos: [
          {
            codigo: "CS220",
            nombre: "Programación Orientada a Objetos",
            creditos: 3,
            punteoFinal: 5.6,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 5.8, color: "#FFD700" },
              { nombre: "Autoevaluación",    valor: 6.0, color: "#1a2a4a" },
              { nombre: "Coordinador",       valor: 5.5, color: "#FFD700" },
              { nombre: "Checklist",         valor: 5.0, color: "#6b7280" },
            ],
            comentarios: [
              "El docente necesita mejorar la claridad de sus explicaciones.",
              "Las clases son largas y a veces difíciles de seguir.",
            ],
            sugerencias: ["Se recomienda reforzar el uso de recursos didácticos y ejemplos prácticos."],
          },
        ],
      },
    ],
    visitas: [
      {
        id: 101, numero: 1, fecha: "14 nov - 2025", materia: "Redes y telecomunicaciones",
        punteo: 8.8, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 1038462",
        color: "#F5C518",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 10 },
          { completado: true, score: 8 }, { completado: true, score: 7  },
          { completado: true, score: 9 }, { completado: false, score: null },
        ],
        observacionesGuardadas: "Docente muy bien preparada...",
      },
      {
        id: 102, numero: 2, fecha: "28 oct - 2025", materia: "Programación web",
        punteo: 9.1, nombre: "Manejo de Aula", codigoDocente: "CAT - 1038462",
        color: "#22c55e",
        criteriosList: ["Control del grupo", "Clima de aula", "Gestion del tiempo", "Disciplina positiva", "Participacion estudiantil", "Ambiente inclusivo"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 10}, { completado: true, score: 9 },
        ],
        observacionesGuardadas: "Excelente manejo del grupo y metodología activa.",
      },
      {
        id: 103, numero: 3, fecha: "14 Marzo - 2026", materia: "Software II",
        punteo: 8.8, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 1038462",
        color: "#F5C518",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 10 },
          { completado: true, score: 8 }, { completado: true, score: 7  },
          { completado: true, score: 9 }, { completado: false, score: null },
        ],
        observacionesGuardadas: "Docente puntual, buen manejo del tiempo.",
      },
      {
        id: 104, numero: 4, fecha: "28 febrero - 2026", materia: "Programación web",
        punteo: 9.1, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 1038462",
        color: "#F5C518",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 10}, { completado: true, score: 9 },
        ],
        observacionesGuardadas: "Clase dinámica con participación activa del estudiantado.",
      },
    ],
  },
  {
    id: 2,
    nombre: "Carlos Mendoza López",
    iniciales: "CM",
    departamento: "Ciencias de la Computación",
    tipo: "Tiempo Parcial",
    semestres: [{ id: "s1-2024", label: "Semestre I - 2024", calificacion: 8.7, nivel: "Excelente", cursos: [] }],
    visitas: [],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function nivelColor(nivel) {
  if (nivel === "Excelente") return "#4ade80";
  if (nivel === "Bueno")     return "#facc15";
  return "#f87171";
}
function punteoPromedio(visitas) {
  if (!visitas.length) return null;
  return (visitas.reduce((a, v) => a + v.punteo, 0) / visitas.length).toFixed(1);
}

// ── Vistas ─────────────────────────────────────────────────────────────────────
const V = {
  HUB: "HUB",
  HISTORICO: "HISTORICO",
  DETALLE: "DETALLE",
  CHECKLIST_RESULTADOS: "CHECKLIST_RESULTADOS",
  VISITA_DETALLE: "VISITA_DETALLE",   // ← vista read-only de la visita guardada
};

// ── Principal ──────────────────────────────────────────────────────────────────
export default function Docentes() {
  const [docentes, setDocentes]     = useState(MOCK_DOCENTES);
  const [view, setView]             = useState(V.HUB);
  const [docenteId, setDocenteId]   = useState(null);
  const [selectedSem, setSem]       = useState(null);
  const [selectedCurso, setCurso]   = useState(null);
  const [selectedVisitaId, setVisitaId] = useState(null);

  const docente = docentes.find((d) => d.id === docenteId) ?? null;
  const visita  = docente?.visitas.find((v) => v.id === selectedVisitaId) ?? null;

  // ── Visita detalle (read-only) ─────────────────────────────────────────────
  if (view === V.VISITA_DETALLE && visita && docente) {
    return (
      <VisitaDetalle
        docente={docente}
        visita={visita}
        onBack={() => { setView(V.CHECKLIST_RESULTADOS); setVisitaId(null); }}
      />
    );
  }

  // ── Checklist resultados ───────────────────────────────────────────────────
  if (view === V.CHECKLIST_RESULTADOS && docente) {
    return (
      <ChecklistResultados
        docente={docente}
        visitas={docente.visitas}
        onBack={() => setView(V.HISTORICO)}
        onVerDetalle={(v) => { setVisitaId(v.id); setView(V.VISITA_DETALLE); }}
      />
    );
  }

  // ── Detalle de curso ───────────────────────────────────────────────────────
  if (view === V.DETALLE && selectedCurso) {
    return (
      <DocenteDetalle
        docente={docente}
        semestre={selectedSem}
        curso={selectedCurso}
        onBack={() => setView(V.HISTORICO)}
      />
    );
  }

  // ── Histórico ──────────────────────────────────────────────────────────────
  if (view === V.HISTORICO && docente) {
    return (
      <DocenteHistorico
        docente={docente}
        onBack={() => setView(V.HUB)}
        onVerDetalle={(sem, curso) => { setSem(sem); setCurso(curso); setView(V.DETALLE); }}
        onVerChecklist={() => setView(V.CHECKLIST_RESULTADOS)}
      />
    );
  }

  // ── HUB ───────────────────────────────────────────────────────────────────
  return (
    <div className="docentes-hub">
      <style>{hubStyles}</style>
      <div className="hub-header">
        <h1>Docentes</h1>
        <p>Selecciona un docente para ver su perfil, histórico y visitas de checklist</p>
      </div>

      <div className="hub-grid">
        {docentes.map((d) => (
          <div key={d.id} className="hub-block">
            {/* Card clickeable */}
            <div
              className="docente-card"
              onClick={() => { setDocenteId(d.id); setView(V.HISTORICO); }}
            >
              <div className="dc-avatar">{d.iniciales}</div>
              <div className="dc-info">
                <span className="dc-nombre">{d.nombre}</span>
                <span className="dc-dept">{d.departamento} · {d.tipo}</span>
              </div>
              {d.semestres.length > 0 && (
                <div className="dc-badge" style={{ color: nivelColor(d.semestres[d.semestres.length - 1].nivel) }}>
                  {d.semestres[d.semestres.length - 1].calificacion.toFixed(1)}
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="hub-meta">
              <span>{d.semestres.length} semestres</span>
              <span>·</span>
              <span>{d.visitas.length} visitas</span>
              {d.visitas.length > 0 && (
                <><span>·</span>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                  Prom. {punteoPromedio(d.visitas)}
                </span></>
              )}
            </div>

            {/* Botones */}
            <div className="hub-actions">
              <button className="hub-btn primary"
                onClick={() => { setDocenteId(d.id); setView(V.HISTORICO); }}>
                📊 Histórico
              </button>
              <button className="hub-btn secondary"
                onClick={() => { setDocenteId(d.id); setView(V.CHECKLIST_RESULTADOS); }}>
                ✅ Visitas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const hubStyles = `
  .docentes-hub { padding: 2rem; background: #f1f5f9; min-height: 100%; }
  .hub-header { margin-bottom: 2rem; }
  .hub-header h1 { font-size: 1.8rem; font-weight: 700; color: #0f1f3d; margin: 0 0 .25rem; }
  .hub-header p  { color: #64748b; margin: 0; font-size: .95rem; }
  .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
  .hub-block { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); border: 1px solid #e2e8f0; }
  .docente-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.25rem .75rem; cursor: pointer; transition: background .15s; }
  .docente-card:hover { background: #f8fafc; }
  .dc-avatar { width: 48px; height: 48px; background: #0f1f3d; color: #FFD700; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
  .dc-info { flex: 1; display: flex; flex-direction: column; }
  .dc-nombre { font-weight: 700; color: #0f1f3d; font-size: .95rem; }
  .dc-dept   { font-size: .8rem; color: #64748b; margin-top: 2px; }
  .dc-badge  { font-size: 1.5rem; font-weight: 800; }
  .hub-meta { display: flex; gap: .4rem; align-items: center; padding: 0 1.25rem .6rem; font-size: .8rem; color: #94a3b8; }
  .hub-actions { display: flex; gap: .75rem; padding: .75rem 1.25rem 1.25rem; border-top: 1px solid #f1f5f9; }
  .hub-btn { flex: 1; padding: .55rem .75rem; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; border: none; transition: opacity .15s; }
  .hub-btn:hover { opacity: .85; }
  .hub-btn.primary   { background: #0f1f3d; color: #FFD700; }
  .hub-btn.secondary { background: #FFD700; color: #0f1f3d; }
`;