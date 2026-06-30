from sqlalchemy.orm import Session
from backend.app.domains.auth.model import User
from backend.app.domains.collection.model import CollectionItem

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_collection_count(self, user_id: int) -> int:
        return self.db.query(CollectionItem).filter(CollectionItem.user_id == user_id).count()

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user