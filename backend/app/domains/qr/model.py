from sqlalchemy import Column, Integer, String, Boolean
from backend.app.shared.database.base import Base

class QRCode(Base):
    __tablename__ = "qr_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    is_used = Column(Boolean, default=False)
    # По правилам DDD мы не делаем прямой ForeignKey на таблицу другого домена, 
    # мы храним идентификатор. Интеграция происходит на уровне событий.
    collectible_id = Column(Integer, index=True)