from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from datetime import datetime
import os
from .serializers import RegistrationSerializer, LoginSerializer
from apps.users.models import User

class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer

    def post(self, request, *args, **kwargs):
        log_file = os.path.join(settings.BASE_DIR, 'registration_debug.log')
        with open(log_file, 'a') as f:
            f.write(f"\n[{datetime.now()}] DEBUG: Registration attempt for login_id: {request.data.get('login_id')}\n")
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                try:
                    user = serializer.save()
                    f.write(f"[{datetime.now()}] SUCCESS: User {user.id} created.\n")
                    return Response({
                        "success": True,
                        "user_id": user.id,
                        "message": "Registration successful. Awaiting admin approval."
                    }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    f.write(f"[{datetime.now()}] CRITICAL ERROR: {str(e)}\n")
                    return Response({"error": "Database error", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            f.write(f"[{datetime.now()}] VALIDATION FAILED: {serializer.errors}\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            login_id = serializer.validated_data['login_id']
            password = serializer.validated_data['password']
            user = authenticate(request, login_id=login_id, password=password)

            if user is not None:
                if user.status == 'ACTIVE':
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': {
                            'id': user.id,
                            'name': user.name,
                            'login_id': user.login_id,
                            'email': user.email,
                            'status': user.status,
                            'is_staff': user.is_staff
                        }
                    })
                else:
                    return Response({'error': 'Your account is inactive. Please contact admin for activation.'}, 
                                     status=status.HTTP_403_FORBIDDEN)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
