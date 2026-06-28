from sqlalchemy.orm import Session
from backend.app.domains.qr.model import QRCode

class QRRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_qr(self, token: str, collectible_id: int) -> QRCode:
        new_qr = QRCode(token=token, collectible_id=collectible_id)
        self.db.add(new_qr)
        self.db.commit()
        self.db.refresh(new_qr)
        return new_qr

    def get_qr_by_token(self, token: str) -> QRCode | None:
        return self.db.query(QRCode).filter(QRCode.token == token).first()

    def mark_as_used(self, qr: QRCode) -> QRCode:
        qr.is_used = True
        self.db.commit()
        self.db.refresh(qr)
        return qr