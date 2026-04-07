from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import send_mail
from django.conf import settings
import traceback
import smtplib

class TestEmailView(APIView):
    """
    Secret debug view to test SMTP connection from Render to Gmail
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        logs = []
        try:
            logs.append(f"DEBUG: Using Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
            logs.append(f"DEBUG: User: {settings.EMAIL_HOST_USER}")
            
            # Send a real test email synchronously for debugging
            subject = "SMTP TEST - Multilevel Auth"
            message = "If you are reading this, the Render to Gmail SMTP connection is working!"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = ['devidarabathula@gmail.com'] # Test send to self

            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False
            )
            
            return Response({
                "status": "SUCCESS",
                "message": f"Test email sent to {recipient_list[0]} successfully!",
                "logs": logs
            })
            
        except Exception as e:
            error_details = str(e)
            tb = traceback.format_exc()
            return Response({
                "status": "FAILED",
                "error": error_details,
                "traceback": tb,
                "logs": logs
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
