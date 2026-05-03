# Proyect-software-II

## Estrucura de los convencional commits

tipo(alcance opcional): descripción corta

### Tipos de comunes de los convencional commits
feat: Se añade una nueva funcionalidad.

fix: Se corrige un error.

docs: Cambios en documentación.

style: Cambios de formato (espacios, punto y coma, etc.) sin afectar la lógica.

refactor: Reestructuración del código sin cambiar su comportamiento.

test: Agregar o modificar pruebas.

chore: Tareas de mantenimiento o configuración.

perf: Mejoras de rendimiento.

build: Cambios relacionados con el sistema de construcción o dependencias.

ci: Cambios en integración continua.

## Backend

## Pre-requisitos para backend
- Tener instalado python 3.10 en adelante
- Tener instalado pip cualquier version de pip
- Tener cualquier editor de codigo
- Tener conocimiento de Github

### Está organizado de la siguiente manera:

app/api → Proyecto de django

app/academico → App para la administracion academica

app/evaluaciones → App para la gestion de evaluaciones

app/usuarios → App para la gestion de usuarios

requiment.txt → Documento con las dependencias del proyecto

### Ejecutar el proyecto
¡Aviso: En caso de ser primera vez en el proyecto se necesita un entorno virtual de python!
Ejecutar en windows:
python -m venv .venv
Para activar:
.venv\script\activate

Ejecutar en macOS y linux:
python -m venv venv
Para activar:
source venv/bin/activate

1. Clonar el repositorio

2. Ubicarse en proyecto en el carpeta de backend

3. Instalar las dependencias: pip install -r requirements.txt

4. Ejecutar el servidor de desarrollo: python app/manage.py runserver

5. Dirigirse a la siguiente ruta donde estara disponible: http://localhost:8000/

## Frontend

## Pre-requisitos para frontend
- Tener instalado nvm y node
- Tener cualquier editor de codigo
- Tener conocimiento de Github

### Está organizado de la siguiente manera:

src/assets/ → Imagenes, iconos y fuentes

src/components/ → Componentes reutilizables

src/pages/ → Vistas principales de la aplicación

src/services/ → Conexión con APIs externas o backend

src/routes/ → Configuración de rutas

src/hooks/ → Hooks personalizados

src/context/ → Manejo de estado global

src/utils/ → Manejo de funciones auxiliares

src/css/ → Manejo de archivos .css del proyecto

public/ → Archivos estáticos

### Ejecutar el proyecto

1. Clonar el repositorio

2. Ubicarse en proyecto en el carpeta de frontend

3. Instalar las dependencias: npm install

4. Ejecutar el servidor de desarrollo: npm run dev

5. La aplicacion estará disponible en la siguiente ruta: http://localhost:5173/
