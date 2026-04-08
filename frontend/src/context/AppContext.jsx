// src/context/AppContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import { listaDocentesGlobal, listaCoordinadores, listaSemestres } from '../utils/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // SIMULAMOS EL USUARIO LOGUEADO (Si cambias 'rol' a 'Coordinador', el menú desaparecerá)
  const [currentUser, setCurrentUser] = useState({
    nombre: "Juan Rodríguez", iniciales: "JR", rol: "Administrador" 
  });

  const [ponderaciones, setPonderaciones] = useState({ estudiantil: 30, ceat: 20, autoevaluacion: 10, coordinador: 20, visitas: 10, apoyo: 10 });
  const [documentos, setDocumentos] = useState([
    { id: 'estudiantil', titulo: 'Evaluación Estudiantil', estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion', titulo: 'Autoevaluaciones', estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador', titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat', titulo: 'Evaluaciones CEAT', estado: 'pendiente', nombreArchivo: '' }, 
    { id: 'apoyo', titulo: 'Apoyo y Colaboración', estado: 'pendiente', nombreArchivo: '' },
  ]);
  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  
  // NUEVO: Estado para Semestres
  const [semestres, setSemestres] = useState(listaSemestres);

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser,
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas,
      docentes, setDocentes,
      coordinadores, setCoordinadores,
      semestres, setSemestres
    }}>
      {children}
    </AppContext.Provider>
  );
};