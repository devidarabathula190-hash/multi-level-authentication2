import api from './apiService';
import { Platform } from 'react-native';
import { store } from '../store';
import { BASE_URL } from './apiService';

const transactionService = {
  getReceivers: async () => {
    return await api.get('/users/receivers/');
  },
  initiate: async (data) => {
    return await api.post('/transactions/initiate/', data);
  },
  verifyFace: async (txnId, faceData) => {
    const formData = new FormData();
    const isWeb = typeof window !== 'undefined' && window.document;
    const token = store.getState().auth.token;

    if (!isWeb && faceData.uri) {
      formData.append('face_image', {
        uri: faceData.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      });
    } else if (faceData.base64) {
      formData.append('face_image_base64', faceData.base64);
    }

    try {
      console.log("Submitting Face Verification (Fetch) for Txn:", txnId);
      
      // Native fetch is often more reliable for FormData on mobile
      const response = await fetch(`${BASE_URL}/transactions/${txnId}/verify-face/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // No Content-Type header - fetch will set it with boundary automatically
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data: data, status: response.status } };
      }

      return { data };
    } catch (err) {
      console.error("Face Verification Error:", err);
      throw err;
    }
  },
  verifyOTP: async (txnId, otp) => {
    return await api.post(`/transactions/${txnId}/verify-otp/`, { otp });
  },
  getHistory: async () => {
    return await api.get('/transactions/history/');
  },
};

export default transactionService;
