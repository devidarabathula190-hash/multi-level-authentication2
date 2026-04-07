from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import send_mail
from django.conf import settings
import traceback
import smtplib
import os

class TestEmailView(APIView):
    """
    Secret debug view to test SMTP connection from Render to Gmail via Brevo API
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            api_key = os.environ.get('BREVO_API_KEY')
            if not api_key:
                return Response({
                    "status": "FAILED",
                    "error": "BREVO_API_KEY is missing in Render Environment Variables!"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Use the new API-based utility
            from .utils import send_otp_email
            send_otp_email('devidarabathula@gmail.com', '123456')
            
            return Response({
                "status": "SUCCESS",
                "message": "Brevo API trigger successful. Check devidarabathula@gmail.com (and Spam)!"
            })
            
        except Exception as e:
            return Response({
                "status": "FAILED",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
