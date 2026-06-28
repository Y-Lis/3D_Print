from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.profile.schema import ProfileResponse
from backend.app.domains.profile.repository import ProfileRepository
from backend.app.domains.profile.service import ProfileService
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/profile", tags=["Profile"])

def get_profile_service(db: Session = Depends(get_db)) -> ProfileService:
    repo = ProfileRepository(db)
    return ProfileService(repo)

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    """
    Получить профиль текущего авторизованного пользователя.
    """
    return service.get_profile(current_user.id)