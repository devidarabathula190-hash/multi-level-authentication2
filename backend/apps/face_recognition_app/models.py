from django.db import models
from django.conf import settings

class FaceData(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='face_data')
    face_encoding = models.BinaryField()  # Serialized numpy array
    face_image = models.ImageField(upload_to='faces/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Face data for {self.user.name}"
