from typing import Optional
from sqlalchemy.orm import Session
# CRM управляет моделями из Collectibles
from backend.app.domains.collectibles.model import Collectible

class CrmRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_collectible(self, data: dict) -> Collectible:
        new_item = Collectible(**data)
        self.db.add(new_item)
        self.db.commit()
        self.db.refresh(new_item)
        return new_item

    def update_collectible(self, collectible_id: int, data: dict) -> Optional[Collectible]:
        item = self.db.query(Collectible).filter(Collectible.id == collectible_id).first()
        if item:
            for key, value in data.items():
                setattr(item, key, value)
            self.db.commit()
            self.db.refresh(item)
        return item