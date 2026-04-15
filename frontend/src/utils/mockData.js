// src/utils/mockData.js

// --- DATOS GLOBALES DEL DASHBOARD ---
export const dashboardMetrics = {
  totalDocentes: 124,
  promedioGeneral: 85.4,
  docentesRiesgo: 12,
  evaluacionesCompletadas: "0%"
};

// --- LISTA RESUMIDA PARA EL DASHBOARD ---
export const docentesData = [
  { id: 1, nombre: "Ing. Carlos Mendoza", curso: "Física Básica", puntajeTotal: 92 },
  { id: 2, nombre: "Licda. María Fernanda Ortiz", curso: "Matemática Intermedia", puntajeTotal: 74 },
  { id: 3, nombre: "Ing. Roberto Juárez", curso: "Programación Avanzada", puntajeTotal: 58 }
];

// --- LISTA COMPLETA DE DOCENTES (con semestres y visitas) ---
export const listaDocentesGlobal = [
  {
    id: 1,
    nombre: "Marta Alvarado Fuentes",
    codigo: "CAT - 9831751",
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
      { label: 'Ponderación Checklist', score: 10 },
      { label: 'Ponderación Coordinador', score: 3.5 },
      { label: 'Ponderación Autoevaluación', score: 4.5 },
      { label: 'Ponderación Evaluaciones', score: 8.3 },
      { label: 'Ponderación Apoyo', score: 9 },
      { label: 'Ponderación CEAT', score: 9.25 }
    ],
    cursosActuales: [
      { id: 101, nombre: "Estructuras de Datos", estado: "Excelente", score: 9.3 },
      { id: 102, nombre: "Algoritmos", estado: "Excelente", score: 9.2 }
    ],
    semestres: [
      {
        id: "s1-2024",
        label: "Semestre I - 2024",
        calificacion: 9.3,
        nivel: "Excelente",
        cursos: [
          {
            codigo: "CS301",
            nombre: "Estructuras de Datos",
            creditos: 3,
            punteoFinal: 9.3,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 9.6, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 9.8, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 9.0, color: "#FFD700" },
              { nombre: "Checklist", valor: 8.8, color: "#6b7280" },
            ],
            comentarios: [
              "Excelente docente, explica con mucha claridad.",
              "Buen manejo del tiempo, clase organizada.",
            ],
            sugerencias: ["Cuenta con la experiencia necesaria para impartir el curso."],
          },
        ],
      },
      {
        id: "s2-2024",
        label: "Semestre II - 2024",
        calificacion: 9.2,
        nivel: "Excelente",
        cursos: [
          {
            codigo: "CS410",
            nombre: "Algoritmos Avanzados",
            creditos: 4,
            punteoFinal: 9.2,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 9.5, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 9.5, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 9.1, color: "#FFD700" },
              { nombre: "Checklist", valor: 8.6, color: "#6b7280" },
            ],
            comentarios: ["Excelente dominio del tema.", "El ritmo es adecuado."],
            sugerencias: ["Incluir más ejercicios prácticos en laboratorio."],
          },
        ],
      },
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 6.5,
        nivel: "Buena",
        cursos: [
          {
            codigo: "CS301",
            nombre: "Estructuras de Datos",
            creditos: 3,
            punteoFinal: 9.3,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 9.6, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 9.8, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 9.0, color: "#FFD700" },
              { nombre: "Checklist", valor: 8.8, color: "#6b7280" },
            ],
            comentarios: [
              "Excelente docente, explica con mucha claridad.",
              "Buen manejo del tiempo, clase organizada.",
            ],
            sugerencias: ["Cuenta con la experiencia necesaria para impartir el curso."],
          },
        ],
      },
      {
        id: "s2-2025",
        label: "Semestre II - 2025",
        calificacion: 5.6,
        nivel: "Buena",
        cursos: [
          {
            codigo: "CS220",
            nombre: "Programación Orientada a Objetos",
            creditos: 3,
            punteoFinal: 5.6,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 5.8, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 6.0, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 5.5, color: "#FFD700" },
              { nombre: "Checklist", valor: 5.0, color: "#6b7280" },
            ],
            comentarios: ["Necesita mejorar la claridad.", "Las clases son largas."],
            sugerencias: ["Reforzar el uso de recursos didácticos."],
          },
        ],
      },
    ],
    visitas: [
      {
        id: 101, numero: 1, fecha: "14 nov - 2025", materia: "Redes y telecomunicaciones",
        punteo: 8.8, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 9831751",
        color: "#F5C518",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Uso de recursos didacticos", "Puntualidad y orden", "Evaluacion formativa"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 10 },
          { completado: true, score: 8 }, { completado: true, score: 7 },
          { completado: true, score: 9 }, { completado: false, score: null },
        ],
        observacionesGuardadas: "Docente muy bien preparada, domina el tema.",
      },
      {
        id: 102, numero: 2, fecha: "28 oct - 2025", materia: "Programación web",
        punteo: 9.1, nombre: "Manejo de Aula", codigoDocente: "CAT - 9831751",
        color: "#22c55e",
        criteriosList: ["Control del grupo", "Clima de aula", "Gestion del tiempo", "Disciplina positiva", "Participacion estudiantil", "Ambiente inclusivo"],
        criterios: 6,
        evaluacionesGuardadas: [
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 9 }, { completado: true, score: 9 },
          { completado: true, score: 10 }, { completado: true, score: 9 },
        ],
        observacionesGuardadas: "Excelente manejo del grupo y metodología activa.",
      },
    ],
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
  },
  {
    id: 2,
    nombre: "Ana Elizabeth Mendoza Garcia",
    codigo: "CAT - 9831982",
    iniciales: "AM",
    cursos: 1,
    facultad: "Ingeniería",
    departamento: "Ciencias de la Computación",
    tipo: "Tiempo Parcial",
    ponderacion: 3.2,
    estado: "Deficiente",
    creditosTotales: 4,
    totalCursos: 1,
    ponderacionesActuales: [
      { label: 'Ponderación Checklist', score: 3.0 },
      { label: 'Ponderación Coordinador', score: 3.5 },
      { label: 'Ponderación Autoevaluación', score: 4.0 },
      { label: 'Ponderación Evaluaciones', score: 3.2 },
      { label: 'Ponderación Apoyo', score: 2.8 },
      { label: 'Ponderación CEAT', score: 3.2 }
    ],
    cursosActuales: [
      { id: 201, nombre: "Matemática Discreta", estado: "Deficiente", score: 3.2 }
    ],
    semestres: [
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 3.2,
        nivel: "Deficiente",
        cursos: [
          {
            codigo: "MAT201",
            nombre: "Matemática Discreta",
            creditos: 4,
            punteoFinal: 3.2,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 3.0, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 4.0, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 3.5, color: "#FFD700" },
              { nombre: "Checklist", valor: 2.8, color: "#6b7280" },
            ],
            comentarios: ["Las explicaciones no son claras.", "Ritmo muy rápido."],
            sugerencias: ["Se recomienda capacitación pedagógica."],
          },
        ],
      },
    ],
    visitas: [],
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
  },
  {
    id: 3,
    nombre: "Pedro José García Moreno",
    codigo: "CAT - 9831730",
    iniciales: "PG",
    cursos: 3,
    facultad: "Ingeniería",
    departamento: "Ingeniería Civil",
    tipo: "Tiempo Completo",
    ponderacion: 6.5,
    estado: "Buena",
    creditosTotales: 12,
    totalCursos: 3,
    ponderacionesActuales: [
      { label: 'Ponderación Checklist', score: 6.5 },
      { label: 'Ponderación Coordinador', score: 7.0 },
      { label: 'Ponderación Autoevaluación', score: 6.8 },
      { label: 'Ponderación Evaluaciones', score: 6.2 },
      { label: 'Ponderación Apoyo', score: 6.5 },
      { label: 'Ponderación CEAT', score: 6.5 }
    ],
    cursosActuales: [
      { id: 301, nombre: "Física I", estado: "Buena", score: 6.5 },
      { id: 302, nombre: "Cálculo Diferencial", estado: "Buena", score: 6.8 },
      { id: 303, nombre: "Álgebra Lineal", estado: "Buena", score: 6.2 },
    ],
    semestres: [
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 6.5,
        nivel: "Buena",
        cursos: [
          {
            codigo: "FIS101",
            nombre: "Física I",
            creditos: 4,
            punteoFinal: 6.5,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 6.2, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 7.0, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 6.5, color: "#FFD700" },
              { nombre: "Checklist", valor: 6.0, color: "#6b7280" },
            ],
            comentarios: ["Buen dominio teórico.", "Podría mejorar los ejemplos."],
            sugerencias: ["Más práctica en laboratorio."],
          },
        ],
      },
    ],
    visitas: [
      {
        id: 301, numero: 1, fecha: "10 oct - 2025", materia: "Física I",
        punteo: 6.5, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 9831730",
        color: "#F5C518",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes"],
        criterios: 3,
        evaluacionesGuardadas: [
          { completado: true, score: 7 }, { completado: true, score: 6 },
          { completado: true, score: 6 },
        ],
        observacionesGuardadas: "Buen conocimiento del tema, mejorar didáctica.",
      },
    ],
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
  },
  {
    id: 4,
    nombre: "Sandra Elena López Torres",
    codigo: "CAT - 9203841",
    iniciales: "SL",
    cursos: 1,
    facultad: "Ingeniería",
    departamento: "Ingeniería Química",
    tipo: "Tiempo Parcial",
    ponderacion: 4.9,
    estado: "Deficiente",
    creditosTotales: 3,
    totalCursos: 1,
    ponderacionesActuales: [
      { label: 'Ponderación Checklist', score: 5.0 },
      { label: 'Ponderación Coordinador', score: 4.5 },
      { label: 'Ponderación Autoevaluación', score: 5.2 },
      { label: 'Ponderación Evaluaciones', score: 4.8 },
      { label: 'Ponderación Apoyo', score: 5.0 },
      { label: 'Ponderación CEAT', score: 4.9 }
    ],
    cursosActuales: [
      { id: 401, nombre: "Química General", estado: "Deficiente", score: 4.9 }
    ],
    semestres: [
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 4.9,
        nivel: "Deficiente",
        cursos: [
          {
            codigo: "QUI101",
            nombre: "Química General",
            creditos: 3,
            punteoFinal: 4.9,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 4.5, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 5.5, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 5.0, color: "#FFD700" },
              { nombre: "Checklist", valor: 4.8, color: "#6b7280" },
            ],
            comentarios: ["Falta preparación.", "Las evaluaciones no son claras."],
            sugerencias: ["Revisión del plan de clase."],
          },
        ],
      },
    ],
    visitas: [],
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
  },
  {
    id: 5,
    nombre: "Luis Diego Ramírez Ordóñez",
    codigo: "CAT - 9831038",
    iniciales: "LR",
    cursos: 2,
    facultad: "Ingeniería",
    departamento: "Ingeniería en Sistemas",
    tipo: "Tiempo Completo",
    ponderacion: 7.5,
    estado: "Excelente",
    creditosTotales: 8,
    totalCursos: 2,
    ponderacionesActuales: [
      { label: 'Ponderación Checklist', score: 7.5 },
      { label: 'Ponderación Coordinador', score: 8.0 },
      { label: 'Ponderación Autoevaluación', score: 7.8 },
      { label: 'Ponderación Evaluaciones', score: 7.2 },
      { label: 'Ponderación Apoyo', score: 7.5 },
      { label: 'Ponderación CEAT', score: 7.5 }
    ],
    cursosActuales: [
      { id: 501, nombre: "Programación I", estado: "Excelente", score: 7.5 },
      { id: 502, nombre: "Bases de Datos", estado: "Excelente", score: 7.8 },
    ],
    semestres: [
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 7.5,
        nivel: "Excelente",
        cursos: [
          {
            codigo: "PRG101",
            nombre: "Programación I",
            creditos: 4,
            punteoFinal: 7.5,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 7.2, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 8.0, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 7.5, color: "#FFD700" },
              { nombre: "Checklist", valor: 7.0, color: "#6b7280" },
            ],
            comentarios: ["Buen manejo del grupo.", "Explica bien los conceptos."],
            sugerencias: ["Mantener el ritmo actual."],
          },
        ],
      },
    ],
    visitas: [
      {
        id: 501, numero: 1, fecha: "05 nov - 2025", materia: "Programación I",
        punteo: 7.5, nombre: "Observacion Pedagogica", codigoDocente: "CAT - 9831038",
        color: "#22c55e",
        criteriosList: ["Claridad en la explicacion", "Dominio del contenido", "Interaccion con estudiantes", "Puntualidad y orden"],
        criterios: 4,
        evaluacionesGuardadas: [
          { completado: true, score: 7 }, { completado: true, score: 8 },
          { completado: true, score: 7 }, { completado: true, score: 8 },
        ],
        observacionesGuardadas: "Buen manejo del grupo, continuar con la metodología.",
      },
    ],
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
  },
  {
    id: 6,
    nombre: "Luis Javier Ramírez Maldonado",
    codigo: "CAT - 9831790",
    iniciales: "LM",
    cursos: 2,
    facultad: "Ingeniería",
    departamento: "Ingeniería Mecánica",
    tipo: "Tiempo Parcial",
    ponderacion: 6.9,
    estado: "Buena",
    creditosTotales: 8,
    totalCursos: 2,
    ponderacionesActuales: [
      { label: 'Ponderación Checklist', score: 7.0 },
      { label: 'Ponderación Coordinador', score: 6.8 },
      { label: 'Ponderación Autoevaluación', score: 7.2 },
      { label: 'Ponderación Evaluaciones', score: 6.5 },
      { label: 'Ponderación Apoyo', score: 7.0 },
      { label: 'Ponderación CEAT', score: 6.9 }
    ],
    cursosActuales: [
      { id: 601, nombre: "Termodinámica", estado: "Buena", score: 6.9 },
      { id: 602, nombre: "Mecánica de Fluidos", estado: "Buena", score: 7.2 },
    ],
    semestres: [
      {
        id: "s1-2025",
        label: "Semestre I - 2025",
        calificacion: 6.9,
        nivel: "Buena",
        cursos: [
          {
            codigo: "MEC301",
            nombre: "Termodinámica",
            creditos: 4,
            punteoFinal: 6.9,
            ponderaciones: [
              { nombre: "Eval. Estudiantes", valor: 6.5, color: "#FFD700" },
              { nombre: "Autoevaluación", valor: 7.5, color: "#1a2a4a" },
              { nombre: "Coordinador", valor: 7.0, color: "#FFD700" },
              { nombre: "Checklist", valor: 6.8, color: "#6b7280" },
            ],
            comentarios: ["Buen conocimiento.", "A veces va muy rápido."],
            sugerencias: ["Reducir el ritmo en temas complejos."],
          },
        ],
      },
    ],
    visitas: [],
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
  },
];

// Alias para compatibilidad con código existente
export const detalleDocenteMarta = listaDocentesGlobal[0];

// --- DATOS DEL MÓDULO DE COORDINADORES ---
export const listaCoordinadores = [
  { id: 1, nombre: "Juan Rodríguez", iniciales: "JR", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "jrodriguez@univ.edu.gt", esAdmin: true },
  { id: 2, nombre: "Ana Mendoza", iniciales: "AM", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "amendoza@univ.edu.gt", esAdmin: false },
  { id: 3, nombre: "Pedro García", iniciales: "PG", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "pgarcia@univ.edu.gt", esAdmin: false },
  { id: 4, nombre: "Sandra López", iniciales: "SL", facultad: "Ingeniería", carrera: "Informática y sistemas", correo: "slopez@univ.edu.gt", esAdmin: false }
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
    { id: 1, nombre: "Marta Alvarado Fuentes", codigo: "CAT-9831751", cursos: 2, score: 9.25, estado: "Excelente" },
    { id: 3, nombre: "Pedro José García", codigo: "CAT-9831730", cursos: 3, score: 6.5, estado: "Buena" },
    { id: 2, nombre: "Ana Elizabeth Mendoza", codigo: "CAT-9831982", cursos: 1, score: 3.2, estado: "Deficiente" }
  ],
  historico: [
    { semestre: "Sem. II 2024", promedio: 8.5, docentesEvaluados: 14 },
    { semestre: "Sem. I 2024", promedio: 8.2, docentesEvaluados: 12 }
  ]
};

export const listaSemestres = [
  { id: 1, semestre: "Semestre II", anio: "2026", estado: "Proximo" },
  { id: 2, semestre: "Semestre I", anio: "2026", estado: "Activo" },
  { id: 3, semestre: "Semestre II", anio: "2025", estado: "Finalizado" },
  { id: 4, semestre: "Semestre I", anio: "2025", estado: "Finalizado" },
];
