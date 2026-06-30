from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from backend.app.shared.database.connection import Base

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    collectible_id = Column(Integer, ForeignKey("collectibles.id"), nullable=False)
    burn_bonuses = Column(Integer, default=0, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)