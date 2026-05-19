import pandas as pd
import unicodedata
from usuarios.models import Docente
from academico.models import Curso, Semestre, Facultad, Carrera
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

        # Mapping de abreviaturas a nombres completos (como vienen en el Pensum)
        mapping_carreras = {
            'IIS': 'Ingeniería en Informática y Sistemas',
            'IC': 'Ingeniería Civil',
            'II': 'Ingeniería Industrial',
        }

        # --- OPTIMIZACIÓN: CACHE EN MEMORIA ---
        facultades_cache = {normalizar_texto(f.nombre): f for f in Facultad.objects.all()}
        docentes_cache = {str(d.codigo_docente): d for d in Docente.objects.all()}
        carreras_cache = {normalizar_texto(c.nombre): c for c in Carrera.objects.all()}
        # Cache de cursos normalizado
        cursos_cache = {normalizar_texto(c.nombre_curso): c for c in Curso.objects.all()}
        
        # Para evitar duplicados
        cursos_dados_existentes = {
            f"{cd.curso_id}-{cd.docente.codigo_docente}-{cd.semestre_id}-{cd.seccion}": True 
            for cd in CursoDado.objects.filter(semestre=semestre).select_related('docente')
        }

        docente_actual = None
        codigo_actual = None
        facultad_actual = None
        carrera_actual = None
        
        objetos_a_crear = []
        docentes_nuevos = {}
        facultades_nuevas = {}
        docentes_a_actualizar = []

        print(f"--- Iniciando procesamiento de nómina (Semestre: {semestre}) ---")

        for i, fila in df.iterrows():
            # Intentar obtener datos de la fila
            docente_nombre = fila.get('Docente')
            codigo_docente = fila.get('Código  docente')
            nombre_facultad = fila.get('Facultad')
            nombre_carrera_raw = fila.get('Carrera')
            nombre_curso_raw = fila.get('Curso')

            # Actualizar estado si hay info nueva
            if not pd.isna(docente_nombre): docente_actual = str(docente_nombre).strip()
            if not pd.isna(codigo_docente): codigo_actual = str(codigo_docente).strip().split('.')[0]
            if not pd.isna(nombre_facultad): facultad_actual = str(nombre_facultad).strip()
            
            if not pd.isna(nombre_carrera_raw):
                carrera_abrev = str(nombre_carrera_raw).strip().upper()
                nombre_carrera_completo = mapping_carreras.get(carrera_abrev, carrera_abrev)
                carrera_norm = normalizar_texto(nombre_carrera_completo)
                carrera_actual = carreras_cache.get(carrera_norm)
                # Búsqueda flexible si no hay match exacto
                if not carrera_actual:
                    carrera_actual = next((c for n, c in carreras_cache.items() if carrera_norm in n or n in carrera_norm), None)

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
            doc_obj = docentes_cache.get(codigo_actual)
            if not doc_obj and codigo_actual not in docentes_nuevos:
                f_obj = facultades_cache.get(fac_norm) or facultades_nuevas.get(fac_norm)
                doc_obj = Docente(
                    codigo_docente=codigo_actual,
                    nombre_completo=docente_actual,
                    facultad=f_obj,
                    carrera=carrera_actual
                )
                docentes_nuevos[codigo_actual] = doc_obj
            elif doc_obj:
                # Si el docente ya existe pero no tiene carrera, o cambió (opcionalmente podrías actualizarla aquí)
                if not doc_obj.carrera and carrera_actual:
                    doc_obj.carrera = carrera_actual
                    if doc_obj not in docentes_a_actualizar:
                        docentes_a_actualizar.append(doc_obj)

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
            doc_ref = doc_obj if doc_obj else docentes_cache.get(codigo_actual) or docentes_nuevos.get(codigo_actual)
            seccion = str(fila.get('Sección', 'A')).strip().split('.')[0]
            jornada = str(fila.get('Jornada', 'N/A')).strip()
            
            # CLAVE DE UNICIDAD: curso + codigo_docente + semestre + seccion
            key = f"{curso_obj.id}-{codigo_actual}-{semestre.id}-{seccion}"
            
            if key not in cursos_dados_existentes:
                objetos_a_crear.append(CursoDado(
                    curso=curso_obj,
                    docente=doc_ref,
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

        if docentes_a_actualizar:
            Docente.objects.bulk_update(docentes_a_actualizar, ['carrera'])

        if objetos_a_crear:
            # Asegurar objetos relacionados en CursoDado
            for cd in objetos_a_crear:
                if cd.docente.codigo_docente in docentes_cache:
                    cd.docente = docentes_cache[cd.docente.codigo_docente]
            CursoDado.objects.bulk_create(objetos_a_crear)

        return f"Nómina procesada: {len(objetos_a_crear)} nuevas asignaciones creadas."
