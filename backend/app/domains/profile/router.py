from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.profile.schema import UpdateUsernameRequest, UpdatePasswordRequest, ProfileResponse, ProfileStatsResponse
from backend.app.domains.profile.repository import ProfileRepository
from backend.app.domains.profile.service import ProfileService
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/profile", tags=["Profile"])

def get_profile_service(db: Session = Depends(get_db)) -> ProfileService:
    repo = ProfileRepository(db)
    return ProfileService(repo)
    
@router.get("/", response_model=ProfileStatsResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    """Получение данных профиля (статистика)"""
    return service.get_profile_stats(current_user)

@router.put("/username", response_model=ProfileResponse)
def update_username(
    req: UpdateUsernameRequest,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    """Обновление имени пользователя"""
    return service.update_username(current_user, req)

@router.put("/password", response_model=ProfileResponse)
def update_password(
    req: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    """Обновление пароля пользователя"""
    return service.update_password(current_user, req)