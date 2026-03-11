import { useState, useEffect, useRef } from "react";

// ─── Drag-to-reorder hook ─────────────────────────────────────────────────────
function useDragList(items, setItems) {
  const dragIdx = useRef(null);

  const onDragStart = (idx) => { dragIdx.current = idx; };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    setItems(next);
  };
  const onDragEnd = () => { dragIdx.current = null; };

  return { onDragStart, onDragOver, onDragEnd };
}

// ─── ChecklistForm ────────────────────────────────────────────────────────────
export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(checklist?.nombre || "");
  const [codigoDocente, setCodigoDocente] = useState(checklist?.codigoDocente?.replace("CAT - ", "") || "");
  const [nombreCurso, setNombreCurso] = useState(checklist?.nombreCurso || "");
  const [criterios, setCriterios] = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState("");
  const [errors, setErrors] = useState({});

  const { onDragStart, onDragOver, onDragEnd } = useDragList(criterios, setCriterios);

  const agregarCriterio = () => {
    const trimmed = nuevoCriterio.trim();
    if (!trimmed) return;
    setCriterios(prev => [...prev, trimmed]);
    setNuevoCriterio("");
  };

  const eliminarCriterio = (idx) => {
    setCriterios(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = "El nombre es requerido";
    if (!codigoDocente.trim()) e.codigoDocente = "El código es requerido";
    if (!nombreCurso.trim()) e.nombreCurso = "El nombre del curso es requerido";
    return e;
  };

  const handleGuardar = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onGuardar({
      nombre: nombre.trim(),
      codigoDocente: codigoDocente.trim(),
      nombreCurso: nombreCurso.trim(),
      criteriosList: criterios,
      criterios: criterios.length,
      docente: "Nombre del docente",
    });
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancelar(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const inputStyle = (field) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#d1d5db"}`,
    fontSize: 14,
    color: "#1a2744",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  return (
    /* Overlay */
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(26,39,68,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancelar(); }}
    >
      {/* Modal */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "36px 40px",
        width: "100%",
        maxWidth: 680,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        border: "2px solid #F5C518",
      }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#1a2744" }}>
          {checklist ? "Editar Checklist" : "Crear Nueva Checklist"}
        </h2>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6b7280" }}>
          Define el nombre y agrega los criterios de evaluacion que se usaran durante la visita de clase
        </p>

        {/* Fields Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Nombre de la Checklist
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Observacion Metodologica"
              style={inputStyle("nombre")}
              onFocus={e => e.target.style.borderColor = "#F5C518"}
              onBlur={e => e.target.style.borderColor = errors.nombre ? "#ef4444" : "#d1d5db"}
            />
            {errors.nombre && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.nombre}</span>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Codigo Docente
            </label>
            <input
              value={codigoDocente}
              onChange={e => setCodigoDocente(e.target.value)}
              placeholder="Ej. 1037492"
              style={inputStyle("codigoDocente")}
              onFocus={e => e.target.style.borderColor = "#F5C518"}
              onBlur={e => e.target.style.borderColor = errors.codigoDocente ? "#ef4444" : "#d1d5db"}
            />
            {errors.codigoDocente && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.codigoDocente}</span>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Nombre del Curso
            </label>
            <input
              value={nombreCurso}
              onChange={e => setNombreCurso(e.target.value)}
              placeholder="Ej. Progra web"
              style={inputStyle("nombreCurso")}
              onFocus={e => e.target.style.borderColor = "#F5C518"}
              onBlur={e => e.target.style.borderColor = errors.nombreCurso ? "#ef4444" : "#d1d5db"}
            />
            {errors.nombreCurso && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.nombreCurso}</span>}
          </div>
        </div>

        {/* Criterios */}
        <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Criterios de Evaluacion (arrastra para reordenar):
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, minHeight: 48 }}>
          {criterios.map((criterio, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              style={{
                background: "#1a2744",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "grab",
                userSelect: "none",
                transition: "opacity 0.2s",
              }}
            >
              {criterio}
              <button
                onClick={() => eliminarCriterio(idx)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              >
                ×
              </button>
            </div>
          ))}

          {/* Agregar criterio inline */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={nuevoCriterio}
              onChange={e => setNuevoCriterio(e.target.value)}
              onKeyDown={e => e.key === "Enter" && agregarCriterio()}
              placeholder="Nuevo criterio..."
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1.5px dashed #d1d5db",
                fontSize: 13,
                color: "#1a2744",
                outline: "none",
                width: 180,
              }}
              onFocus={e => e.target.style.borderColor = "#F5C518"}
              onBlur={e => e.target.style.borderColor = "#d1d5db"}
            />
            <button
              onClick={agregarCriterio}
              style={{
                background: "none",
                border: "1.5px solid #F5C518",
                borderRadius: 6,
                color: "#1a2744",
                padding: "7px 14px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#FFF9E0"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              + Agregar criterio
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button
            onClick={handleGuardar}
            style={{
              background: "#F5C518",
              color: "#1a2744",
              border: "none",
              borderRadius: 6,
              padding: "12px 28px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e6b800"}
            onMouseLeave={e => e.currentTarget.style.background = "#F5C518"}
          >
            Guardar Checklist
          </button>
          <button
            onClick={onCancelar}
            style={{
              background: "none",
              color: "#6b7280",
              border: "1.5px solid #d1d5db",
              borderRadius: 6,
              padding: "12px 24px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.color = "#1a2744"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#6b7280"; }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}