// esto solo es para simular datos que luego vendrán de la API, así podemos avanzar con el desarrollo del frontend sin esperar al backends
export const dashboardMetrics = {
  totalDocentes: 124,
  promedioGeneral: 85.4,
  docentesRiesgo: 12, // Docentes por debajo del umbral
  evaluacionesCompletadas: "95%"
};

// Simulamos la lista de docentes y sus notas en los 5 criterios mencionados en el PRD
export const docentesData = [
  {
    id: 1,
    nombre: "Ing. Carlos Mendoza",
    curso: "Física Básica",
    puntajeTotal: 92,
    estado: "success", // Usamos las variables de Tailwind que configuramos
    desglose: {
      alumnos: 95,
      coordinador: 90,
      ceat: 100,
      apoyo: 85,
      autoevaluacion: 90
    }
  },
  {
    id: 2,
    nombre: "Licda. María Fernanda Ortiz",
    curso: "Matemática Intermedia",
    puntajeTotal: 74,
    estado: "warning",
    desglose: {
      alumnos: 70,
      coordinador: 80,
      ceat: 75,
      apoyo: 70,
      autoevaluacion: 75
    }
  },
  {
    id: 3,
    nombre: "Ing. Roberto Juárez",
    curso: "Programación Avanzada",
    puntajeTotal: 58,
    estado: "danger",
    desglose: {
      alumnos: 50,
      coordinador: 60,
      ceat: 50,
      apoyo: 80,
      autoevaluacion: 50
    }
  }
];