// src/context/AppContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import { listaDocentesGlobal, listaCoordinadores, listaSemestres } from '../utils/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    nombre: "Juan Rodríguez", iniciales: "JR", rol: "Administrador"
  });

  const [ponderaciones, setPonderaciones] = useState({
    estudiantil: 30, ceat: 20, autoevaluacion: 10, coordinador: 20, visitas: 10, apoyo: 10
  });

  const [documentos, setDocumentos] = useState([
    { id: 'pensum',        titulo: 'Carga de Pensum',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'nomina',        titulo: 'Carga de Nómina',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'estudiantil',   titulo: 'Evaluación Estudiantil',   estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion',titulo: 'Autoevaluaciones',         estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador',   titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat',          titulo: 'Evaluaciones CEAT',        estado: 'pendiente', nombreArchivo: '' },
    { id: 'apoyo',         titulo: 'Apoyo y Colaboración',     estado: 'pendiente', nombreArchivo: '' },
  ]);

  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState(listaSemestres);

  // Agrega o actualiza una visita en el docente correspondiente
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

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas,
      docentes, setDocentes,
      coordinadores, setCoordinadores,
      semestres, setSemestres,
      guardarVisitaEnDocente,
    }}>
      {children}
    </AppContext.Provider>
  );
};
