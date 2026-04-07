from django.urls import path
from .views import TestEmailView

urlpatterns = [
    path('test-email/', TestEmailView.as_view(), name='test-email'),
]
