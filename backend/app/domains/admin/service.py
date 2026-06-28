from typing import List
from fastapi import HTTPException
from backend.app.domains.admin.repository import AdminRepository
from backend.app.domains.auth.model import User

class AdminService:
    def __init__(self, repository: AdminRepository):
        self.repository = repository

    def _ensure_superadmin(self, current_user: User):
        if current_user.role != "superadmin":
            raise HTTPException(status_code=403, detail="Недостаточно прав. Требуется роль superadmin")

    def get_all_users(self, current_user: User) -> List[User]:
        # Делегируем проверку прав бизнес-логике
        self._ensure_superadmin(current_user)
        return self.repository.get_all_users(exclude_id=current_user.id)

    def change_user_role(self, current_user: User, target_id: int, new_role: str) -> dict:
        self._ensure_superadmin(current_user)
        
        target_user = self.repository.get_user_by_id(target_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        self.repository.update_user_role(target_user, new_role)
        return {"message": f"Роль пользователя {target_user.username} успешно изменена на {new_role}"}