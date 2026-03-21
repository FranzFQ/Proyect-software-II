export default function DocenteDetalle({ docente, semestre, curso, onBack }) {
  const maxVal = 10;

  return (
    <div className="dd-container">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <div className="dd-breadcrumb">
        <button onClick={onBack} className="dd-back-link">← Docentes</button>
        <span className="dd-sep">/</span>
        <span className="dd-crumb"
          style={{ cursor: "pointer", color: "#3b82f6" }}
          onClick={onBack}
        >
          {docente.nombre.split(" ")[0]} {docente.nombre.split(" ")[1]}
        </span>
        <span className="dd-sep">/</span>
        <span className="dd-crumb">{curso.codigo}</span>
      </div>

      {/* Header docente */}
      <div className="dd-header-card">
        <div className="dd-avatar">{docente.iniciales}</div>
        <div className="dd-info">
          <h1 className="dd-nombre">{docente.nombre}</h1>
          <p className="dd-dept">
            {docente.departamento} · <strong>{docente.tipo}</strong>
          </p>
          <span className="dd-creditos">Créditos: {curso.creditos}</span>
        </div>
        <div className="dd-score-box">
          <span className="dd-score-num">{curso.punteoFinal.toFixed(1)}</span>
          <span className="dd-score-label">Punteo final</span>
        </div>
      </div>

      <div className="dd-body">
        {/* Ponderaciones */}
        <div className="dd-ponderaciones-card">
          <h2 className="dd-section-title">
            <span className="dd-icon">📊</span>
            Ponderaciones {curso.nombre}
          </h2>
          <div className="dd-bars">
            {curso.ponderaciones.map((p) => (
              <div key={p.nombre} className="dd-bar-row">
                <span className="dd-bar-label">{p.nombre}</span>
                <div className="dd-bar-track">
                  <div
                    className="dd-bar-fill"
                    style={{
                      width: `${(p.valor / maxVal) * 100}%`,
                      background: p.color === "#FFD700" ? "#FFD700" : "#0f1f3d",
                    }}
                  />
                </div>
                <span className="dd-bar-val">{p.valor.toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* Sugerencias */}
          <div style={{ marginTop: "1.5rem" }}>
            <h3 className="dd-sub-title">
              <span className="dd-icon">💬</span> Sugerencias
            </h3>
            {curso.sugerencias.map((s, i) => (
              <div key={i} className="dd-sugerencia-box">
                "{s}"
              </div>
            ))}
          </div>
        </div>

        {/* Comentarios */}
        <div className="dd-comentarios-card">
          <h2 className="dd-section-title">
            <span className="dd-icon">💬</span> comentarios
          </h2>
          <div className="dd-comentarios-list">
            {curso.comentarios.map((c, i) => (
              <div
                key={i}
                className={`dd-comentario ${i === 0 ? "dd-comentario--highlighted" : ""}`}
              >
                "{c}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
  .dd-container {
    padding: 1.5rem 2rem;
    background: #f1f5f9;
    min-height: 100%;
  }
  .dd-breadcrumb {
    display: flex; align-items: center; gap: .5rem;
    margin-bottom: 1.25rem; font-size: .85rem;
  }
  .dd-back-link {
    background: none; border: none;
    color: #3b82f6; cursor: pointer;
    font-size: .85rem; padding: 0;
  }
  .dd-back-link:hover { text-decoration: underline; }
  .dd-sep { color: #94a3b8; }
  .dd-crumb { color: #64748b; }

  /* Header card */
  .dd-header-card {
    background: #0f1f3d;
    border-radius: 14px;
    padding: 1.5rem 2rem;
    display: flex; align-items: center; gap: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 14px rgba(0,0,0,.18);
  }
  .dd-avatar {
    width: 64px; height: 64px;
    background: #FFD700;
    color: #0f1f3d;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.3rem;
    flex-shrink: 0;
  }
  .dd-info { flex: 1; }
  .dd-nombre {
    font-size: 1.4rem; font-weight: 800;
    color: #fff; margin: 0 0 .25rem;
  }
  .dd-dept {
    color: #FFD700; font-size: .9rem; margin: 0 0 .5rem;
  }
  .dd-creditos {
    display: inline-block;
    background: #FFD700; color: #0f1f3d;
    padding: .2rem .75rem;
    border-radius: 20px;
    font-size: .8rem; font-weight: 700;
  }
  .dd-score-box {
    border: 3px solid #FFD700;
    border-radius: 12px;
    padding: .75rem 1.25rem;
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0;
  }
  .dd-score-num {
    font-size: 2.2rem; font-weight: 900; color: #FFD700; line-height: 1;
  }
  .dd-score-label { color: #94a3b8; font-size: .75rem; margin-top: 2px; }

  /* Body grid */
  .dd-body {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.25rem;
  }
  @media (max-width: 768px) {
    .dd-body { grid-template-columns: 1fr; }
  }

  .dd-ponderaciones-card,
  .dd-comentarios-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.07);
  }

  .dd-section-title {
    font-size: 1rem; font-weight: 700;
    color: #0f1f3d; margin: 0 0 1.25rem;
    display: flex; align-items: center; gap: .4rem;
  }
  .dd-sub-title {
    font-size: .9rem; font-weight: 700;
    color: #0f1f3d; margin: 0 0 .75rem;
    display: flex; align-items: center; gap: .4rem;
  }
  .dd-icon { font-size: 1rem; }

  /* Bars */
  .dd-bars { display: flex; flex-direction: column; gap: .85rem; }
  .dd-bar-row {
    display: flex; align-items: center; gap: .75rem;
  }
  .dd-bar-label {
    width: 145px; font-size: .85rem; color: #374151;
    flex-shrink: 0; text-align: right;
  }
  .dd-bar-track {
    flex: 1; height: 22px;
    background: #f1f5f9;
    border-radius: 6px; overflow: hidden;
  }
  .dd-bar-fill {
    height: 100%; border-radius: 6px;
    transition: width .4s ease;
  }
  .dd-bar-val {
    width: 28px; font-size: .9rem;
    font-weight: 700; color: #0f1f3d; text-align: right;
  }

  /* Sugerencias */
  .dd-sugerencia-box {
    background: #fefce8;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: .75rem 1rem;
    font-size: .88rem;
    color: #713f12;
    font-style: italic;
  }

  /* Comentarios */
  .dd-comentarios-list {
    display: flex; flex-direction: column; gap: .75rem;
  }
  .dd-comentario {
    padding: .75rem 1rem;
    border-radius: 8px;
    font-size: .87rem;
    color: #374151;
    background: #f8fafc;
    font-style: italic;
  }
  .dd-comentario--highlighted {
    background: #fefce8;
    border: 1px solid #fde68a;
  }
`;