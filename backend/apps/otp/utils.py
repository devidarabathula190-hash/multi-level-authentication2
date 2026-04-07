import threading
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """
    Sends OTP in a background thread to avoid blocking the main request
    and hitting Render timeouts.
    """
    def send():
        try:
            subject = "Multilevel Authentication - Transaction OTP"
            message = (
                f"Your OTP for the transaction is: {otp}\n"
                f"This code will expire in 5 minutes."
            )
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            print(f"DEBUG: Background thread attempting to send OTP to {email}")
            send_mail(
                subject, 
                message, 
                from_email, 
                recipient_list, 
                fail_silently=False
            )
            print(f"SUCCESS: OTP email sent to {email}")
        except Exception as e:
            print(f"ERROR: Background email delivery failed for {email}: {str(e)}")

    # Spin up thread and return success immediately (optimistic)
    threading.Thread(target=send).start()
    return {'sent': True, 'otp': otp} 
