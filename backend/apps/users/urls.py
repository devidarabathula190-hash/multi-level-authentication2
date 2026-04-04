from django.urls import path
from .views import (
    LoginView,
    AdminUserListView,
    AdminUserActionView,
    UserProfileView,
    ReceiverListView
)

urlpatterns = [
    # ✅ LOGIN
    path('login/', LoginView.as_view()),

    # ✅ OTHER APIs
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<uuid:user_id>/<str:action>/', AdminUserActionView.as_view()),
    path('profile/', UserProfileView.as_view()),
    path('receivers/', ReceiverListView.as_view()),
]