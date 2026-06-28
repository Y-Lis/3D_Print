from sqlalchemy.orm import Session
from backend.app.domains.auth.model import User

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_stats(self, user_id: int, bonus_points: int, new_level: int) -> User | None:
        user = self.get_by_id(user_id)
        if user:
            user.bonus_balance = bonus_points
            user.current_level = new_level
            self.db.commit()
            self.db.refresh(user)
        return user