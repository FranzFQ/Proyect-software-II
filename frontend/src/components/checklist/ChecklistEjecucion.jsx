import { useState } from "react";

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const bg =
    score === null ? "#e5e7eb"
    : score >= 9 ? "#dcfce7"
    : score >= 7 ? "#fef9c3"
    : "#fee2e2";
  const color =
    score === null ? "#9ca3af"
    : score >= 9 ? "#166534"
    : score >= 7 ? "#854d0e"
    : "#991b1b";

  return (
    <span style={{
      background: bg,
      color: color,
      padding: "5px 14px",
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 14,
      minWidth: 70,
      textAlign: "center",
      display: "inline-block",
      transition: "background 0.3s, color 0.3s",
    }}>
      {score !== null ? `${score} / 10` : "— / 10"}
    </span>
  );
}

// ─── Criterio Row ─────────────────────────────────────────────────────────────
function CriterioRow({ criterio, index, evaluacion, onToggle, onScore }) {
  const { completado, score } = evaluacion;
  const [showSlider, setShowSlider] = useState(false);

  const handleToggle = () => {
    onToggle(index);
    if (!completado) setShowSlider(true);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: "1px solid #f3f4f6",
      background: completado ? "#f0fdf4" : "#fff",
      borderRadius: 6,
      paddingLeft: 12,
      paddingRight: 12,
      marginBottom: 4,
      transition: "background 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: completado ? "none" : "2px solid #d1d5db",
            background: completado ? "#22c55e" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s, border 0.2s",
          }}
        >
          {completado && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        <span style={{
          fontSize: 15,
          fontWeight: completado ? 600 : 400,
          color: completado ? "#166534" : "#4b5563",
          transition: "color 0.2s",
        }}>
          {criterio}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Slider (visible when completed) */}
        {completado && (
          <input
            type="range"
            min={1}
            max={10}
            value={score ?? 5}
            onChange={e => onScore(index, Number(e.target.value))}
            style={{
              width: 100,
              accentColor: "#F5C518",
              cursor: "pointer",
            }}
          />
        )}
        <ScoreBadge score={score} />
      </div>
    </div>
  );
}

// ─── ChecklistEjecucion ───────────────────────────────────────────────────────
export default function ChecklistEjecucion({ checklist, onGuardar, onCancelar }) {
  const initialEval = checklist.criteriosList.map(() => ({ completado: false, score: null }));
  const [evaluaciones, setEvaluaciones] = useState(initialEval);
  const [observaciones, setObservaciones] = useState("");

  const completados = evaluaciones.filter(e => e.completado).length;
  const total = evaluaciones.length;
  const punteoPromedio = completados === 0
    ? 0
    : (evaluaciones.filter(e => e.completado && e.score !== null).reduce((sum, e) => sum + e.score, 0) / completados).toFixed(1);

  const handleToggle = (idx) => {
    setEvaluaciones(prev =>
      prev.map((e, i) =>
        i === idx
          ? { completado: !e.completado, score: !e.completado ? 5 : null }
          : e
      )
    );
  };

  const handleScore = (idx, score) => {
    setEvaluaciones(prev =>
      prev.map((e, i) => i === idx ? { ...e, score } : e)
    );
  };

  const handleGuardar = () => {
    onGuardar({
      checklistId: checklist.id,
      criterios: checklist.criteriosList.map((c, i) => ({
        criterio: c,
        ...evaluaciones[i],
      })),
      observaciones,
      punteoFinal: punteoPromedio,
      fecha: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: "32px 36px", background: "#f4f6fb", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onCancelar} style={{ background: "none", border: "none", color: "#F5C518", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13 }}>
          Checklists
        </button>
        <span>/</span>
        <span>{checklist.nombre}</span>
        <span>/</span>
        <span style={{ color: "#1a2744", fontWeight: 600 }}>Nueva Visita</span>
      </nav>

      {/* Header Card */}
      <div style={{
        background: "#1a2744",
        borderRadius: 10,
        padding: "24px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
      }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
            CURSO: {checklist.nombreCurso?.toUpperCase() || "REDES Y TELECOMUNICACIONES"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#F5C518", fontWeight: 600 }}>
            Salón B-204 · Docente: {checklist.codigoDocente?.replace("CAT - ", "") || "1037492"} ·{" "}
            {new Date().toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#F5C518", lineHeight: 1 }}>
            {completados}/{total}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Criterios
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Criterios */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a2744" }}>
              Criterios de Evaluacion
            </h3>
            <span style={{
              background: completados === total ? "#dcfce7" : "#fef9c3",
              color: completados === total ? "#166534" : "#854d0e",
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
            }}>
              {completados} completados
            </span>
          </div>

          {checklist.criteriosList.map((criterio, idx) => (
            <CriterioRow
              key={idx}
              criterio={criterio}
              index={idx}
              evaluacion={evaluaciones[idx]}
              onToggle={handleToggle}
              onScore={handleScore}
            />
          ))}
        </div>

        {/* Sidebar: Observaciones + Resumen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Observaciones */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1a2744" }}>
              Observaciones generales:
            </h4>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Docente muy bien preparada..."
              rows={6}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1.5px solid #e5e7eb",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#F5C518"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Resumen punteo */}
          {completados > 0 && (
            <div style={{
              background: "#1a2744",
              borderRadius: 10,
              padding: "20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                Punteo promedio
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#F5C518" }}>
                {punteoPromedio}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                basado en {completados} criterio{completados !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Guardar */}
          <button
            onClick={handleGuardar}
            disabled={completados === 0}
            style={{
              background: completados > 0 ? "#F5C518" : "#e5e7eb",
              color: completados > 0 ? "#1a2744" : "#9ca3af",
              border: "none",
              borderRadius: 8,
              padding: "14px",
              fontWeight: 800,
              fontSize: 15,
              cursor: completados > 0 ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              width: "100%",
            }}
            onMouseEnter={e => { if (completados > 0) e.currentTarget.style.background = "#e6b800"; }}
            onMouseLeave={e => { if (completados > 0) e.currentTarget.style.background = "#F5C518"; }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}