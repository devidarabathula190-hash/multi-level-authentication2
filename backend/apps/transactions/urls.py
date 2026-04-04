from django.urls import path
from .views import InitiateTransactionView, VerifyFaceTransactionView, VerifyOTPTransactionView, TransactionHistoryView, AdminTransactionListView

urlpatterns = [
    path('initiate/', InitiateTransactionView.as_view(), name='init_txn'),
    path('<str:transaction_id>/verify-face/', VerifyFaceTransactionView.as_view(), name='verify_face_txn'),
    path('<str:transaction_id>/verify-otp/', VerifyOTPTransactionView.as_view(), name='verify_otp_txn'),
    path('history/', TransactionHistoryView.as_view(), name='txn_history'),
    path('admin/history/', AdminTransactionListView.as_view(), name='admin_txn_history'),
]
