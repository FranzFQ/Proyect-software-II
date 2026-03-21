import { useState } from "react";

export default function DocenteHistorico({ docente, onBack, onVerDetalle, onVerChecklist }) {
  const [filtro, setFiltro] = useState("");
  const [nivelActivo, setNivelActivo] = useState(null);

  const niveles = ["Deficiente", "Buena", "Excelente"];

  const semestresFiltrados = docente.semestres.filter((s) => {
    const matchTexto = filtro === "" ||
      s.label.toLowerCase().includes(filtro.toLowerCase()) ||
      s.calificacion.toString().includes(filtro);
    const matchNivel = nivelActivo === null || s.nivel === nivelActivo;
    return matchTexto && matchNivel;
  });

  function colorBorde(nivel) {
    if (nivel === "Excelente") return "#FFD700";
    if (nivel === "Bueno")     return "#ef4444";
    if (nivel === "Regular")   return "#fb923c";
    return "#6b7280";
  }

  return (
    <div className="dh-container">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <div className="dh-breadcrumb">
        <button onClick={onBack} className="dh-back-link">← Docentes</button>
        <span className="dh-sep">/</span>
        <span className="dh-crumb">{docente.nombre.split(" ")[0]} {docente.nombre.split(" ")[1]}</span>
      </div>

      <div className="dh-title-row">
        <div>
          <h1 className="dh-title">Histórico</h1>
          <p className="dh-subtitle">{docente.nombre}</p>
        </div>
        <button className="dh-checklist-btn" onClick={onVerChecklist}>
          Ver Checklists
        </button>
      </div>

      {/* Filtros */}
      <div className="dh-filters">
        <input
          className="dh-search"
          placeholder="Búsqueda por año, semestre y puntuación"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button className="dh-filter-btn search-btn" onClick={() => {}}>Buscar</button>
        {niveles.map((n) => (
          <button
            key={n}
            className={`dh-filter-btn nivel-btn nivel-${n.toLowerCase()} ${nivelActivo === n ? "active" : ""}`}
            onClick={() => setNivelActivo(nivelActivo === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Cards de semestres */}
      <div className="dh-semestres-grid">
        {semestresFiltrados.map((sem) => (
          <div
            key={sem.id}
            className="dh-sem-card"
            style={{ borderTop: `4px solid ${colorBorde(sem.nivel)}` }}
          >
            <div className="dh-sem-header">
              <span className="dh-sem-label">{sem.label}</span>
              <span className="dh-sem-nivel">{sem.nivel}</span>
            </div>
            <div className="dh-sem-score">{sem.calificacion.toFixed(1)}</div>
            <div className="dh-sem-footer">
              {sem.cursos.length > 0 ? (
                sem.cursos.map((curso) => (
                  <button
                    key={curso.codigo}
                    className="dh-ver-btn"
                    onClick={() => onVerDetalle(sem, curso)}
                  >
                    Ver Detalles →
                  </button>
                ))
              ) : (
                <span className="dh-sin-cursos">Sin cursos registrados</span>
              )}
            </div>
          </div>
        ))}

        {semestresFiltrados.length === 0 && (
          <p className="dh-empty">No se encontraron semestres con los filtros aplicados.</p>
        )}
      </div>
    </div>
  );
}

const styles = `
  .dh-container {
    padding: 1.5rem 2rem;
    background: #f1f5f9;
    min-height: 100%;
  }
  .dh-breadcrumb {
    display: flex; align-items: center; gap: .5rem;
    margin-bottom: 1rem;
    font-size: .85rem;
  }
  .dh-back-link {
    background: none; border: none;
    color: #3b82f6; cursor: pointer;
    font-size: .85rem; padding: 0;
  }
  .dh-back-link:hover { text-decoration: underline; }
  .dh-sep { color: #94a3b8; }
  .dh-crumb { color: #64748b; }

  .dh-title-row {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .dh-title {
    font-size: 2rem; font-weight: 800;
    color: #0f1f3d; margin: 0;
  }
  .dh-subtitle { color: #64748b; margin: .25rem 0 0; }
  .dh-checklist-btn {
    padding: .55rem 1.1rem;
    background: #FFD700; color: #0f1f3d;
    border: none; border-radius: 8px;
    font-weight: 700; font-size: .85rem;
    cursor: pointer; transition: opacity .15s;
  }
  .dh-checklist-btn:hover { opacity: .85; }

  .dh-filters {
    display: flex; align-items: center; gap: .6rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .dh-search {
    flex: 1; min-width: 200px;
    padding: .5rem .85rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px; font-size: .9rem;
    background: #fff; color: #0f1f3d;
    outline: none;
  }
  .dh-search:focus { border-color: #3b82f6; }
  .dh-filter-btn {
    padding: .45rem 1rem;
    border-radius: 8px;
    font-size: .85rem; font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all .15s;
  }
  .search-btn {
    background: #0f1f3d; color: #fff;
    border-color: #0f1f3d;
  }
  .nivel-deficiente { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
  .nivel-deficiente.active { background: #ef4444; color: #fff; border-color: #ef4444; }
  .nivel-buena { background: #fef9c3; color: #713f12; border-color: #fde68a; }
  .nivel-buena.active { background: #facc15; color: #1a1a1a; border-color: #facc15; }
  .nivel-excelente { background: #dcfce7; color: #14532d; border-color: #86efac; }
  .nivel-excelente.active { background: #22c55e; color: #fff; border-color: #22c55e; }

  .dh-semestres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 1.25rem;
  }
  .dh-sem-card {
    background: #0f1f3d;
    border-radius: 12px;
    padding: 1.25rem 1.5rem 1rem;
    color: #fff;
    display: flex; flex-direction: column;
    gap: .4rem;
    box-shadow: 0 4px 14px rgba(0,0,0,.15);
  }
  .dh-sem-header {
    display: flex; justify-content: space-between; align-items: center;
  }
  .dh-sem-label { font-weight: 700; font-size: .95rem; }
  .dh-sem-nivel { font-size: .8rem; color: #94a3b8; }
  .dh-sem-score {
    font-size: 2.8rem; font-weight: 900;
    color: #FFD700; line-height: 1.1;
  }
  .dh-sem-footer { margin-top: .5rem; }
  .dh-ver-btn {
    background: none; border: none;
    color: #FFD700; font-size: .9rem;
    font-weight: 600; cursor: pointer;
    padding: 0;
    transition: opacity .15s;
  }
  .dh-ver-btn:hover { opacity: .75; }
  .dh-sin-cursos { font-size: .82rem; color: #64748b; }
  .dh-empty { color: #64748b; font-size: .95rem; grid-column: 1/-1; }
`;