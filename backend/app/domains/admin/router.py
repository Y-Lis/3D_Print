from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.admin.schema import RoleUpdateRequest, UserAdminResponse
from backend.app.domains.admin.repository import AdminRepository
from backend.app.domains.admin.service import AdminService

# Импортируем зависимость для проверки токена из auth
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_admin_service(db: Session = Depends(get_db)) -> AdminService:
    repo = AdminRepository(db)
    return AdminService(repo)

@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(
    current_user: User = Depends(get_current_user),
    service: AdminService = Depends(get_admin_service)
):
    """
    Получить список всех пользователей системы.
    Только для роли superadmin.
    """
    return service.get_all_users(current_user)

@router.post("/users/{target_id}/role")
def change_user_role(
    target_id: int,
    req: RoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: AdminService = Depends(get_admin_service)
):
    """
    Изменить роль пользователя.
    Только для роли superadmin.
    """
    return service.change_user_role(current_user, target_id, req.new_role)