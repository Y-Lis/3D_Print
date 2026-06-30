import { API_CONFIG } from '../../../shared/api/config';

export const collectiblesApi = {
  getCatalog: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collectibles/catalog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при загрузке каталога');
    }
    
    return response.json();
  },

  getCollectibleById: async (id) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collectibles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Игрушка не найдена');
    }

    return response.json();
  }
};