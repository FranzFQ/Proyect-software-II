// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { listaDocentesGlobal, listaCoordinadores, listaSemestres } from '../utils/mockData';
import { getSemestres, getSemestreActivo } from '../services/academico_service';
import { getSavedUser } from '../services/auth_service';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());
  const [docentes, setDocentes] = useState(listaDocentesGlobal);
  const [coordinadores, setCoordinadores] = useState(listaCoordinadores);
  const [semestres, setSemestres] = useState([]);
  const [semestreActivo, setSemestreActivo] = useState(null);

  // NUEVO: Semestres programados por el Admin (Si se usa en el Dashboard)
  const [semestresProgramados, setSemestresProgramados] = useState([]);

  const [evaluacionesCompletadas, setEvaluacionesCompletadas] = useState("0%");
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const fetchActiveSemester = async () => {
        try {
            const s = await getSemestreActivo();
            if (s) {
              setSemestreActivo(`${s.anio} - Ciclo ${s.ciclo}`);
            }
        } catch (error) {
            console.error("No se pudo cargar el semestre activo:", error);
            setSemestreActivo("Semestre I — 2025"); // Fallback
        }
    };
    fetchActiveSemester();
  }, []);

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
        } else if (results.length > 0 && !semestreActivo) {
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
