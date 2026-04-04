from django.db import models
from django.conf import settings
import random
from django.utils import timezone
from datetime import timedelta

class OTPRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='otps')
    transaction_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = f"{random.randint(100000, 999999)}"
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_valid(self, otp_to_verify):
        return (not self.is_used and 
                self.otp == otp_to_verify and 
                timezone.now() < self.expires_at)

    def __str__(self):
        return f"OTP {self.otp} for {self.user.name}"
