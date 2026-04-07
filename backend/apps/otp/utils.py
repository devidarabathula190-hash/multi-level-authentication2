import threading
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """
    Send OTP to email in a background thread to prevent timeouts.
    """
    def send_task():
        try:
            print(f"DEBUG: Background thread attempting to send OTP email to {email}")
            subject = f"Multilevel Authentication System - Transaction OTP"
            message = f"Your OTP for the transaction is {otp}. This OTP expires in 5 minutes."
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            print(f"SUCCESS: Background email sent to {email}")
        except Exception as e:
            print(f"ERROR: Background email delivery failed: {str(e)}")

    try:
        # Start the email task in a separate thread
        thread = threading.Thread(target=send_task)
        thread.daemon = True
        thread.start()
        
        # We return True immediately so the view can respond to the user
        return True
    except Exception as e:
        print(f"ERROR: Could not spawn email thread: {str(e)}")
        return False
