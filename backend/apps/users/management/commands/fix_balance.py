from django.core.management.base import BaseCommand
from apps.users.models import User

class Command(BaseCommand):
    help = 'Sets all user balances to 1000000 for testing'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            user.balance = 1000000.00
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully updated balance for {user.login_id} to 1,000,000"))
