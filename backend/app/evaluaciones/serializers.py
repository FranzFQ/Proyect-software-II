from rest_framework import serializers
from .models import (
    CriterioEvaluacion,
    CursoDado,
    ConfiguracionPonderacion,
    EvaluacionConsolidada,
    EvaluacionCurso,
    ChecklistObservation,
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

    class Meta:
        model = EvaluacionCurso
        fields = [
            'id',
            'curso_dado', 'CursoNombre',
            'puntaje_curso',
        ]


class EvaluacionConsolidadaSerializer(serializers.ModelSerializer):
    DocenteNombre  = serializers.CharField(source='docente.nombre_completo', read_only=True)
    SemestreStr    = serializers.CharField(source='semestre.__str__', read_only=True)

    class Meta:
        model = EvaluacionConsolidada
        fields = [
            'id',
            'docente', 'DocenteNombre',
            'semestre', 'SemestreStr',
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


class ChecklistObservationSerializer(serializers.ModelSerializer):
    CursoDadoStr = serializers.CharField(source='curso_dado.__str__', read_only=True)
    UsuarioNombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = ChecklistObservation
        fields = [
            'id',
            'curso_dado', 'CursoDadoStr',
            'titulo',
            'usuario', 'UsuarioNombre',
            'fecha_observacion',
            'datos',
        ]
        read_only_fields = ['fecha_observacion']