from rest_framework import generics, status, permissions
from rest_framework.response import Response
import uuid
from .models import Transaction
from .serializers import TransactionSerializer
from apps.face_recognition_app.models import FaceData
from apps.face_recognition_app.utils import compare_faces, base64_to_file
from apps.otp.models import OTPRecord
from apps.otp.utils import send_otp_email
from apps.users.models import User
from django.db import transaction
from django.utils import timezone

class InitiateTransactionView(generics.CreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data['sender'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            # Generate pending transaction
            txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
            txn = Transaction.objects.create(
                sender=request.user,
                receiver=serializer.validated_data['receiver'],
                amount=serializer.validated_data['amount'],
                purpose=serializer.validated_data['purpose'],
                transaction_id=txn_id,
                status='PENDING'
            )
            return Response({
                "transaction_id": txn.transaction_id,
                "status": txn.status,
                "id": txn.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyFaceTransactionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transaction_id):
        print(f"DEBUG: Face verification request for TXN: {transaction_id}")
        try:
            txn = Transaction.objects.get(transaction_id=transaction_id, sender=request.user)
            
            image_file = request.FILES.get('face_image')
            base64_image = request.data.get('face_image_base64')
            if not image_file and base64_image:
                image_file = base64_to_file(base64_image)
                
            if not image_file:
                return Response({'error': 'Face image not provided'}, status=status.HTTP_400_BAD_REQUEST)
                
            face_data = FaceData.objects.get(user=request.user)
            match, result = compare_faces(face_data.face_encoding, image_file)
            
            if match:
                # Face matched, generate OTP for this transaction
                otp_record = OTPRecord.objects.create(user=request.user, transaction_id=transaction_id)
                # Send OTP to the person sending money (Sender) for final authorization
                sender_email = request.user.email
                email_sent = send_otp_email(sender_email, otp_record.otp)
                
                return Response({
                    "face_verified": True,
                    "otp_sent": email_sent,
                    "sender_email": sender_email,
                    "message": "OTP sent to your email for authorization" if email_sent else "Error sending OTP to your mail"
                })
            else:
                return Response({'face_verified': False, 'message': result}, status=status.HTTP_401_UNAUTHORIZED)
                
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
        except FaceData.DoesNotExist:
            return Response({'error': 'Face not registered! Please register with a face image.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPTransactionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transaction_id):
        otp = request.data.get('otp')
        if not otp:
            return Response({'error': 'OTP not provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            txn = Transaction.objects.select_for_update().get(transaction_id=transaction_id, sender=request.user)
            otp_record = OTPRecord.objects.get(transaction_id=transaction_id, user=request.user)
            
            if otp_record.is_valid(otp):
                # Transfer money atomically
                with transaction.atomic():
                    # Re-fetch from db for atomic update
                    sender = User.objects.select_for_update().get(id=request.user.id)
                    receiver_id = txn.receiver.id
                    receiver = User.objects.select_for_update().get(id=receiver_id)
                    
                    if sender.balance >= txn.amount:
                        sender.balance -= txn.amount
                        receiver.balance += txn.amount
                        sender.save()
                        receiver.save()
                        
                        txn.status = 'COMPLETED'
                        txn.save()
                        otp_record.is_used = True
                        otp_record.save()
                        
                        return Response({
                            "success": True,
                            "transaction_id": txn.transaction_id,
                            "message": "Money transferred successfully"
                        })
                    else:
                        txn.status = 'FAILED'
                        txn.save()
                        return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except (Transaction.DoesNotExist, OTPRecord.DoesNotExist):
            return Response({'error': 'Transaction or OTP record not found'}, status=status.HTTP_404_NOT_FOUND)

class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # All transactions involving the user
        from django.db.models import Q
        return Transaction.objects.filter(Q(sender=self.request.user) | Q(receiver=self.request.user)).order_by('-created_at')

class AdminTransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]
