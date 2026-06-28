from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.domains.auth.model import User

class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_users(self, exclude_id: int) -> List[User]:
        """Получаем всех пользователей, кроме самого запрашивающего"""
        return self.db.query(User).filter(User.id != exclude_id).all()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user_role(self, user: User, new_role: str) -> User:
        user.role = new_role
        self.db.commit()
        self.db.refresh(user)
        return user