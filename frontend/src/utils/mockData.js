// src/utils/mockData.js

export const dashboardMetrics = {
  totalDocentes: 124,
  promedioGeneral: 85.4,
  docentesRiesgo: 12,
  evaluacionesCompletadas: "0%"
};

export const docentesData = [
  { id: 1, nombre: "Ing. Carlos Mendoza", curso: "Física Básica", puntajeTotal: 92 },
  { id: 2, nombre: "Licda. María Fernanda Ortiz", curso: "Matemática Intermedia", puntajeTotal: 74 },
  { id: 3, nombre: "Ing. Roberto Juárez", curso: "Programación Avanzada", puntajeTotal: 58 }
];

const plantillaPerfilVacio = {
  semestreActual: { id: "current", nombre: "Semestre I - año 2025", creditosTotales: 0, totalCursos: 0, ponderacionesActuales: [], cursos: [] },
  semestresHistoricos: [],
  semestres: [],
  visitas: [],
  comparacion: { anterior: null, actual: null }
};

export const listaDocentesGlobal = [
  {
    id: 1,
    nombre: "Marta Alvarado Fuentes",
    codigo: "CAT-9831751",
    iniciales: "MA",
    cursos: 2,
    facultad: "Ingeniería",
    departamento: "Ingeniería de Sistemas",
    tipo: "Tiempo Completo",
    ponderacion: 9.25,
    estado: "Excelente",
    creditosTotales: 10,
    totalCursos: 2,
    ponderacionesActuales: [
      { label: 'Checklist', score: 10 }, { label: 'Coordinador', score: 3.5 }, { label: 'Autoevaluación', score: 4.5 },
      { label: 'Evaluaciones', score: 8.3 }, { label: 'Apoyo', score: 9 }, { label: 'CEAT', score: 9.25 }
    ],
    cursosActuales: [
      { id: 101, nombre: "Estructuras de Datos", estado: "Excelente", score: 9.3 },
      { id: 102, nombre: "Algoritmos", estado: "Excelente", score: 9.2 }
    ],
    
    semestreActual: {
      id: "current", nombre: "Semestre I - año 2025", creditosTotales: 10, totalCursos: 2,
      ponderacionesActuales: [
        { label: 'Checklist', score: 10 }, { label: 'Coordinador', score: 3.5 }, { label: 'Autoevaluación', score: 4.5 },
        { label: 'Evaluaciones', score: 8.3 }, { label: 'Apoyo', score: 9 }, { label: 'CEAT', score: 9.25 }
      ],
      cursos: [
        { id: 101, nombre: "Estructuras de Datos", estado: "Excelente", score: 9.3 },
        { id: 102, nombre: "Algoritmos", estado: "Excelente", score: 9.2 }
      ]
    },
    semestresHistoricos: [
      {
        id: "s2-2024", nombre: "Semestre II - 2024", estado: "Excelente", score: 9.2, creditosTotales: 4, totalCursos: 1,
        ponderacionesActuales: [ 
          { label: 'Checklist', score: 8.6 }, { label: 'Coordinador', score: 9.1 }, { label: 'Autoevaluación', score: 9.5 },
          { label: 'Evaluaciones', score: 9.4 }, { label: 'Apoyo', score: 9.0 }, { label: 'CEAT', score: 9.2 }
        ],
        cursos: [ { id: "CS410", nombre: "Algoritmos Avanzados", score: 9.2, estado: "Excelente" } ]
      },
      {
        id: "s1-2024", nombre: "Semestre I - 2024", estado: "Excelente", score: 9.3, creditosTotales: 3, totalCursos: 1,
        ponderacionesActuales: [ 
          { label: 'Checklist', score: 8.8 }, { label: 'Coordinador', score: 9.0 }, { label: 'Autoevaluación', score: 9.8 },
          { label: 'Evaluaciones', score: 9.6 }, { label: 'Apoyo', score: 9.0 }, { label: 'CEAT', score: 9.3 }
        ],
        cursos: [ { id: "CS301", nombre: "Estructuras de Datos", score: 9.3, estado: "Excelente" } ]
      }
    ],

    semestres: [
      {
        id: "s1-2024", label: "Semestre I - 2024", calificacion: 9.3, nivel: "Excelente",
        cursos: [
          { codigo: "CS301", nombre: "Estructuras de Datos", creditos: 3, punteoFinal: 9.3, ponderaciones: [ { nombre: "Eval. Estudiantes", valor: 9.6, color: "#FFD700" }, { nombre: "Autoevaluación", valor: 9.8, color: "#1a2a4a" }, { nombre: "Coordinador", valor: 9.0, color: "#FFD700" }, { nombre: "Checklist", valor: 8.8, color: "#6b7280" } ], comentarios: [ "Excelente docente, explica con mucha claridad.", "Buen manejo del tiempo, clase organizada." ], sugerencias: ["Cuenta con la experiencia necesaria para impartir el curso."] }
        ]
      },
      {
        id: "s2-2024", label: "Semestre II - 2024", calificacion: 9.2, nivel: "Excelente",
        cursos: [
          { codigo: "CS410", nombre: "Algoritmos Avanzados", creditos: 4, punteoFinal: 9.2, ponderaciones: [ { nombre: "Eval. Estudiantes", valor: 9.4, color: "#FFD700" }, { nombre: "Autoevaluación", valor: 9.5, color: "#1a2a4a" }, { nombre: "Coordinador", valor: 9.1, color: "#FFD700" }, { nombre: "Checklist", valor: 8.6, color: "#6b7280" } ], comentarios: ["Excelente dominio del tema.", "El ritmo es adecuado."], sugerencias: ["Incluir más ejercicios prácticos en laboratorio."] }
        ]
      },
      {
        id: "s1-2025", label: "Semestre I - 2025", calificacion: 5.6, nivel: "Buena",
        cursos: [
          { codigo: "CS220", nombre: "Programación Orientada a Objetos", creditos: 3, punteoFinal: 5.6, ponderaciones: [ { nombre: "Eval. Estudiantes", valor: 5.8, color: "#FFD700" }, { nombre: "Autoevaluación", valor: 6.0, color: "#1a2a4a" }, { nombre: "Coordinador", valor: 5.5, color: "#FFD700" }, { nombre: "Checklist", valor: 5.0, color: "#6b7280" } ], comentarios: ["Necesita mejorar la claridad.", "Las clases son largas."], sugerencias: ["Reforzar el uso de recursos didácticos."] }
        ]
      }
    ],
    visitas: [
      { id: 101, numero: 1, fecha: "14 nov - 2025", materia: "Redes y telecomunicaciones", punteo: 8.8, nombre: "Observacion Pedagogica", codigoDocente: "CAT-9831751", color: "#F5C518", criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"], criterios: 6, evaluacionesGuardadas: [ { completado: true, score: 9 }, { completado: true, score: 10 }, { completado: true, score: 8 }, { completado: true, score: 7 }, { completado: true, score: 9 }, { completado: false, score: null } ], observacionesGuardadas: "Docente muy bien preparada, domina el tema." },
      { id: 102, numero: 2, fecha: "28 oct - 2025", materia: "Programación web", punteo: 9.1, nombre: "Manejo de Aula", codigoDocente: "CAT-9831751", color: "#22c55e", criteriosList: ["Control del grupo", "Clima de aula", "Gestion del tiempo", "Disciplina positiva", "Participacion estudiantil", "Ambiente inclusivo"], criterios: 6, evaluacionesGuardadas: [ { completado: true, score: 9 }, { completado: true, score: 9 }, { completado: true, score: 9 }, { completado: true, score: 9 }, { completado: true, score: 10 }, { completado: true, score: 9 } ], observacionesGuardadas: "Excelente manejo del grupo y metodología activa." },
      { id: 103, numero: 3, fecha: "15 sep - 2025", materia: "Estructuras de Datos", punteo: 8.5, nombre: "Evaluación Intermedia", codigoDocente: "CAT-9831751", color: "#F5C518", criteriosList: ["Resolución de dudas", "Ejercicios prácticos", "Revisión de tareas"], criterios: 3, evaluacionesGuardadas: [ { completado: true, score: 8 }, { completado: true, score: 9 }, { completado: true, score: 8 } ], observacionesGuardadas: "Mantiene buen ritmo, los alumnos participan." },
      { id: 104, numero: 4, fecha: "01 sep - 2025", materia: "Algoritmos", punteo: 9.5, nombre: "Supervisión Especial", codigoDocente: "CAT-9831751", color: "#22c55e", criteriosList: ["Innovación", "Dinámicas grupales", "Evaluación continua"], criterios: 3, evaluacionesGuardadas: [ { completado: true, score: 10 }, { completado: true, score: 9 }, { completado: true, score: 9 } ], observacionesGuardadas: "Metodología altamente efectiva." },
      { id: 105, numero: 5, fecha: "15 ago - 2025", materia: "Redes y telecomunicaciones", punteo: 7.2, nombre: "Observacion Inicial", codigoDocente: "CAT-9831751", color: "#facc15", criteriosList: ["Presentación del programa", "Reglas claras"], criterios: 2, evaluacionesGuardadas: [ { completado: true, score: 7 }, { completado: true, score: 7 } ], observacionesGuardadas: "El inicio de semestre fue un poco apresurado." }
    ],
    comparacion: {
      anterior: {
        semestre: "Sem. II 2024", punteo: 9.0,
        desglose: [ { label: 'Eval. Estudiantes', score: 9.0 }, { label: 'Autoevaluación', score: 9.2 }, { label: 'Coordinador', score: 8.8 }, { label: 'CEAT', score: 8.6 }, { label: 'Apoyo Univ.', score: 9.2 }, { label: 'Checklist', score: 9.2 } ]
      },
      actual: {
        semestre: "Sem. I 2025", punteo: 9.4, variacionTotal: "+0.4",
        desglose: [ { label: 'Eval. Estudiantes', score: 9.6, variacion: "+0.6" }, { label: 'Autoevaluación', score: 9.8, variacion: "+0.6" }, { label: 'Coordinador', score: 9.0, variacion: "+0.2" }, { label: 'CEAT', score: 9.1, variacion: "+0.5" }, { label: 'Apoyo Univ.', score: 9.5, variacion: "+0.3" }, { label: 'Checklist', score: 9.5, variacion: "+0.3" } ]
      }
    }
  },
  { id: 2, nombre: "Ana Elizabeth Mendoza Garcia", codigo: "CAT-9831982", iniciales: "AM", cursos: 1, facultad: "Ingeniería", departamento: "Ciencias de la Computación", tipo: "Tiempo Parcial", ponderacion: 3.2, estado: "Deficiente", ...plantillaPerfilVacio },
  { id: 3, nombre: "Pedro José García Moreno", codigo: "CAT-9831730", iniciales: "PG", cursos: 3, facultad: "Ingeniería", departamento: "Ingeniería Civil", tipo: "Tiempo Completo", ponderacion: 6.5, estado: "Buena", ...plantillaPerfilVacio },
  { id: 4, nombre: "Sandra Elena López Torres", codigo: "CAT-9203841", iniciales: "SL", cursos: 1, facultad: "Ingeniería", departamento: "Ingeniería Química", tipo: "Tiempo Parcial", ponderacion: 4.9, estado: "Deficiente", ...plantillaPerfilVacio },
  { id: 5, nombre: "Luis Diego Ramírez Ordóñez", codigo: "CAT-9831038", iniciales: "LR", cursos: 2, facultad: "Ingeniería", departamento: "Ingeniería en Sistemas", tipo: "Tiempo Completo", ponderacion: 7.5, estado: "Excelente", ...plantillaPerfilVacio },
  { id: 6, nombre: "Luis Javier Ramírez Maldonado", codigo: "CAT-9831790", iniciales: "LM", cursos: 2, facultad: "Ingeniería", departamento: "Ingeniería Mecánica", tipo: "Tiempo Parcial", ponderacion: 6.9, estado: "Buena", ...plantillaPerfilVacio },
  
  { id: 7, nombre: "Carmen Leticia Díaz", codigo: "CAT-9111222", iniciales: "CD", cursos: 3, facultad: "Arquitectura", departamento: "Diseño Estructural", tipo: "Tiempo Completo", ponderacion: 8.5, estado: "Buena", ...plantillaPerfilVacio },
  { id: 8, nombre: "Jorge Mario Castillo", codigo: "CAT-9333444", iniciales: "JC", cursos: 2, facultad: "Ciencias Económicas", departamento: "Administración", tipo: "Tiempo Parcial", ponderacion: 5.8, estado: "Deficiente", ...plantillaPerfilVacio },
  { id: 9, nombre: "Silvia Patricia Lima", codigo: "CAT-9555666", iniciales: "SL", cursos: 4, facultad: "Humanidades", departamento: "Psicología", tipo: "Tiempo Completo", ponderacion: 9.8, estado: "Excelente", ...plantillaPerfilVacio },
  { id: 10, nombre: "Ricardo Antonio Vega", codigo: "CAT-9777888", iniciales: "RV", cursos: 1, facultad: "Ingeniería", departamento: "Ingeniería Industrial", tipo: "Tiempo Parcial", ponderacion: 7.2, estado: "Buena", ...plantillaPerfilVacio },
  { id: 11, nombre: "Mónica Beatriz Ruiz", codigo: "CAT-9999000", iniciales: "MR", cursos: 3, facultad: "Derecho", departamento: "Derecho Penal", tipo: "Tiempo Completo", ponderacion: 4.8, estado: "Deficiente", ...plantillaPerfilVacio },
  { id: 12, nombre: "Héctor Leonel Sosa", codigo: "CAT-9123456", iniciales: "HS", cursos: 2, facultad: "Ingeniería", departamento: "Ingeniería Mecánica", tipo: "Tiempo Completo", ponderacion: 8.9, estado: "Buena", ...plantillaPerfilVacio },
  { id: 13, nombre: "Valeria Sofia Castro", codigo: "CAT-9654321", iniciales: "VC", cursos: 5, facultad: "Ciencias Económicas", departamento: "Mercadotecnia", tipo: "Tiempo Completo", ponderacion: 9.1, estado: "Excelente", ...plantillaPerfilVacio },
  { id: 14, nombre: "Esteban René Aguilar", codigo: "CAT-9988776", iniciales: "EA", cursos: 2, facultad: "Arquitectura", departamento: "Urbanismo", tipo: "Tiempo Parcial", ponderacion: 6.2, estado: "Buena", ...plantillaPerfilVacio },
  { id: 15, nombre: "Andrea Michelle Pineda", codigo: "CAT-9345678", iniciales: "AP", cursos: 3, facultad: "Ciencias de la Salud", departamento: "Nutrición", tipo: "Tiempo Completo", ponderacion: 9.5, estado: "Excelente", ...plantillaPerfilVacio }
];

export const detalleDocenteMarta = listaDocentesGlobal[0];

export const listaCoordinadores = [
  { id: 1, nombre: "Juan Rodríguez", username: "jrodriguez", iniciales: "JR", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "jrodriguez@univ.edu.gt", esAdmin: true },
  { id: 2, nombre: "Ana Mendoza", username: "amendoza", iniciales: "AM", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "amendoza@univ.edu.gt", esAdmin: false },
  { id: 3, nombre: "Pedro García", username: "pgarcia", iniciales: "PG", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "pgarcia@univ.edu.gt", esAdmin: false },
  { id: 4, nombre: "Sandra López", username: "slopez", iniciales: "SL", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "slopez@univ.edu.gt", esAdmin: false },
  { id: 5, nombre: "Carlos Méndez", username: "cmendez", iniciales: "CM", facultad: "Arquitectura", carrera: "Diseño Industrial", correo: "cmendez@univ.edu.gt", esAdmin: false },
  { id: 6, nombre: "Lucía Pineda", username: "lpineda", iniciales: "LP", facultad: "Ciencias Económicas", carrera: "Administración de Empresas", correo: "lpineda@univ.edu.gt", esAdmin: true },
  { id: 7, nombre: "Marcos Aguilar", username: "maguilar", iniciales: "MA", facultad: "Humanidades", carrera: "Psicología Clínica", correo: "maguilar@univ.edu.gt", esAdmin: false },
  { id: 8, nombre: "Sofía Reyes", username: "sreyes", iniciales: "SR", facultad: "Derecho", carrera: "Ciencias Jurídicas", correo: "sreyes@univ.edu.gt", esAdmin: false }
];

export const detalleCoordinador = {
  id: 1, nombre: "Ing. Roberto Carlos Martínez", iniciales: "RM", facultad: "Ingeniería de Sistemas", codigo: "COORD-001", docentesACargo: 15,
  metricas: [ { label: "Promedio General", score: 8.9, icon: "📊" }, { label: "Docentes Evaluados", score: 15, icon: "👨‍🏫" }, { label: "Cumplimiento", score: "95%", icon: "✅" } ],
  docentes: [ { id: 1, nombre: "Marta Alvarado Fuentes", codigo: "CAT-9831751", cursos: 2, score: 9.25, estado: "Excelente" }, { id: 3, nombre: "Pedro José García", codigo: "CAT-9831730", cursos: 3, score: 6.5, estado: "Buena" }, { id: 2, nombre: "Ana Elizabeth Mendoza", codigo: "CAT-9831982", cursos: 1, score: 3.2, estado: "Deficiente" } ],
  historico: [ { semestre: "Sem. II 2024", promedio: 8.5, docentesEvaluados: 14 }, { semestre: "Sem. I 2024", promedio: 8.2, docentesEvaluados: 12 } ]
};

export const listaSemestres = [
  { id: 1, semestre: "Semestre II", anio: "2026", estado: "Proximo" },
  { id: 2, semestre: "Semestre I", anio: "2026", estado: "Activo" },
  { id: 3, semestre: "Semestre II", anio: "2025", estado: "Finalizado" },
  { id: 4, semestre: "Semestre I", anio: "2025", estado: "Finalizado" },
  { id: 5, semestre: "Semestre II", anio: "2024", estado: "Finalizado" },
  { id: 6, semestre: "Semestre I", anio: "2024", estado: "Finalizado" },
  { id: 7, semestre: "Semestre II", anio: "2023", estado: "Finalizado" },
  { id: 8, semestre: "Semestre I", anio: "2023", estado: "Finalizado" },
];