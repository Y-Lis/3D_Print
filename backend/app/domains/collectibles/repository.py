from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.domains.collectibles.model import Collectible
from backend.app.domains.collectibles.schema import CollectibleCreate, CollectibleUpdate

class CollectibleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Collectible]:
        return self.db.query(Collectible).all()

    def get_by_id(self, collectible_id: int) -> Optional[Collectible]:
        return self.db.query(Collectible).filter(Collectible.id == collectible_id).first()

    def create(self, data: CollectibleCreate) -> Collectible:
        new_item = Collectible(**data.model_dump())
        self.db.add(new_item)
        self.db.commit()
        self.db.refresh(new_item)
        return new_item

    def update(self, collectible_id: int, data: CollectibleUpdate) -> Optional[Collectible]:
        item = self.get_by_id(collectible_id)
        if item:
            update_data = data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(item, key, value)
            self.db.commit()
            self.db.refresh(item)
        return item