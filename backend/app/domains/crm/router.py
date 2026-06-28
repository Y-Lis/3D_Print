from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.crm.schema import CollectibleCreateCrm, CollectibleUpdateCrm, CollectibleResponseCrm
from backend.app.domains.crm.repository import CrmRepository
from backend.app.domains.crm.service import CrmService

from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/crm", tags=["CRM"])

def get_crm_service(db: Session = Depends(get_db)) -> CrmService:
    repo = CrmRepository(db)
    return CrmService(repo)

@router.post("/collectibles", response_model=CollectibleResponseCrm)
def create_collectible(
    req: CollectibleCreateCrm,
    current_user: User = Depends(get_current_user),
    service: CrmService = Depends(get_crm_service)
):
    """Создание новой игрушки (admin, superadmin)."""
    return service.create_collectible(current_user, req)

@router.put("/collectibles/{collectible_id}", response_model=CollectibleResponseCrm)
def update_collectible(
    collectible_id: int,
    req: CollectibleUpdateCrm,
    current_user: User = Depends(get_current_user),
    service: CrmService = Depends(get_crm_service)
):
    """Обновление данных игрушки (admin, superadmin)."""
    return service.update_collectible(current_user, collectible_id, req)