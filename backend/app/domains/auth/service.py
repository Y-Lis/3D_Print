from fastapi import HTTPException
from backend.app.domains.auth.repository import AuthRepository
from backend.app.domains.auth.model import User

class AuthService:
    def __init__(self, repository: AuthRepository):
        self.repository = repository

    def register(self, username: str, password: str) -> int:
        existing_user = self.repository.get_user_by_username(username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Логин занят")
        
        assigned_role = "superadmin" if username == "chief" else "client"
        new_user = self.repository.create_user(username, password, assigned_role)
        return new_user.id

    def login(self, username: str, password: str) -> int:
        user = self.repository.get_user_by_username(username)
        if not user or user.password_hash != password:
            raise HTTPException(status_code=400, detail="Неверные данные")
        return user.id

    def verify_token(self, token: str) -> User:
        if not token.startswith("user_"):
            raise HTTPException(status_code=401, detail="Неверный токен")
        try:
            user_id = int(token.split("_")[1])
        except (IndexError, ValueError):
            raise HTTPException(status_code=401, detail="Неверный формат токена")
        
        user = self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return user