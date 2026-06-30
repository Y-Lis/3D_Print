import { API_CONFIG } from '../../../shared/api/config';

export const crmApi = {
  createCollectible: async (userToken, itemData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/crm/collectibles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Не удалось добавить предмет');
    }
    
    return response.json();
  }
};