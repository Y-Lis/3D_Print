from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.qr.schema import QRGenerateCrm, QRScanRequest, QRResponse
from backend.app.domains.qr.repository import QRRepository
from backend.app.domains.qr.service import QRService
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/qr", tags=["QR"])

def get_qr_service(db: Session = Depends(get_db)) -> QRService:
    repo = QRRepository(db)
    return QRService(repo)

@router.post("/generate", response_model=QRResponse)
def generate_qr(
    req: QRGenerateCrm,
    current_user: User = Depends(get_current_user),
    service: QRService = Depends(get_qr_service)
):
    """Генерация QR-кода для покупки (только для admin, superadmin)."""
    return service.generate_qr(current_user, req)

@router.post("/scan")
def scan_qr(
    req: QRScanRequest,
    current_user: User = Depends(get_current_user),
    service: QRService = Depends(get_qr_service)
):
    """Сканирование QR-кода клиентом для начисления/списания бонусов."""
    return service.scan_qr(req.token, current_user)