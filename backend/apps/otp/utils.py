from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """
    Send OTP to email.
    """
    try:
        subject = f"Multilevel Authentication System - Transaction OTP"
        message = f"Your OTP for the transaction is {otp}. This OTP expires in 5 minutes."
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list)
        return True
    except Exception as e:
        print(f"Error sending OTP email: {e}")
        return False
