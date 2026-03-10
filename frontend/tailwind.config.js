/** @type {import('tailwindcss').Config} */
export default {
  // 1. Especificamos los archivos donde Tailwind debe buscar clases para generar el CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 2. Definimos nuestra paleta de colores global para la aplicación
      colors: {
        url: {
          blue: '#112240',    // Azul oscuro institucional (Sidebar y Login)
          yellow: '#FFC107',  // Amarillo institucional (Botones principales)
          light: '#F4F7FE',   // Gris muy claro para el fondo general de la app
        },
        status: {
          success: '#4ADE80', // Verde para "Excelente" o "Bueno"
          warning: '#FBBF24', // Amarillo para "Regular"
          danger: '#F87171',  // Rojo para "Revisar" o "Bajo rendimiento"
        }
      },
      // 3. fuente global para toda la aplicación
      fontFamily: {
        sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}