import pandas as pd
from usuarios.models import Docente
from academico.models import Curso, Semestre, Facultad
from evaluaciones.models import CursoDado

class NominaParser:
    @classmethod
    def procesar(cls, archivo, semestre=None):
        df = pd.read_excel(archivo, skiprows=10)
        df = df.dropna(axis=1, how='all')
        
        if not semestre:
            semestre = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre:
            return "Error: No hay un semestre activo para carga configurado."

        # --- OPTIMIZACIÓN: CACHE EN MEMORIA ---
        # Cargamos todo lo necesario antes del bucle para evitar miles de queries
        facultades_cache = {f.nombre: f for f in Facultad.objects.all()}
        docentes_cache = {d.codigo_docente: d for d in Docente.objects.all()}
        cursos_cache = {c.nombre_curso: c for c in Curso.objects.all()}
        
        # Para evitar duplicados en el mismo proceso
        cursos_dados_existentes = {
            f"{cd.curso_id}-{cd.docente_id}-{cd.semestre_id}-{cd.seccion}": cd 
            for cd in CursoDado.objects.filter(semestre=semestre)
        }

        docente_actual = None
        codigo_actual = None
        facultad_actual = None
        
        objetos_a_crear = []
        docentes_nuevos = {}
        facultades_nuevas = {}

        for _, fila in df.iterrows():
            if pd.isna(fila.get('Curso')) and pd.isna(fila.get('Docente')) and pd.isna(fila.get('Código  docente')):
                continue

            docente_nombre = fila.get('Docente')
            codigo_docente = fila.get('Código  docente')
            nombre_facultad = fila.get('Facultad')

            if not pd.isna(docente_nombre): docente_actual = str(docente_nombre).strip()
            if not pd.isna(codigo_docente): codigo_actual = str(codigo_docente).strip().split('.')[0]
            if not pd.isna(nombre_facultad): facultad_actual = str(nombre_facultad).strip()

            if not docente_actual or not codigo_actual:
                continue

            # 0. Manejo de Facultad (Cache + Nuevas)
            if facultad_actual and facultad_actual not in facultades_cache and facultad_actual not in facultades_nuevas:
                facultades_nuevas[facultad_actual] = Facultad(nombre=facultad_actual)

            # 1. Manejo de Docente (Cache + Nuevos)
            if codigo_actual not in docentes_cache and codigo_actual not in docentes_nuevos:
                # Obtenemos la facultad del cache o de las nuevas
                f_obj = facultades_cache.get(facultad_actual) or facultades_nuevas.get(facultad_actual)
                docentes_nuevos[codigo_actual] = Docente(
                    codigo_docente=codigo_actual,
                    nombre_completo=docente_actual,
                    facultad=f_obj
                )

            # 2. Manejo de Cursos
            nombre_curso = str(fila.get('Curso')).strip()
            curso_obj = cursos_cache.get(nombre_curso)
            if not curso_obj:
                # Busqueda flexible si no esta en cache exacto
                curso_obj = next((c for n, c in cursos_cache.items() if nombre_curso in n), None)
            
            if not curso_obj:
                continue # O crear uno genérico si prefieres

            # 3. Preparar CursoDado
            doc_obj = docentes_cache.get(codigo_actual) or docentes_nuevos.get(codigo_actual)
            seccion = str(fila.get('Sección')).strip().split('.')[0]
            jornada = str(fila.get('Jornada')).strip()
            
            key = f"{curso_obj.id}-{doc_obj.id}-{semestre.id}-{seccion}"
            if key not in cursos_dados_existentes:
                objetos_a_crear.append(CursoDado(
                    curso=curso_obj,
                    docente=doc_obj,
                    semestre=semestre,
                    seccion=seccion,
                    jornada=jornada
                ))
                cursos_dados_existentes[key] = True # Marcar para no duplicar en el mismo Excel

        # --- PERSISTENCIA MASIVA (Atomic Operations) ---
        if facultades_nuevas:
            Facultad.objects.bulk_create(facultades_nuevas.values())
            # Refrescar cache de facultades para los docentes nuevos
            facultades_cache.update({f.nombre: f for f in Facultad.objects.filter(nombre__in=facultades_nuevas.keys())})
            for d in docentes_nuevos.values():
                if d.facultad and d.facultad.nombre in facultades_cache:
                    d.facultad = facultades_cache[d.facultad.nombre]

        if docentes_nuevos:
            Docente.objects.bulk_create(docentes_nuevos.values())
            # Refrescar cache de docentes para los CursoDado
            docentes_cache.update({d.codigo_docente: d for d in Docente.objects.filter(codigo_docente__in=docentes_nuevos.keys())})
            for cd in objetos_a_crear:
                if cd.docente.codigo_docente in docentes_cache:
                    cd.docente = docentes_cache[cd.docente.codigo_docente]

        if objetos_a_crear:
            CursoDado.objects.bulk_create(objetos_a_crear)

        return f"Nómina procesada: {len(objetos_a_crear)} nuevas asignaciones creadas."
