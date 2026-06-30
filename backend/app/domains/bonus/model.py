from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from backend.app.shared.database.connection import Base

class BonusTransaction(Base):
    __tablename__ = "bonus_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collectible_id = Column(Integer, ForeignKey("collectibles.id"), nullable=False)
    operation_type = Column(String, nullable=False)  # "earned" (начисление) или "spent" (списание)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)