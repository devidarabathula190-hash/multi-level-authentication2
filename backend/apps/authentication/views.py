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
        print(f"DEBUG: Registration attempt for login_id: {request.data.get('login_id')}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                print(f"SUCCESS: User {user.id} created.")
                return Response({
                    "success": True,
                    "user_id": user.id,
                    "message": "Registration successful. Awaiting admin approval."
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"CRITICAL ERROR during registration: {str(e)}")
                return Response({"error": "Database error", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"VALIDATION FAILED: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            login_id = serializer.validated_data['login_id']
            password = serializer.validated_data['password']
            print(f"DEBUG: Login attempt for login_id: {login_id}")
            
            # Django's authenticate expects 'username' and 'password'
            user = authenticate(request, username=login_id, password=password)

            if user is not None:
                print(f"SUCCESS: Login successful for {login_id}. Status: {user.status}")
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
                            'is_staff': user.is_staff,
                            'balance': user.balance
                        }
                    })
                else:
                    return Response({'error': 'Your account is inactive. Please contact admin for activation.'}, 
                                     status=status.HTTP_403_FORBIDDEN)
            
            print(f"FAIL: Login failed for {login_id}. Invalid credentials.")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
