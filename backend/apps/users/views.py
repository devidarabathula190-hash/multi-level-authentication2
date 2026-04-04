from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import UserSerializer

# ✅ LOGIN VIEW (IMPORTANT)
class LoginView(APIView):
    def post(self, request):
        login_id = request.data.get("login_id")
        password = request.data.get("password")

        user = authenticate(username=login_id, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "status": "success",
                "token": token.key
            })
        else:
            return Response({
                "status": "fail",
                "message": "Invalid credentials"
            }, status=status.HTTP_400_BAD_REQUEST)


# ✅ ADMIN USERS LIST
class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


# ✅ ADMIN ACTION
class AdminUserActionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, user_id, action):
        try:
            user = User.objects.get(id=user_id)

            if action == 'activate':
                user.status = 'ACTIVE'

            elif action == 'deactivate':
                user.status = 'INACTIVE'

            elif action == 'delete':
                if user.is_staff:
                    return Response(
                        {'error': 'Cannot delete staff user'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.delete()
                return Response({'success': True, 'message': 'User deleted'})

            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.save()
            return Response({
                'success': True,
                'message': f'User {action}d successfully',
                'user': UserSerializer(user).data
            })

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# ✅ USER PROFILE
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ✅ RECEIVERS LIST
class ReceiverListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(status='ACTIVE').exclude(id=self.request.user.id)