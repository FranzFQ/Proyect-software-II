// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getSavedUser } from '../services/auth_service';
import { getPonderaciones, PONDERACIONES_DEFAULT } from '../services/ponderacion_service';
import { getDocentes } from '../services/docente_service';

import { listaCoordinadores, listaSemestres } from '../utils/mockData';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());

  // Docentes: cargados del backend
  const [docentes,      setDocentes]      = useState([]);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres,     setSemestres]     = useState(listaSemestres);

  // Ponderaciones del backend
  const [ponderaciones,     setPonderaciones]     = useState({ ...PONDERACIONES_DEFAULT });
  const [ponderacionesMeta, setPonderacionesMeta] = useState({});
  // Label del semestre activo para Dashboard y otros
  const [semestreActivo,    setSemestreActivo]    = useState('—');

  const [documentos, setDocumentos] = useState([
    { id: 'pensum',         titulo: 'Carga de Pensum',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'nomina',         titulo: 'Carga de Nómina',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'estudiantil',    titulo: 'Evaluación Estudiantil',   estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion', titulo: 'Autoevaluaciones',         estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador',    titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat',           titulo: 'Evaluaciones CEAT',        estado: 'pendiente', nombreArchivo: '' },
    { id: 'apoyo',          titulo: 'Apoyo y Colaboración',     estado: 'pendiente', nombreArchivo: '' },
  ]);
  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState('0%');

  // Al iniciar sesión: cargar ponderaciones Y docentes del backend
  useEffect(() => {
    if (!currentUser) return;

    // Ponderaciones + semestre activo
    getPonderaciones()
      .then(({ values, meta, semestre }) => {
        setPonderaciones(values);
        setPonderacionesMeta(meta);
        if (semestre) {
          setSemestreActivo(`${semestre.anio} - Ciclo ${semestre.ciclo}`);
        }
      })
      .catch(e => console.error('Error cargando ponderaciones:', e));

    // Docentes para Dashboard (primeros 4 + totales)
    getDocentes({ limit: 4 })
      .then(data => {
        const lista = Array.isArray(data) ? data : data.results ?? [];
        // Normalizar para que Dashboard los muestre igual que antes
        const normalizados = lista.map(d => ({
          id:          d.id,
          nombre:      d.nombre_completo,
          iniciales:   d.nombre_completo?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?',
          facultad:    d.FacultadNombre ?? '—',
          ponderacion: d.promedio_punteo != null ? parseFloat(d.promedio_punteo).toFixed(1) : null,
          estado:      clasificarEstado(d.promedio_punteo),
        }));
        setDocentes(normalizados);
      })
      .catch(e => console.error('Error cargando docentes:', e));
  }, [currentUser]);

  // Al cerrar sesión: limpiar todo
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('auth_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      setPonderaciones({ ...PONDERACIONES_DEFAULT });
      setPonderacionesMeta({});
      setSemestreActivo('—');
      setDocentes([]);
    }
  }, [currentUser]);

  const guardarVisitaEnDocente = (docenteId, visita) => {
    setDocentes(prev =>
      prev.map(d => {
        if (String(d.id) !== String(docenteId)) return d;
        const visitasActuales = d.visitas || [];
        const existe = visitasActuales.find(v => v.id === visita.id);
        const nuevasVisitas = existe
          ? visitasActuales.map(v => (v.id === visita.id ? visita : v))
          : [...visitasActuales, visita];
        return { ...d, visitas: nuevasVisitas };
      })
    );
  };

  const contextValue = {
    currentUser, setCurrentUser,
    docentes, setDocentes,
    coordinadores, setCoordinadores,
    semestres, setSemestres,
    ponderaciones, setPonderaciones,
    ponderacionesMeta, setPonderacionesMeta,
    semestreActivo, setSemestreActivo,
    documentos, setDocumentos,
    evaluacionesCompletadas, setEvaluacionesCompletadas,
    guardarVisitaEnDocente,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Helper local — clasifica estado por promedio
function clasificarEstado(promedio) {
  if (promedio == null) return 'Sin datos';
  const p = parseFloat(promedio);
  if (p >= 8) return 'Excelente';
  if (p >= 6) return 'Buena';
  return 'Deficiente';
}