from typing import List
from sqlalchemy.orm import Session
from backend.app.domains.collection.model import UserCollection

class CollectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_item(self, user_id: int, collectible_id: int) -> UserCollection:
        item = UserCollection(user_id=user_id, collectible_id=collectible_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_user_collection(self, user_id: int) -> List[UserCollection]:
        return self.db.query(UserCollection).filter(UserCollection.user_id == user_id).all()
    
    def has_item(self, user_id: int, collectible_id: int) -> bool:
        return self.db.query(UserCollection).filter(
            UserCollection.user_id == user_id, 
            UserCollection.collectible_id == collectible_id
        ).first() is not None