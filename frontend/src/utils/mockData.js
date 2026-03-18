// src/utils/mockData.js

export const dashboardMetrics = {
  totalDocentes: 124,
  promedioGeneral: 85.4,
  docentesRiesgo: 12,
  evaluacionesCompletadas: "95%"
};

export const docentesData = [
  { id: 1, nombre: "Ing. Carlos Mendoza", curso: "Física Básica", puntajeTotal: 92 },
  { id: 2, nombre: "Licda. María Fernanda Ortiz", curso: "Matemática Intermedia", puntajeTotal: 74 },
  { id: 3, nombre: "Ing. Roberto Juárez", curso: "Programación Avanzada", puntajeTotal: 58 }
];

// NUEVOS DATOS PARA LA VISTA DE DOCENTES (Mockup 6 y 7)
export const listaDocentes = [
  { id: 1, nombre: "Marta Alvarado Fuentes", codigo: "CAT - 9831751", iniciales: "JR", cursos: 8, facultad: "Ingeniería", ponderacion: 9.25, estado: "Excelente" },
  { id: 2, nombre: "Ana Elizabeth Mendoza Garcia", codigo: "CAT - 9831982", iniciales: "AM", cursos: 8, facultad: "Ingeniería", ponderacion: 3.2, estado: "Deficiente" },
  { id: 3, nombre: "Pedro José García Moreno", codigo: "CAT - 9831730", iniciales: "PG", cursos: 8, facultad: "Ingeniería", ponderacion: 6.5, estado: "Buena" },
  { id: 4, nombre: "Sandra Elena López Torres", codigo: "CAT - 9203841", iniciales: "SL", cursos: 8, facultad: "Ingeniería", ponderacion: 4.9, estado: "Deficiente" },
  { id: 5, nombre: "Luis Diego Ramírez Ordóñez", codigo: "CAT - 9831038", iniciales: "SL", cursos: 8, facultad: "Ingeniería", ponderacion: 7.5, estado: "Excelente" },
  { id: 6, nombre: "Luis Javier Ramírez Maldonado", codigo: "CAT - 9831790", iniciales: "SL", cursos: 8, facultad: "Ingeniería", ponderacion: 6.9, estado: "Buena" },
];

export const detalleDocente = {
  id: 1,
  nombre: "Marta Alvarado Fuentes",
  iniciales: "MA",
  facultad: "Ingeniería de Sistemas",
  jornada: "Tiempo Completo",
  creditosTotales: 10,
  totalCursos: 2,
  desglose: [
    { label: 'Ponderación Checklist', score: 10 },
    { label: 'Ponderación Coordinador', score: 3.5 },
    { label: 'Ponderación Autoevaluación', score: 4.5 },
    { label: 'Ponderación Evaluaciones', score: 8.3 },
    { label: 'Ponderación Apoyo', score: 9 },
    { label: 'Ponderación CEAT', score: 9.25 }
  ],
  cursosImpartidos: [
    { id: 101, nombre: "Estructuras de Datos", estado: "Excelente", score: 9.3 },
    { id: 102, nombre: "Algoritmos", estado: "Excelente", score: 9.2 }
  ]
};