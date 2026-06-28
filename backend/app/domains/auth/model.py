from sqlalchemy import Column, Integer, String
from backend.app.shared.database.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="client")
    bonus_balance = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    energy = Column(Integer, default=100)
    # Связь с коллекцией (collection) будет реализована через Event Bus или
    # вынесена в домен Collection согласно правилам изоляции доменов.