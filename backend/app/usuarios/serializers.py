from rest_framework import serializers
from .models import Usuario, Docente


class UsuarioSerializer(serializers.ModelSerializer):
    CarreraNombre = serializers.CharField(source='carrera.nombre', read_only=True)
    FacultadNombre = serializers.CharField(source='facultad.nombre', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'carrera', 'CarreraNombre', 'facultad', 'FacultadNombre',
            'is_active', 'is_staff', 'date_joined'
        ]
        
        # La contraseña nunca debe exponerse
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class DocenteSerializer(serializers.ModelSerializer):
    FacultadNombre = serializers.CharField(source='facultad.nombre', read_only=True)

    class Meta:
        model = Docente
        fields = ['id', 'codigo_docente', 'nombre_completo', 'facultad', 'FacultadNombre', 'tipo_plan']