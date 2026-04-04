import api from './apiService';

const transactionService = {
  getReceivers: async () => {
    return await api.get('/users/receivers/');
  },
  initiate: async (data) => {
    return await api.post('/transactions/initiate/', data);
  },
  verifyFace: async (txnId, faceData) => {
    // Platform import is needed here if it's not available, but let's assume we pass a ready-to-use photo or handle it here
    const formData = new FormData();
    
    const isWeb = typeof window !== 'undefined' && window.document;

    // Use file upload if available (Native) - much faster & more reliable for large images
    if (!isWeb && faceData.uri) {
      formData.append('face_image', {
        uri: faceData.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      });
    } else if (faceData.base64) {
      // Use base64 if no URI or on Web
      formData.append('face_image_base64', faceData.base64);
    } else if (isWeb && faceData.uri) {
      // For web blob URLs
      const res = await fetch(faceData.uri);
      const blob = await res.blob();
      formData.append('face_image', blob, 'face.jpg');
    }
    
    // DO NOT set Content-Type manually for FormData on axios to prevent boundary issues
    try {
      console.log("Submitting Face Verification for Txn:", txnId);
      const response = await api.post(`/transactions/${txnId}/verify-face/`, formData);
      return response;
    } catch (err) {
      if (err.response) {
        console.error("Server Error Response:", err.response.data);
      }
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
