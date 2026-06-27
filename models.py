from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

user_collection = Table("user_collection", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("product_id", Integer, ForeignKey("products.id"))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="client")
    bonus_balance = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    energy = Column(Integer, default=100)
    collection = relationship("Product", secondary=user_collection, backref="owners")

class Product(Base):
    __tablename__ = "products"
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

class QRCode(Base):
    __tablename__ = "qr_codes"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    is_used = Column(Boolean, default=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)