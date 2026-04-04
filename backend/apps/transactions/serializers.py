from rest_framework import serializers
from .models import Transaction
from apps.users.serializers import UserSerializer

class TransactionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'amount', 'purpose', 'status', 'created_at', 'date', 'time']
        read_only_fields = ['transaction_id', 'status', 'created_at']

    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_time(self, obj):
        return obj.created_at.strftime('%H:%M:%S')
