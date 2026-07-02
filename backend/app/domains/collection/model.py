from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from backend.app.shared.database.connection import Base

class CollectionItem(Base):
    __tablename__ = "collection"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collectible_id = Column(Integer, ForeignKey("collectibles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)