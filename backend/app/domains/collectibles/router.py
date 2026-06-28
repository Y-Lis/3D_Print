from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.collectibles.schema import CollectibleResponse
from backend.app.domains.collectibles.repository import CollectibleRepository
from backend.app.domains.collectibles.service import CollectibleService

router = APIRouter(prefix="/collectibles", tags=["Collectibles"])

def get_collectible_service(db: Session = Depends(get_db)) -> CollectibleService:
    repo = CollectibleRepository(db)
    return CollectibleService(repo)

@router.get("/catalog", response_model=List[CollectibleResponse])
def get_catalog(service: CollectibleService = Depends(get_collectible_service)):
    """
    Публичный эндпоинт. Каталог предназначен только для просмотра.
    """
    return service.get_catalog()

@router.get("/{collectible_id}", response_model=CollectibleResponse)
def get_collectible(collectible_id: int, service: CollectibleService = Depends(get_collectible_service)):
    """
    Получение конкретной игрушки по ID.
    """
    return service.get_collectible(collectible_id)