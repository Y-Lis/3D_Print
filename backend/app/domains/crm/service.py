from fastapi import HTTPException
from backend.app.domains.crm.repository import CrmRepository
from backend.app.domains.crm.schema import CollectibleCreateCrm, CollectibleUpdateCrm
from backend.app.domains.auth.model import User

class CrmService:
    def __init__(self, repository: CrmRepository):
        self.repository = repository

    def _ensure_content_manager(self, user: User):
        if user.role not in ["admin", "superadmin"]:
            raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора.")

    def create_collectible(self, user: User, data: CollectibleCreateCrm):
        self._ensure_content_manager(user)
        return self.repository.create_collectible(data.model_dump())

    def update_collectible(self, user: User, collectible_id: int, data: CollectibleUpdateCrm):
        self._ensure_content_manager(user)
        update_data = data.model_dump(exclude_unset=True)
        updated_item = self.repository.update_collectible(collectible_id, update_data)
        if not updated_item:
            raise HTTPException(status_code=404, detail="Предмет не найден")
        return updated_item