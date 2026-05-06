import pandas as pd
import unicodedata
from usuarios.models import Docente
from academico.models import Curso, Semestre, Facultad
from evaluaciones.models import CursoDado

def normalizar_texto(texto):
    if not texto or pd.isna(texto):
        return ""
    # Eliminar acentos y pasar a mayúsculas
    texto = str(texto).strip()
    texto = unicodedata.normalize('NFD', texto)
    return "".join([c for c in texto if not unicodedata.combining(c)]).upper()

class NominaParser:
    @classmethod
    def procesar(cls, archivo, semestre=None):
        df = pd.read_excel(archivo, header=10) # Usar header=10 para detectar columnas correctamente
        df = df.dropna(axis=1, how='all')
        
        if not semestre:
            semestre = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre:
            return "Error: No hay un semestre activo para carga configurado."

        # --- OPTIMIZACIÓN: CACHE EN MEMORIA ---
        facultades_cache = {normalizar_texto(f.nombre): f for f in Facultad.objects.all()}
        docentes_cache = {str(d.codigo_docente): d for d in Docente.objects.all()}
        # Cache de cursos normalizado
        cursos_cache = {normalizar_texto(c.nombre_curso): c for c in Curso.objects.all()}
        
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

        print(f"--- Iniciando procesamiento de nómina (Semestre: {semestre}) ---")

        for i, fila in df.iterrows():
            # Intentar obtener datos de la fila
            docente_nombre = fila.get('Docente')
            codigo_docente = fila.get('Código  docente')
            nombre_facultad = fila.get('Facultad')
            nombre_curso_raw = fila.get('Curso')

            # Actualizar estado si hay info nueva
            if not pd.isna(docente_nombre): docente_actual = str(docente_nombre).strip()
            if not pd.isna(codigo_docente): codigo_actual = str(codigo_docente).strip().split('.')[0]
            if not pd.isna(nombre_facultad): facultad_actual = str(nombre_facultad).strip()

            # Si no hay curso en esta fila, saltamos (pero mantenemos el docente_actual)
            if pd.isna(nombre_curso_raw):
                continue

            if not docente_actual or not codigo_actual:
                continue

            # 0. Manejo de Facultad
            fac_norm = normalizar_texto(facultad_actual)
            if facultad_actual and fac_norm not in facultades_cache and fac_norm not in facultades_nuevas:
                facultades_nuevas[fac_norm] = Facultad(nombre=facultad_actual)

            # 1. Manejo de Docente
            if codigo_actual not in docentes_cache and codigo_actual not in docentes_nuevos:
                f_obj = facultades_cache.get(fac_norm) or facultades_nuevas.get(fac_norm)
                docentes_nuevos[codigo_actual] = Docente(
                    codigo_docente=codigo_actual,
                    nombre_completo=docente_actual,
                    facultad=f_obj
                )

            # 2. Manejo de Cursos (Normalizado)
            nombre_curso_norm = normalizar_texto(nombre_curso_raw)
            curso_obj = cursos_cache.get(nombre_curso_norm)
            
            if not curso_obj:
                # Búsqueda parcial si no hay match exacto normalizado
                curso_obj = next((c for n, c in cursos_cache.items() if nombre_curso_norm in n or n in nombre_curso_norm), None)
            
            if not curso_obj:
                print(f"  [!] Curso no encontrado: '{nombre_curso_raw}' (Normalizado: {nombre_curso_norm})")
                continue

            # 3. Preparar CursoDado
            doc_obj = docentes_cache.get(codigo_actual) or docentes_nuevos.get(codigo_actual)
            seccion = str(fila.get('Sección', 'A')).strip().split('.')[0]
            jornada = str(fila.get('Jornada', 'N/A')).strip()
            
            key = f"{curso_obj.id}-{doc_obj.id}-{semestre.id}-{seccion}"
            if key not in cursos_dados_existentes:
                objetos_a_crear.append(CursoDado(
                    curso=curso_obj,
                    docente=doc_obj,
                    semestre=semestre,
                    seccion=seccion,
                    jornada=jornada
                ))
                cursos_dados_existentes[key] = True

        # --- PERSISTENCIA ---
        if facultades_nuevas:
            Facultad.objects.bulk_create(facultades_nuevas.values())
            facultades_cache.update({normalizar_texto(f.nombre): f for f in Facultad.objects.filter(nombre__in=[fn.nombre for fn in facultades_nuevas.values()])})

        if docentes_nuevos:
            # Asegurar facultades en docentes nuevos
            for d in docentes_nuevos.values():
                if d.facultad:
                    d.facultad = facultades_cache.get(normalizar_texto(d.facultad.nombre))
            Docente.objects.bulk_create(docentes_nuevos.values())
            docentes_cache.update({d.codigo_docente: d for d in Docente.objects.filter(codigo_docente__in=docentes_nuevos.keys())})

        if objetos_a_crear:
            # Asegurar objetos relacionados en CursoDado
            for cd in objetos_a_crear:
                if cd.docente.codigo_docente in docentes_cache:
                    cd.docente = docentes_cache[cd.docente.codigo_docente]
            CursoDado.objects.bulk_create(objetos_a_crear)

        return f"Nómina procesada: {len(objetos_a_crear)} nuevas asignaciones creadas."
