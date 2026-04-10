import api from './apiService';

const transactionService = {
  getReceivers: async () => {
    return await api.get('/users/receivers/');
  },
  initiate: async (data) => {
    return await api.post('/transactions/initiate/', data);
  },
  // Wakes up the Render free-tier server before a heavy request.
  // Render sleeps after 15 min of inactivity — first request takes 30-50s to wake.
  wakeupServer: async () => {
    try {
      console.log('Pinging server to wake it up...');
      await api.get('/health/', { timeout: 60000 });
      console.log('Server is awake.');
      return true;
    } catch (e) {
      console.warn('Wakeup ping failed:', e.message);
      return false; // Continue anyway — server might still respond to the real request
    }
  },

  verifyFace: async (txnId, faceData, onStatusUpdate) => {
    console.log('Submitting Face Verification for Txn:', txnId);

    // Step 1: Wake up the server first
    if (onStatusUpdate) onStatusUpdate('Connecting to secure server...');
    await transactionService.wakeupServer();

    // Step 2: Build the payload
    if (onStatusUpdate) onStatusUpdate('Preparing biometric data...');
    let base64Image = faceData.base64 || null;

    try {
      if (!base64Image) {
        // Fallback: no base64 — try FormData with URI (less reliable on mobile)
        console.warn('No base64 in photo — falling back to FormData URI approach');
        const formData = new FormData();
        formData.append('face_image', {
          uri: faceData.uri,
          name: 'face.jpg',
          type: 'image/jpeg',
        });
        if (onStatusUpdate) onStatusUpdate('Verifying identity...');
        const response = await api.post(`/transactions/${txnId}/verify-face/`, formData, {
          timeout: 90000,
        });
        return { data: response.data };
      }

      // Preferred: send as JSON with base64 — avoids multipart upload issues
      const fullBase64 = base64Image.startsWith('data:')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

      if (onStatusUpdate) onStatusUpdate('Verifying identity...');
      const response = await api.post(
        `/transactions/${txnId}/verify-face/`,
        { face_image_base64: fullBase64 },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 90000, // 90s — Render free tier can be slow to wake
        }
      );
      return { data: response.data };

    } catch (err) {
      console.error('Face Verification Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  verifyOTP: async (txnId, otp) => {
    try {
      await transactionService.wakeupServer(); // ensure server is awake
      const response = await api.post(`/transactions/${txnId}/verify-otp/`, { otp });
      return response;
    } catch (err) {
      console.error('OTP Verify Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  getHistory: async () => {
    return await api.get('/transactions/history/');
  },
};

export default transactionService;
