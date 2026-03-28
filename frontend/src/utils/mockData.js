// src/utils/mockData.js

// --- DATOS GLOBALES DEL DASHBOARD ---
export const dashboardMetrics = {
  totalDocentes: 124,
  promedioGeneral: 85.4,
  docentesRiesgo: 12,
  evaluacionesCompletadas: "0%" // Empieza en 0% hasta procesar en Archivos
};

// --- LISTA RESUMIDA PARA EL DASHBOARD ---
export const docentesData = [
  { id: 1, nombre: "Ing. Carlos Mendoza", curso: "Física Básica", puntajeTotal: 92 },
  { id: 2, nombre: "Licda. María Fernanda Ortiz", curso: "Matemática Intermedia", puntajeTotal: 74 },
  { id: 3, nombre: "Ing. Roberto Juárez", curso: "Programación Avanzada", puntajeTotal: 58 }
];

// --- DATOS COMPLETOS DE LA VISTA DOCENTES (Mockup 6) ---
// Agregué más docentes para probar scroll y búsqueda
export const listaDocentesGlobal = [
  { id: 1, nombre: "Marta Alvarado Fuentes", codigo: "CAT - 9831751", iniciales: "MA", cursos: 2, facultad: "Ingeniería", ponderacion: 9.25, estado: "Excelente" },
  { id: 2, nombre: "Ana Elizabeth Mendoza Garcia", codigo: "CAT - 9831982", iniciales: "AM", cursos: 1, facultad: "Ingeniería", ponderacion: 3.2, estado: "Deficiente" },
  { id: 3, nombre: "Pedro José García Moreno", codigo: "CAT - 9831730", iniciales: "PG", cursos: 3, facultad: "Ingeniería", ponderacion: 6.5, estado: "Buena" },
  { id: 4, nombre: "Sandra Elena López Torres", codigo: "CAT - 9203841", iniciales: "SL", cursos: 1, facultad: "Ingeniería", ponderacion: 4.9, estado: "Deficiente" },
  { id: 5, nombre: "Luis Diego Ramírez Ordóñez", codigo: "CAT - 9831038", iniciales: "LR", cursos: 2, facultad: "Ingeniería", ponderacion: 7.5, estado: "Excelente" },
  { id: 6, nombre: "Luis Javier Ramírez Maldonado", codigo: "CAT - 9831790", iniciales: "LM", cursos: 2, facultad: "Ingeniería", ponderacion: 6.9, estado: "Buena" },
];

// --- DETALLE PROFUNDO DE UN DOCENTE (Mockup 7) ---
// Basado en Marta Alvarado (id: 1)
// Reemplaza solo la constante detalleDocenteMarta en src/utils/mockData.js
export const detalleDocenteMarta = {
  id: 1,
  nombre: "Marta Alvarado Fuentes",
  iniciales: "MA",
  facultad: "Ingeniería de Sistemas",
  jornada: "Tiempo Completo",
  codigo: "CAT - 9831751",
  creditosTotales: 10,
  totalCursos: 2,
  puntuacionFinal: 9.25,
  estadoFinal: "Excelente",
  
  ponderacionesActuales: [
    { label: 'Ponderación Checklist', score: 10, icon: '📋' },
    { label: 'Ponderación Coordinador', score: 3.5, icon: '👨‍🏫' },
    { label: 'Ponderación Autoevaluación', score: 4.5, icon: '🔍' },
    { label: 'Ponderación Evaluaciones', score: 8.3, icon: '📝' },
    { label: 'Ponderación Apoyo', score: 9, icon: '🤝' },
    { label: 'Ponderación CEAT', score: 9.25, icon: '🏛️' }
  ],
  
  cursosActuales: [
    { id: 101, nombre: "Estructuras de Datos", estado: "Excelente", score: 9.3, desglose: { estudiante: 9.6, ceat: 9.0, auto: 9.8, coord: 9.0 } },
    { id: 102, nombre: "Algoritmos", estado: "Excelente", score: 9.2, desglose: { estudiante: 9.0, ceat: 9.5, auto: 10, coord: 9.0 } }
  ],
  
  historicoCursos: [
    { id: 501, semestre: "Segundo Semestre 2024", nombreCurso: "Lógica de Sistemas", score: 9.5, desglose: { estudiante: 9.8, ceat: 9.2, auto: 9.5, coord: 9.5 } },
    { id: 502, semestre: "Segundo Semestre 2024", nombreCurso: "Introducción a la Programación", score: 8.9, desglose: { estudiante: 8.5, ceat: 9.0, auto: 9.0, coord: 9.1 } },
    { id: 401, semestre: "Primer Semestre 2024", nombreCurso: "Física 2", score: 9.2, desglose: { estudiante: 9.0, ceat: 9.5, auto: 9.5, coord: 9.0 } },
    { id: 402, semestre: "Primer Semestre 2024", nombreCurso: "Matemática 3", score: 7.8, desglose: { estudiante: 7.0, ceat: 8.0, auto: 8.5, coord: 8.0 } },
    { id: 301, semestre: "Segundo Semestre 2023", nombreCurso: "Física 1", score: 8.5, desglose: { estudiante: 8.0, ceat: 9.0, auto: 9.0, coord: 8.5 } },
  ],

  // NUEVO: Lista de visitas previas a la tabla de checklist
  visitas: [
    { id: 1, titulo: "Visita 1", fecha: "14 nov - 2025", curso: "Redes y telecomunicaciones", score: 8.8 },
    { id: 2, titulo: "Visita 2", fecha: "28 oct - 2025", curso: "Programación web", score: 9.1 },
    { id: 3, titulo: "Visita 3", fecha: "14 Marzo - 2026", curso: "Software II", score: 8.8 },
    { id: 4, titulo: "Visita 4", fecha: "28 febrero - 2026", curso: "Programación web", score: 9.1 },
  ],

  checklistData: [
    { id: 1, descripcion: "Claraidad en la explicacion", estado: "cumple", nota: "9 / 10" },
    { id: 2, descripcion: "Dominio del contenido", estado: "cumple", nota: "10 / 10" },
    { id: 3, descripcion: "Interaccion con estudiantes", estado: "regular", nota: "8 / 10" },
    { id: 4, descripcion: "Uso de recursos didacticos", estado: "regular", nota: "7 / 10" },
    { id: 5, descripcion: "Puntualidad y orden", estado: "cumple", nota: "9 / 10" },
    { id: 6, descripcion: "Evaluacion formativa", estado: "n/a", nota: "— / 10" },
  ],

  // NUEVO: Datos para la pestaña de Comparación
  comparacion: {
    anterior: {
      semestre: "Sem. II 2024", punteo: 9.0,
      desglose: [
        { label: 'Eval. Estudiantes', score: 9.0 }, { label: 'Autoevaluación', score: 9.2 },
        { label: 'Coordinador', score: 8.8 }, { label: 'CEAT', score: 8.6 },
        { label: 'Apoyo Univ.', score: 9.2 }, { label: 'Checklist', score: 9.2 }
      ]
    },
    actual: {
      semestre: "Sem. I 2025", punteo: 9.4, variacionTotal: "+0.4",
      desglose: [
        { label: 'Eval. Estudiantes', score: 9.6, variacion: "+0.6" },
        { label: 'Autoevaluación', score: 9.8, variacion: "+0.6" },
        { label: 'Coordinador', score: 9.0, variacion: "+0.2" },
        { label: 'CEAT', score: 9.1, variacion: "+0.5" },
        { label: 'Apoyo Univ.', score: 9.5, variacion: "+0.3" },
        { label: 'Checklist', score: 9.5, variacion: "+0.3" }
      ]
    }
  }
};

// --- DATOS DEL MÓDULO DE COORDINADORES ---

export const listaCoordinadores = [
  { id: 1, nombre: "Ing. Roberto Carlos Martínez", codigo: "COORD-001", iniciales: "RM", facultad: "Ingeniería", docentesEvaluados: 15, promedio: 8.9, estado: "Buena" },
  { id: 2, nombre: "Licda. Ana Sofía Rodríguez", codigo: "COORD-002", iniciales: "AR", facultad: "Ingeniería", docentesEvaluados: 12, promedio: 9.3, estado: "Excelente" },
  { id: 3, nombre: "Dr. Luis Fernando Gómez", codigo: "COORD-003", iniciales: "LG", facultad: "Ingeniería", docentesEvaluados: 20, promedio: 6.5, estado: "Deficiente" }
];

export const detalleCoordinador = {
  id: 1,
  nombre: "Ing. Roberto Carlos Martínez",
  iniciales: "RM",
  facultad: "Ingeniería de Sistemas",
  codigo: "COORD-001",
  docentesACargo: 15,
  metricas: [
    { label: "Promedio General", score: 8.9, icon: "📊" },
    { label: "Docentes Evaluados", score: 15, icon: "👨‍🏫" },
    { label: "Cumplimiento", score: "95%", icon: "✅" }
  ],
  docentes: [
    { id: 101, nombre: "Marta Alvarado Fuentes", codigo: "CAT-9831751", cursos: 2, score: 9.25, estado: "Excelente" },
    { id: 102, nombre: "Pedro José García", codigo: "CAT-9831730", cursos: 3, score: 6.5, estado: "Buena" },
    { id: 103, nombre: "Ana Elizabeth Mendoza", codigo: "CAT-9831982", cursos: 1, score: 3.2, estado: "Deficiente" }
  ],
  historico: [
    { semestre: "Sem. II 2024", promedio: 8.5, docentesEvaluados: 14 },
    { semestre: "Sem. I 2024", promedio: 8.2, docentesEvaluados: 12 }
  ]
};