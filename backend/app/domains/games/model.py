from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from backend.app.shared.database.connection import Base

class GameLog(Base):
    __tablename__ = "game_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_name = Column(String, nullable=False)  # Например, "quiz", "puzzle"
    level_passed = Column(Integer, nullable=False)
    is_success = Column(Boolean, nullable=False)
    xp_earned = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)