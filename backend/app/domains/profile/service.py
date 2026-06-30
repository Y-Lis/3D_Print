from fastapi import HTTPException
from backend.app.domains.auth.model import User
from backend.app.domains.profile.schema import UpdateUsernameRequest, UpdatePasswordRequest, ProfileStatsResponse
from backend.app.domains.profile.repository import ProfileRepository

class ProfileService:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository
        
    def get_profile_stats(self, current_user: User) -> ProfileStatsResponse:
        count = self.repository.get_collection_count(current_user.id)
        return ProfileStatsResponse(
            id=current_user.id,
            username=current_user.username,
            role=current_user.role,
            balance=current_user.balance,
            level=current_user.level,
            energy=current_user.energy,
            collection_count=count
        )

    def update_username(self, current_user: User, req: UpdateUsernameRequest) -> dict:
        if not req.new_username or len(req.new_username) < 3:
            raise HTTPException(status_code=400, detail="Имя должно содержать не менее 3 символов")
        
        # Проверяем, не занято ли уже это имя другим пользователем
        existing = self.repository.db.query(User).filter(User.username == req.new_username).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Это имя уже занято")

        current_user.username = req.new_username
        self.repository.save(current_user)
        
        return {"status": "success", "message": "Имя успешно обновлено"}

    def update_password(self, current_user: User, req: UpdatePasswordRequest) -> dict:
        if current_user.password != req.old_password:
            raise HTTPException(status_code=400, detail="Неверный старый пароль")
        
        if len(req.new_password) < 1:
            raise HTTPException(status_code=400, detail="Новый пароль не может быть пустым")

        current_user.password = req.new_password
        self.repository.save(current_user)
        
        return {"status": "success", "message": "Пароль успешно обновлен"}