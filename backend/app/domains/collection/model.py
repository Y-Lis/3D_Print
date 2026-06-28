from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
from backend.app.shared.database.base import Base

class UserCollection(Base):
    __tablename__ = "user_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    # По правилам DDD мы храним только ID, а не ForeignKey, 
    # чтобы домены оставались независимыми и их можно было вынести в микросервисы.
    user_id = Column(Integer, index=True)
    collectible_id = Column(Integer, index=True)
    acquired_at = Column(DateTime, default=datetime.utcnow)