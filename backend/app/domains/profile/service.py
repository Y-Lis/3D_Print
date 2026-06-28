from fastapi import HTTPException
from backend.app.domains.profile.repository import ProfileRepository
from backend.app.domains.auth.model import User

class ProfileService:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository

    def get_profile(self, user_id: int) -> User:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Профиль не найден")
        return user

    def calculate_level(self, xp: int) -> int:
        if xp < 2000:
            return 1
        elif xp < 5000:
            return 2
        elif xp < 10000:
            return 3
        elif xp < 20000:
            return 4
        return 5

    async def handle_qr_validated(self, payload: dict, product_price: int):
        user_id = payload.get("user_id")
        if not user_id:
            return

        user = self.repository.get_by_id(user_id)
        if not user:
            return

        new_balance = user.bonus_balance + product_price
        new_level = self.calculate_level(new_balance)

        self.repository.update_stats(user_id, new_balance, new_level)