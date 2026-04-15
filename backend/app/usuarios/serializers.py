from rest_framework import serializers
from .models import Usuario, Docente
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=username_or_email,
            password=password
        )

        # 🔥 SI NO ENCUENTRA POR USERNAME → BUSCA POR EMAIL
        if not user:
            from usuarios.models import Usuario
            try:
                user_obj = Usuario.objects.get(email=username_or_email)
                user = authenticate(
                    request=self.context.get("request"),
                    username=user_obj.username,
                    password=password
                )
            except Usuario.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Credenciales incorrectas")

        data = super().validate({
            "username": user.username,
            "password": password
        })

        return data