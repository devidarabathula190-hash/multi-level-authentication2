from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'login_id', 'mobile', 'email', 'address', 'status', 'created_at']
