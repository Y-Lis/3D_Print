from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.app.shared.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="client", nullable=False)
    balance = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    energy = Column(Integer, default=100, nullable=False)
    activity_coefficient = Column(Float, default=1.0, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)