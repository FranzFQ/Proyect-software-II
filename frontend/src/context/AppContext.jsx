// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { listaDocentesGlobal, listaCoordinadores } from '../utils/mockData';
import { getSemestres } from '../services/academico_service';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState([]);
  const [semestreActivo, setSemestreActivo] = useState(null);
  
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

  // Cargar semestres desde el backend
  useEffect(() => {
    const fetchSemestres = async () => {
      try {
        // Obtenemos solo los visibles (por defecto)
        const data = await getSemestres();
        const results = data ? (Array.isArray(data) ? data : data.results || []) : [];
        setSemestres(results);
        
        // Buscamos el activo
        const activo = results.find(s => s.activo_para_carga);
        if (activo) {
          setSemestreActivo(`Ciclo ${activo.ciclo} — ${activo.anio}`);
        } else if (results.length > 0) {
          setSemestreActivo(`Ciclo ${results[0].ciclo} — ${results[0].anio}`);
        }
      } catch (error) {
        console.error("Error al cargar semestres iniciales:", error);
      }
    };

    fetchSemestres();
  }, [currentUser]); // Recargar cuando el usuario inicia sesión

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      docentes, setDocentes,
      coordinadores, setCoordinadores,
      semestres, setSemestres,
      semestreActivo, setSemestreActivo,
      ponderaciones, setPonderaciones,
      documentos, setDocumentos,
      evaluacionesCompletadas, setEvaluacionesCompletadas,
      notification, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};