from sqlalchemy.orm import Session
from backend.app.domains.collection.model import CollectionItem

class CollectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_to_collection(self, user_id: int, collectible_id: int) -> CollectionItem:
        item = CollectionItem(
            user_id=user_id, 
            collectible_id=collectible_id
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item
        
    def get_user_collection(self, user_id: int) -> list[CollectionItem]:
        return self.db.query(CollectionItem).filter(CollectionItem.user_id == user_id).all()