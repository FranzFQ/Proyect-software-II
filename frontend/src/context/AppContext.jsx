// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getSavedUser } from '../services/auth_service';

// 🔥 MOCK DATA (tu archivo actual)
import {
  listaDocentesGlobal,
  listaCoordinadores,
  listaSemestres
} from '../utils/mockData';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  // ─── USUARIO (LOGIN) ─────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());

  // ─── DATOS PRINCIPALES (MOCK) ────────────────────
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState(listaSemestres);

  // ─── CONFIGURACIÓN ───────────────────────────────
  const [ponderaciones, setPonderaciones] = useState({
    estudiantil: 30,
    ceat: 20,
    autoevaluacion: 10,
    coordinador: 20,
    visitas: 10,
    apoyo: 10
  });

  const [documentos, setDocumentos] = useState([
    { id: 'pensum', titulo: 'Carga de Pensum', estado: 'pendiente', nombreArchivo: '' },
    { id: 'nomina', titulo: 'Carga de Nómina', estado: 'pendiente', nombreArchivo: '' },
    { id: 'estudiantil', titulo: 'Evaluación Estudiantil', estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion', titulo: 'Autoevaluaciones', estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador', titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat', titulo: 'Evaluaciones CEAT', estado: 'pendiente', nombreArchivo: '' },
    { id: 'apoyo', titulo: 'Apoyo y Colaboración', estado: 'pendiente', nombreArchivo: '' },
  ]);

  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");

  // ─── LÓGICA ORIGINAL (VISITAS) ───────────────────
  const guardarVisitaEnDocente = (docenteId, visita) => {
    setDocentes((prev) =>
      prev.map((d) => {
        if (String(d.id) !== String(docenteId)) return d;

        const visitasActuales = d.visitas || [];
        const existe = visitasActuales.find((v) => v.id === visita.id);

        const nuevasVisitas = existe
          ? visitasActuales.map((v) => (v.id === visita.id ? visita : v))
          : [...visitasActuales, visita];

        return { ...d, visitas: nuevasVisitas };
      })
    );
  };

  // ─── SESSION STORAGE ─────────────────────────────
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('auth_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
    }
  }, [currentUser]);

  // ─── CONTEXTO GLOBAL ─────────────────────────────
  const contextValue = {
    // Usuario
    currentUser,
    setCurrentUser,

    // Datos
    docentes,
    setDocentes,

    coordinadores,
    setCoordinadores,

    semestres,
    setSemestres,

    // Configuración
    ponderaciones,
    setPonderaciones,

    documentos,
    setDocumentos,

    evaluacionesCompletadas,
    setEvaluacionesCompletadas,

    // Funciones
    guardarVisitaEnDocente,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};