import { API_CONFIG } from '../../../shared/api/config';

export const qrApi = {
  scanQR: async (token, userToken) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/qr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Неверный или уже использованный QR-код');
    }
    
    return response.json();
  }
};