from typing import List
from fastapi import HTTPException
from backend.app.domains.collectibles.repository import CollectibleRepository
from backend.app.domains.collectibles.model import Collectible
from backend.app.domains.collectibles.schema import CollectibleCreate, CollectibleUpdate

class CollectibleService:
    def __init__(self, repository: CollectibleRepository):
        self.repository = repository

    def get_catalog(self) -> List[Collectible]:
        return self.repository.get_all()

    def get_collectible(self, collectible_id: int) -> Collectible:
        item = self.repository.get_by_id(collectible_id)
        if not item:
            raise HTTPException(status_code=404, detail="Коллекционный предмет не найден")
        return item

    def create_collectible(self, data: CollectibleCreate) -> Collectible:
        return self.repository.create(data)

    def update_collectible(self, collectible_id: int, data: CollectibleUpdate) -> Collectible:
        item = self.repository.update(collectible_id, data)
        if not item:
            raise HTTPException(status_code=404, detail="Коллекционный предмет не найден")
        return item