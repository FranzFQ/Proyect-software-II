from rest_framework import serializers
from .models import Carrera, Pensum, Semestre, Curso

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ['id', 'nombre']

class PensumSerializer(serializers.ModelSerializer):
    CarreraNombre = serializers.CharField(source='carrera.nombre', read_only=True)

    class Meta:
        model = Pensum
        fields = ['id', 'carrera', 'CarreraNombre', 'nombre', 'activo']

class SemestreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semestre
        fields = ['id', 'anio', 'ciclo', 'activo_para_carga', 'visible']

class CursoSerializer(serializers.ModelSerializer):
    PensumNombre = serializers.CharField(source='pensum.nombre', read_only=True)
    CarreraNombre = serializers.CharField(source='pensum.carrera.nombre', read_only=True) 

    class Meta:
        model = Curso
        fields = ['id', 'pensum', 'PensumNombre', 'CarreraNombre', 'nombre_curso', 'creditos']