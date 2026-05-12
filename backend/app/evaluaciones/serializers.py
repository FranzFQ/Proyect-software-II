from rest_framework import serializers
from .models import (
    CriterioEvaluacion,
    CursoDado,
    ConfiguracionPonderacion,
    EvaluacionConsolidada,
    EvaluacionCurso,
    ChecklistObservation,
    Checklist,
    Tipo,
    AnalisisTexto,
)


class CriterioEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioEvaluacion
        fields = ['id', 'nombre', 'alcance']


class CursoDadoSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar nombres
    CursosNombre    = serializers.CharField(source='curso.nombre_curso', read_only=True)
    DocenteNombre  = serializers.CharField(source='docente.nombre_completo', read_only=True)
    SemestreStr    = serializers.CharField(source='semestre.__str__', read_only=True)

    class Meta:
        model = CursoDado
        fields = [
            'id',
            'curso', 'CursosNombre',
            'docente', 'DocenteNombre',
            'semestre', 'SemestreStr',
            'seccion',
        ]


class ConfiguracionPonderacionSerializer(serializers.ModelSerializer):
    SemestreStr = serializers.CharField(source='semestre.__str__', read_only=True)
    CriterioNombre = serializers.CharField(source='criterio.nombre', read_only=True)

    class Meta:
        model = ConfiguracionPonderacion
        fields = [
            'id',
            'semestre', 'SemestreStr',
            'criterio', 'CriterioNombre',
            'porcentaje_asignado',
        ]


class EvaluacionCursoSerializer(serializers.ModelSerializer):
    CursoNombre = serializers.CharField(source='curso_dado.curso.nombre_curso', read_only=True)
    CriterioNombre = serializers.CharField(source='criterio.nombre', read_only=True)

    class Meta:
        model = EvaluacionCurso
        fields = [
            'id',
            'curso_dado', 'CursoNombre',
            'criterio', 'CriterioNombre',
            'puntaje_curso',
        ]


class EvaluacionConsolidadaSerializer(serializers.ModelSerializer):
    DocenteNombre  = serializers.CharField(source='docente.nombre_completo', read_only=True)
    SemestreStr    = serializers.CharField(source='semestre.__str__', read_only=True)
    CriterioNombre = serializers.CharField(source='criterio.nombre', read_only=True)

    class Meta:
        model = EvaluacionConsolidada
        fields = [
            'id',
            'docente', 'DocenteNombre',
            'semestre', 'SemestreStr',
            'criterio', 'CriterioNombre',
            'puntaje_final',
            'resumen_ia',
        ]


class TipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo
        fields = ['id', 'nombre']


class AnalisisTextoSerializer(serializers.ModelSerializer):
    TipoNombre = serializers.CharField(source='tipo.nombre', read_only=True)
    CursoDadoStr = serializers.CharField(source='curso_dado.__str__', read_only=True)

    class Meta:
        model = AnalisisTexto
        fields = [
            'id',
            'contenido',
            'curso_dado', 'CursoDadoStr',
            'tipo', 'TipoNombre'
        ]

class ChecklistSerializer(serializers.ModelSerializer):
    SemestreStr = serializers.StringRelatedField(source='semestre', read_only=True)
    UsuarioCreadorNombre = serializers.StringRelatedField(source='usuario_creador', read_only=True)

    class Meta:
        model = Checklist
        fields = [
            'id',
            'titulo',
            'datos',
            'activo',
            'punteo',
            'semestre', 'SemestreStr',
            'usuario_creador', 'UsuarioCreadorNombre',
        ]
        read_only_fields = ['usuario_creador']


class ChecklistObservationSerializer(serializers.ModelSerializer):
    CursoDadoStr  = serializers.CharField(source='curso_dado.__str__', read_only=True)
    UsuarioNombre = serializers.CharField(source='usuario.username', read_only=True)
    DocenteNombre = serializers.CharField(source='curso_dado.docente.nombre_completo', read_only=True)
    NombreCurso   = serializers.CharField(source='curso_dado.curso.nombre_curso', read_only=True)
    ChecklistTitulo = serializers.CharField(source='checklist.titulo', read_only=True)

    class Meta:
        model = ChecklistObservation
        fields = [
            'id',
            'curso_dado', 'CursoDadoStr',
            'DocenteNombre', 'NombreCurso',
            'checklist', 'ChecklistTitulo',
            'usuario', 'UsuarioNombre',
            'fecha_observacion',
            'punteo',
            'datos',
        ]
        read_only_fields = ['fecha_observacion']


class ChecklistObservationListSerializer(serializers.ModelSerializer):
    DocenteNombre   = serializers.CharField(source='curso_dado.docente.nombre_completo', read_only=True)
    NombreCurso     = serializers.CharField(source='curso_dado.curso.nombre_curso', read_only=True)
    CodigoDocente   = serializers.CharField(source='curso_dado.docente.codigo_docente', read_only=True)
    ChecklistTitulo = serializers.CharField(source='checklist.titulo', read_only=True)

    class Meta:
        model = ChecklistObservation
        fields = [
            'id',
            'DocenteNombre', 'NombreCurso', 'CodigoDocente',
            'checklist', 'ChecklistTitulo',
            'fecha_observacion',
            'punteo',
            'datos',
        ]