import threading
import smtplib
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """
    Attempt to send OTP email synchronously with a short timeout.
    Returns a dict: { 'sent': bool, 'otp': str }
    This allows the caller to include the OTP in the response if email failed.
    """
    result = {'sent': False, 'otp': otp}
    
    print(f"DEBUG: Attempting to send OTP email to {email}")
    
    try:
        subject = "Multilevel Authentication System - Transaction OTP"
        message = (
            f"Your OTP for the transaction is: {otp}\n"
            f"This OTP is valid for 5 minutes. Do not share it with anyone."
        )
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        print(f"SUCCESS: OTP email sent to {email}")
        result['sent'] = True
        
    except smtplib.SMTPException as e:
        error_msg = str(e)
        print(f"ERROR: SMTP error sending OTP to {email}: {error_msg}")
        result['error'] = error_msg
        
    except OSError as e:
        error_msg = f"Network Unreachable: {str(e)}"
        print(f"ERROR: {error_msg}")
        result['error'] = error_msg
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR: Unexpected failure sending OTP to {email}: {error_msg}")
        result['error'] = error_msg
    
    return result
