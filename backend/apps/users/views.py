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
                try:
                    from apps.face_recognition_app.models import FaceData
                    from apps.otp.models import OTPRecord
                    from apps.transactions.models import Transaction
                    # Delete all related records first (belt and suspenders over CASCADE)
                    FaceData.objects.filter(user=user).delete()
                    OTPRecord.objects.filter(user=user).delete()
                    Transaction.objects.filter(sender=user).delete()
                    Transaction.objects.filter(receiver=user).delete()
                    print(f"DEBUG DELETE: Related data cleaned for user '{user.login_id}'")
                    login_id = user.login_id
                    user.delete()
                    print(f"SUCCESS: User '{login_id}' permanently deleted from database.")
                    return Response({'success': True, 'message': f'User {login_id} deleted successfully'})
                except Exception as del_err:
                    print(f"CRITICAL: User delete failed for {user.login_id}: {del_err}")
                    return Response({'error': f'Delete failed: {str(del_err)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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