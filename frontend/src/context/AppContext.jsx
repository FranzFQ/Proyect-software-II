// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';
import { listaDocentesGlobal, listaCoordinadores} from '../utils/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Estado de Ponderaciones
  const [ponderaciones, setPonderaciones] = useState({
    estudiantil: 30,
    ceat: 20,
    autoevaluacion: 10,
    coordinador: 20,
    visitas: 10,
    apoyo: 10,
  });

  // 2. Estado de Archivos Cargados
  const [documentos, setDocumentos] = useState([
    { id: 'estudiantil', titulo: 'Evaluación Estudiantil', estado: 'pendiente', nombreArchivo: '' },
    { id: 'autoevaluacion', titulo: 'Autoevaluaciones', estado: 'pendiente', nombreArchivo: '' },
    { id: 'coordinador', titulo: 'Criterios de Coordinador', estado: 'pendiente', nombreArchivo: '' },
    { id: 'ceat', titulo: 'Evaluaciones CEAT', estado: 'pendiente', nombreArchivo: '' }, 
    { id: 'apoyo', titulo: 'Apoyo y Colaboración', estado: 'pendiente', nombreArchivo: '' },
  ]);

  // 3. Estado del Porcentaje de Evaluación (para el Dashboard)
  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");

  // 4. Estado de los Docentes (Lista Global)
  const [docentes, setDocentes] = useState(listaDocentesGlobal);

  // 5. Estado de los Coordinadores (Lista Global)
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);

  return (
    <AppContext.Provider value={{ 
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas,
      docentes, setDocentes,
      coordinadores, setCoordinadores
    }}>
      {children}
    </AppContext.Provider>
  );
};