import threading
import requests
import json
import os
from django.conf import settings

def send_otp_email(email, otp):
    """
    Sends OTP using Brevo HTTP API (v3) in a background thread.
    This bypasses all SMTP port blocks on Render.
    """
    def send():
        try:
            api_key = os.environ.get('BREVO_API_KEY')
            if not api_key:
                print("ERROR: BREVO_API_KEY not found in environment variables.")
                return

            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": api_key
            }
            
            payload = {
                "sender": {"name": "Multilevel Auth", "email": os.environ.get('BREVO_SMTP_USER', 'devidarabathula@gmail.com')},
                "to": [{"email": email}],
                "subject": "Multilevel Authentication - Transaction OTP",
                "textContent": f"Your OTP for the transaction is: {otp}\nThis code will expire in 5 minutes."
            }

            print(f"DEBUG: Triggering Brevo API for {email}...")
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            if response.status_code in [200, 201, 202]:
                print(f"SUCCESS: OTP email sent via API to {email}")
            else:
                print(f"ERROR: Brevo API failed: {response.text}")
                
        except Exception as e:
            print(f"CRITICAL ERROR in background API delivery: {str(e)}")

    # Spin up thread and return success immediately
    threading.Thread(target=send).start()
    return {'sent': True, 'otp': otp}
