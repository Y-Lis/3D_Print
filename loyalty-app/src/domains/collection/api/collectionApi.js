import { API_CONFIG } from '../../../shared/api/config';

export const collectionApi = {
  getMyCollection: async (userToken) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collection/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
    });
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить коллекцию');
    }
    
    return response.json();
  }
};