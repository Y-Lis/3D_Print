import { API_CONFIG } from '../../../shared/api/config';

export const adminApi = {
  getUsers: async (userToken) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Не удалось загрузить список пользователей');
    }
    
    return response.json();
  },

  changeRole: async (userToken, targetId, newRole) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${targetId}/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
      body: JSON.stringify({ new_role: newRole }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Не удалось изменить роль');
    }
    
    return response.json();
  }
};