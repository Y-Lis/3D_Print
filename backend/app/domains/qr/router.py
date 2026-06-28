from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.qr.schema import QRGenerateRequest, QRScanRequest
from backend.app.domains.qr.repository import QRRepository
from backend.app.domains.qr.service import QRService

# Используем зависимость из auth для проверки токена (уровень API)
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/qr", tags=["QR"])

def get_qr_service(db: Session = Depends(get_db)) -> QRService:
    repo = QRRepository(db)
    return QRService(repo)

@router.post("/generate")
def generate_qr(
    req: QRGenerateRequest, 
    service: QRService = Depends(get_qr_service), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для генерации QR")
    
    token = service.generate_qr(req.collectible_id)
    return {"token": token}

@router.post("/scan")
async def scan_qr(
    req: QRScanRequest, 
    service: QRService = Depends(get_qr_service), 
    current_user: User = Depends(get_current_user)
):
    # Эндпоинт стал асинхронным, так как service публикует событие в Event Bus
    result = await service.scan_qr(req.token, current_user.id)
    return result