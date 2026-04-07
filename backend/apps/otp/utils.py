from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """
    Send OTP to email.
    """
    try:
        print(f"DEBUG: Attempting to send OTP email to {email}")
        subject = f"Multilevel Authentication System - Transaction OTP"
        message = f"Your OTP for the transaction is {otp}. This OTP expires in 5 minutes."
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        
        # Real sending re-enabled
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        print(f"SUCCESS: Email sent to {email}")
        return True
    except Exception as e:
        print(f"ERROR: Email delivery system failed: {str(e)}")
        # We return False but the view handles it gracefully to avoid crash
        return False
