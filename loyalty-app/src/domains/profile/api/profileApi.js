import { API_CONFIG } from '../../../shared/api/config';

export const profileApi = {
  getMyProfile: async (userToken) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
    });
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить профиль');
    }
    
    return response.json();
  }
};