// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { listaDocentesGlobal, listaCoordinadores, listaSemestres } from '../utils/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState(listaSemestres);
  
  // NUEVO: Semestres programados por el Admin
  const [semestresProgramados, setSemestresProgramados] = useState([]);

  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

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
    { id: 'comentarios',   titulo: 'Comentarios del Ingeniero',estado: 'pendiente', nombreArchivo: '' }
  ]);

  // Lógica de activación automática por fecha
  useEffect(() => {
    const interval = setInterval(() => {
      const hoy = new Date();
      setSemestresProgramados(prevProgramados => {
        const aActivar = prevProgramados.filter(s => new Date(s.fechaInicio) <= hoy);
        
        if (aActivar.length > 0) {
          // Pasamos los que ya cumplieron fecha a la lista oficial de semestres
          const nuevosSemestres = aActivar.map(s => ({
            id: s.id,
            semestre: s.semestre,
            anio: s.anio,
            estado: 'Activo'
          }));
          setSemestres(prev => [...nuevosSemestres, ...prev]);
          showToast(`Se ha activado automáticamente: ${nuevosSemestres[0].semestre} ${nuevosSemestres[0].anio}`);
          
          // Retornamos la lista filtrada (quitando los activados)
          return prevProgramados.filter(s => new Date(s.fechaInicio) > hoy);
        }
        return prevProgramados;
      });
    }, 10000); // Revisa cada 10 segundos (para la demo)

    return () => clearInterval(interval);
  }, [semestresProgramados]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      docentes, setDocentes,
      coordinadores, setCoordinadores,
      semestres, setSemestres,
      semestresProgramados, setSemestresProgramados,
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas,
      notification, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};