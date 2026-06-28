from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.auth.schema import UserCreate, TokenResponse
from backend.app.domains.auth.repository import AuthRepository
from backend.app.domains.auth.service import AuthService
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    repo = AuthRepository(db)
    return AuthService(repo)

def get_current_user(x_token: str = Header(..., alias="x-token"), auth_service: AuthService = Depends(get_auth_service)) -> User:
    return auth_service.verify_token(x_token)

@router.post("/register", response_model=TokenResponse)
def register_user(user: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    user_id = auth_service.register(user.username, user.password)
    return TokenResponse(message="Успешно", user_id=user_id)

@router.post("/login", response_model=TokenResponse)
def login_user(user: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    user_id = auth_service.login(user.username, user.password)
    return TokenResponse(message="Успешно", user_id=user_id)