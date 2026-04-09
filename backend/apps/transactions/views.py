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
from datetime import timedelta
import random

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
    permission_classes = [permissions.AllowAny]

    def post(self, request, transaction_id):
        print(f"DEBUG: RECEIVED Face Verification Request for TXN: {transaction_id}")
        try:
            # We allow any here ONLY for the debug phase, normally verify based on request.user
            # But during debug, we might not have a reliable token for every test
            # If request.user is authenticated, use them
            user = request.user if request.user.is_authenticated else None
            
            if not user:
                # If AllowAny is still on, we need to find the sender for the transaction
                txn = Transaction.objects.filter(transaction_id=transaction_id).first()
                if txn:
                    user = txn.sender
                else:
                    return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

            image_file = request.FILES.get('face_image')
            base64_image = request.data.get('face_image_base64')
            if not image_file and base64_image:
                image_file = base64_to_file(base64_image)
                
            if not image_file:
                return Response({'error': 'Face image not provided'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Find the user's registered face
            face_data = FaceData.objects.filter(user=user).first()
            if not face_data:
                return Response({'error': 'Your face is not registered! Please go to your profile and scan your face first.'}, status=status.HTTP_404_NOT_FOUND)

            # Compare faces (Uses MOCK_MODE = True from utils.py)
            match, result = compare_faces(face_data.face_encoding, image_file)
            
            if match:
                print(f"SUCCESS: Face verified for {user.login_id}")
                # Generate or Refresh the OTP for this transaction
                otp_record, created = OTPRecord.objects.update_or_create(
                    transaction_id=transaction_id,
                    defaults={
                        'user': user, 
                        'is_used': False, 
                        'otp': f"{random.randint(100000, 999999)}",
                        'expires_at': timezone.now() + timedelta(minutes=5)
                    }
                )
                
                # 📧 Dispatch OTP Email (Background Thread)
                send_otp_email(user.email, otp_record.otp)
                
                return Response({
                    "face_verified": True,
                    "otp_sent": True,
                    "sender_email": user.email,
                    "otp": otp_record.otp,
                    "message": f"Face verified! OTP sent to {user.email}."
                }, status=status.HTTP_200_OK)
            else:
                print(f"FAILED: Face mismatch for {user.login_id}")
                return Response({'face_verified': False, 'message': 'Face does not match our records'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            import traceback
            print(f"SYSTEM ERROR in Face Verification: {str(e)}")
            traceback.print_exc()
            response = Response({'error': f"System Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            response["Access-Control-Allow-Origin"] = "*"
            return response

class VerifyOTPTransactionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transaction_id):
        print(f"DEBUG: RECEIVED OTP Verification Request for TXN: {transaction_id}")
        otp = request.data.get('otp')
        if not otp:
            print("FAILED: OTP not provided in the request payload.")
            return Response({'error': 'OTP not provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                try:
                    txn = Transaction.objects.select_for_update().get(transaction_id=transaction_id, sender=request.user)
                    otp_record = OTPRecord.objects.select_for_update().get(transaction_id=transaction_id, user=request.user)
                except (Transaction.DoesNotExist, OTPRecord.DoesNotExist):
                    print(f"FAILED: Transaction or OTP record not found for TXN: {transaction_id}")
                    return Response({'error': 'Transaction or OTP record not found'}, status=status.HTTP_404_NOT_FOUND)
                
                if otp_record.is_valid(otp):
                    sender = User.objects.select_for_update().get(id=request.user.id)
                    receiver = User.objects.select_for_update().get(id=txn.receiver.id)
                    
                    print(f"DEBUG: Sender balance={sender.balance}, Txn amount={txn.amount}")
                    if sender.balance >= txn.amount:
                        sender.balance -= txn.amount
                        receiver.balance += txn.amount
                        sender.save()
                        receiver.save()
                        
                        txn.status = 'COMPLETED'
                        txn.save()
                        otp_record.is_used = True
                        otp_record.save()
                        
                        print(f"SUCCESS: Transaction {transaction_id} completed successfully.")
                        return Response({
                            "success": True,
                            "transaction_id": txn.transaction_id,
                            "message": "Money transferred successfully"
                        })
                    else:
                        print(f"FAILED: Insufficient balance. Sender balance: {sender.balance}, Amount: {txn.amount}")
                        txn.status = 'FAILED'
                        txn.save()
                        return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    print(f"FAILED: Invalid or expired OTP for TXN: {transaction_id}")
                    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            import traceback
            print(f"CRITICAL ERROR in OTP Verification: {str(e)}")
            traceback.print_exc()
            return Response({'error': 'System error during transfer', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
