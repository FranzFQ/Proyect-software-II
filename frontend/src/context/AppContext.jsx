// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';
import { 
  listaDocentesGlobal, 
  listaCoordinadores, 
  listaSemestres 
} from '../utils/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ESTADO DEL USUARIO ACTUAL (Inicia en null hasta que haga login)
  const [currentUser, setCurrentUser] = useState(null);

  // Estados Globales de la App
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState(listaSemestres);
  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");

  // Porcentajes actualizados desde develop
  const [ponderaciones, setPonderaciones] = useState({
    estudiantil: 30, 
    ceat: 20, 
    autoevaluacion: 10, 
    coordinador: 20, 
    visitas: 10, 
    apoyo: 10
  });

  // Lista de documentos actualizada con Pensum y Nómina desde develop
  const [documentos, setDocumentos] = useState([
    { id: 'pensum',        titulo: 'Carga de Pensum',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'nomina',        titulo: 'Carga de Nómina',          estado: 'pendiente', nombreArchivo: '' },
    { id: 'estudiantil',   titulo: 'Evaluación Estudiantil',   estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion',titulo: 'Autoevaluaciones',         estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador',   titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat',          titulo: 'Evaluaciones CEAT',        estado: 'pendiente', nombreArchivo: '' },
    { id: 'apoyo',         titulo: 'Apoyo y Colaboración',     estado: 'pendiente', nombreArchivo: '' }
  ]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, // Proveemos el usuario a toda la app
      docentes, setDocentes,
      coordinadores, setCoordinadores,
      semestres, setSemestres,
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas
    }}>
      {children}
    </AppContext.Provider>
  );
};