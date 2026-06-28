from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.collection.schema import CollectionItemResponse
from backend.app.domains.collection.repository import CollectionRepository
from backend.app.domains.collection.service import CollectionService

# Зависимость из домена auth для идентификации пользователя
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/collection", tags=["Collection"])

def get_collection_service(db: Session = Depends(get_db)) -> CollectionService:
    repo = CollectionRepository(db)
    return CollectionService(repo)

@router.get("/my", response_model=List[CollectionItemResponse])
def get_my_collection(
    service: CollectionService = Depends(get_collection_service),
    current_user: User = Depends(get_current_user)
):
    """
    Получить текущую коллекцию пользователя.
    """
    return service.get_my_collection(current_user.id)