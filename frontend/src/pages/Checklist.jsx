import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ChecklistForm from '../components/checklist/ChecklistForm';
import ChecklistEjecucion from '../components/checklist/ChecklistEjecucion';
import Button from '../components/common/Button';
import { API_URL } from '../services/global_URL';

function colorDePunteo(score) {
  if (score >= 9) return '#22c55e';
  if (score >= 7) return '#f97316';
  if (score >  0) return '#ef4444';
  return '#F5C518';
}

function ScoreBar({ punteo, color }) {
  const pct = Math.min((punteo / 10) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ChecklistCard({ checklist, onEditar, onEjecutar }) {
  const color = colorDePunteo(checklist.punteo);
  const scoreColor =
    checklist.punteo >= 9 ? 'text-green-600' :
    checklist.punteo >= 7 ? 'text-orange-500' : 'text-red-500';

  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3 border border-gray-200 border-t-4 cursor-pointer"
      style={{ borderTopColor: color }}
      onClick={() => onEjecutar(checklist)}
    >
      <div>
        <h3 className="font-bold text-url-blue text-base">{checklist.nombre}</h3>
        <p className="text-sm text-gray-500">Docente: {checklist.docente}</p>
        {checklist.nombreCurso && (
          <p className="text-xs text-gray-400">Curso: {checklist.nombreCurso}</p>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{checklist.criterios} criterios</span>
        <span>
          Punteo de visita{' '}
          <strong className={`${checklist.punteo > 0 ? scoreColor : 'text-gray-400'} text-base`}>
            {checklist.punteo > 0 ? checklist.punteo : '—'}
          </strong>
        </span>
      </div>

      <ScoreBar punteo={checklist.punteo} color={color} />

      <div className="flex justify-between items-center pt-1">
        <span className="bg-url-blue text-white text-xs px-3 py-1 rounded font-semibold">
          {checklist.codigoDocente}
        </span>
        <Button
          variant="secondary"
          onClick={(e) => { e.stopPropagation(); onEditar(checklist); }}
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

function normalizeChecklist(raw) {
  const datos = raw.datos ?? {};
  const punteo_final = parseFloat(datos.punteo_final ?? 0);

  const completadas = (datos.evaluaciones ?? []).filter(e => e.completado && e.score !== null);
  const punteo = completadas.length
    ? parseFloat((completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1))
    : punteo_final;

  return {
    id:           raw.id,
    cursoDadoId:  raw.curso_dado,
    nombre:       raw.titulo,
    docente:      raw.DocenteNombre ?? datos.docente ?? '',
    docenteId:    datos.docenteId ?? null,
    codigoDocente:datos.codigoDocente ?? raw.CursoDadoStr ?? '',
    nombreCurso:  datos.nombreCurso ?? '',
    seccion:      datos.seccion ?? '',
    criterios:    (datos.criteriosList ?? []).length,
    criteriosList:datos.criteriosList ?? [],
    punteo,
    datos,
  };
}

export default function Checklist() {
  const { currentUser } = useContext(AppContext);

  const [checklists,          setChecklists]          = useState([]);
  const [semestre,            setSemestre]            = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [showForm,            setShowForm]            = useState(false);
  const [editingChecklist,    setEditingChecklist]    = useState(null);
  const [ejecutandoChecklist, setEjecutandoChecklist] = useState(null);
  const [modoEdicion,         setModoEdicion]         = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [checklistsRes, semRes] = await Promise.all([
          fetch(`${API_URL}evaluaciones/checklists/`),
          fetch(`${API_URL}academico/semestres/?activo_para_carga=true`),
        ]);
        if (checklistsRes.ok) {
          const data = await checklistsRes.json();
          const list = Array.isArray(data) ? data : data.results ?? [];
          setChecklists(list.map(normalizeChecklist));
        }
        if (semRes.ok) {
          const semData = await semRes.json();
          const semList = Array.isArray(semData) ? semData : semData.results ?? [];
          setSemestre(semList[0] ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNuevaChecklist = () => { setEditingChecklist(null); setShowForm(true); };

  const handleEditar = (checklist) => {
    setEditingChecklist(checklist);
    setModoEdicion(true);
    setEjecutandoChecklist(checklist);
  };

  const handleEjecutar = (checklist) => {
    setModoEdicion(false);
    setEjecutandoChecklist(checklist);
  };

  const handleGuardarChecklist = async (data) => {
    const payload = {
      curso_dado: data.cursoDadoId,
      titulo:     data.nombre,
      usuario:    currentUser?.id ?? null,
      datos: {
        docente:      data.docente,
        docenteId:    data.docenteId,
        codigoDocente:data.codigoDocente,
        nombreCurso:  data.nombreCurso,
        seccion:      data.seccion,
        criteriosList:data.criteriosList,
        punteo_final: 0,
      },
    };
    try {
      let res;
      if (editingChecklist) {
        res = await fetch(`${API_URL}evaluaciones/checklists/${editingChecklist.id}/`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}evaluaciones/checklists/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        const saved = normalizeChecklist(await res.json());
        if (editingChecklist) {
          setChecklists(prev => prev.map(c => c.id === saved.id ? saved : c));
          setShowForm(false);
          setEditingChecklist(null);
        } else {
          setChecklists(prev => [...prev, saved]);
          setShowForm(false);
          setEditingChecklist(null);
          setModoEdicion(false);
          setEjecutandoChecklist(saved);
          return;
        }
      }
    } catch (e) {
      console.error('Error guardando checklist:', e);
    }
    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleGuardarEjecucion = async (resultado) => {
    const { criteriosList, evaluaciones, observaciones } = resultado;

    const completadas = evaluaciones.filter(e => e.completado && e.score !== null);
    const punteoCalculado = completadas.length
      ? parseFloat((completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1))
      : ejecutandoChecklist.punteo;

    const datosPatch = {
      datos: {
        ...(ejecutandoChecklist.datos ?? {}),
        criteriosList,
        evaluaciones,
        observaciones,
        punteo_final: punteoCalculado,
      },
    };

    try {
      const res = await fetch(`${API_URL}evaluaciones/checklists/${ejecutandoChecklist.id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datosPatch),
      });
      if (res.ok) {
        const saved = normalizeChecklist(await res.json());
        setChecklists(prev => prev.map(c => c.id === saved.id ? saved : c));
      } else {
        setChecklists(prev => prev.map(c =>
          c.id === ejecutandoChecklist.id
            ? { ...c, criteriosList, criterios: criteriosList.length, punteo: punteoCalculado }
            : c
        ));
      }
    } catch {
      setChecklists(prev => prev.map(c =>
        c.id === ejecutandoChecklist.id
          ? { ...c, criteriosList, criterios: criteriosList.length, punteo: punteoCalculado }
          : c
      ));
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

  const semLabel = semestre ? `${semestre.anio} - Ciclo ${semestre.ciclo}` : '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Checklists</h1>
          <p className="text-gray-500">
            {semLabel} · <strong>{checklists.length} registrados</strong>
          </p>
        </div>
        <Button variant="primary" onClick={handleNuevaChecklist}>
          + Nueva Checklist
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : checklists.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm">
          <p className="font-semibold mb-1">No hay checklists registrados</p>
          <p className="text-sm">Crea una nueva checklist para comenzar.</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {checklists.map(checklist => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onEditar={handleEditar}
              onEjecutar={handleEjecutar}
            />
          ))}
        </div>
      )}

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