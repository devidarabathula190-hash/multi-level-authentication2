import smtplib
import socket
from email.mime.text import MIMEText
from django.conf import settings

def send_otp_email(email, otp):
    """
    Directly use smtplib to send email, forcing IPv4 if necessary.
    """
    result = {'sent': False, 'otp': otp}
    
    # Try to send
    try:
        subject = "Multilevel Authentication System - Transaction OTP"
        body = (
            f"Your OTP for the transaction is: {otp}\n"
            f"This OTP is valid for 5 minutes. Do not share it with anyone."
        )
        
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = settings.EMAIL_HOST_USER
        msg['To'] = email

        # Connection settings
        host = settings.EMAIL_HOST # 'smtp.gmail.com'
        port = settings.EMAIL_PORT # 587
        user = settings.EMAIL_HOST_USER
        password = settings.EMAIL_HOST_PASSWORD

        print(f"DEBUG: Attempting direct SMTP upload to {host}:{port} for {email}")

        # Explicitly force IPv4 to avoid Render's IPv6 networking issues
        # We do this by resolving the host first
        try:
            addr_info = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
            target_ip = addr_info[0][4][0]
            print(f"DEBUG: Resolved {host} to IPv4: {target_ip}")
        except Exception as dns_err:
            print(f"WARN: DNS Resolution failed for {host}, using hostname and hoping for the best: {dns_err}")
            target_ip = host

        # Connect and Send
        server = smtplib.SMTP(target_ip, port, timeout=settings.EMAIL_TIMEOUT)
        server.set_debuglevel(1) # This will show in Render logs
        server.starttls()
        server.login(user, password)
        server.sendmail(user, [email], msg.as_string())
        server.quit()
        
        print(f"SUCCESS: Direct SMTP delivery to {email} worked!")
        result['sent'] = True
        
    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL ERROR in direct SMTP delivery: {error_msg}")
        result['error'] = error_msg
        
    return result
