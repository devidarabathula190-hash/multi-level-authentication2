from rest_framework import serializers
from apps.users.models import User
from apps.face_recognition_app.models import FaceData

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    face_image = serializers.ImageField(required=False)
    face_image_base64 = serializers.CharField(required=False, write_only=True)
    face_encoding = serializers.ListField(child=serializers.FloatField(), required=False)

    class Meta:
        model = User
        fields = ['name', 'login_id', 'mobile', 'email', 'address', 'password', 'face_image', 'face_image_base64', 'face_encoding']

    def create(self, validated_data):
        try:
            face_image = validated_data.pop('face_image', None)
            face_image_base64 = validated_data.pop('face_image_base64', None)
            face_encoding = validated_data.pop('face_encoding', None)
            password = validated_data.pop('password')
            
            # If base64 is provided but not file, convert it
            if not face_image and face_image_base64:
                from apps.face_recognition_app.utils import base64_to_file
                face_image = base64_to_file(face_image_base64)

            user = User.objects.create_user(**validated_data, password=password)
            user.status = 'ACTIVE'  # Auto-activate for demo — admin can deactivate if needed
            user.save()

            # Handle face data if provided
            if face_image:
                from apps.face_recognition_app.utils import get_face_encoding
                import numpy as np
                
                if not face_encoding:
                    encoding = get_face_encoding(face_image)
                else:
                    encoding = np.array(face_encoding)

                if encoding is not None:
                    encoding_bytes = np.array(encoding, dtype=np.float64).tobytes()
                    FaceData.objects.create(user=user, face_image=face_image, face_encoding=encoding_bytes)
            
            return user
        except Exception as e:
            print(f"REGISTRATION ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            # If it's an integrity error (like unique constraint), raise a ValidationError so DRF returns 400 with details
            from django.db import IntegrityError
            if isinstance(e, IntegrityError):
                 raise serializers.ValidationError({"error": "This account detail (ID, Email or Mobile) is already registered."})
            raise serializers.ValidationError({"error": f"System error: {str(e)}"})

class LoginSerializer(serializers.Serializer):
    login_id = serializers.CharField()
    password = serializers.CharField(write_only=True)
