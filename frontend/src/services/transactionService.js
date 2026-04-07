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

    const resizeImage = async (base64Str) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      });
    };

    if (!isWeb && faceData.uri) {
      formData.append('face_image', {
        uri: faceData.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      });
    } else if (faceData.base64) {
      let finalBase64 = faceData.base64;
      if (isWeb) {
        console.log("Web detected: Resizing image before upload...");
        finalBase64 = await resizeImage(faceData.base64.startsWith('data:') ? faceData.base64 : `data:image/jpeg;base64,${faceData.base64}`);
      }
      formData.append('face_image_base64', finalBase64);
    }

    try {
      console.log("Submitting Face Verification (Axios) for Txn:", txnId);
      
      const config = {
        headers: {
          // REMOVED manual Content-Type to let Axios handle boundary
        },
        timeout: 60000, // 60s timeout
      };

      console.log("Submitting Face Verification (Axios) for Txn:", txnId);
      const response = await api.post(`/transactions/${txnId}/verify-face/`, formData, config);
      return { data: response.data };
    } catch (err) {
      console.error("Face Verification Error:", err?.response?.data || err.message);
      // Ensure we pass the error in a consistent format
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
