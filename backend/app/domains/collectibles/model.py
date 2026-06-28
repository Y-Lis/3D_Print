from sqlalchemy import Column, Integer, String
from backend.app.shared.database.base import Base

class Collectible(Base):
    __tablename__ = "collectibles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer)
    description = Column(String, default="")
    rarity = Column(String, default="Обычная")
    stock_quantity = Column(Integer, default=0)
    image_urls = Column(String, default="")
    
    collection_name = Column(String, default="Разное")
    hero_class = Column(String, default="")
    element = Column(String, default="")
    habitat = Column(String, default="")
    weakness = Column(String, default="")
    special_abilities = Column(String, default="")
    battle_rating = Column(String, default="⭐")

    stat_health = Column(Integer, default=50)
    stat_strength = Column(Integer, default=50)
    stat_defense = Column(Integer, default=50)
    stat_speed = Column(Integer, default=50)
    stat_agility = Column(Integer, default=50)
    stat_intelligence = Column(Integer, default=50)
    stat_magic = Column(Integer, default=50)
    stat_luck = Column(Integer, default=50)
    stat_charisma = Column(Integer, default=50)