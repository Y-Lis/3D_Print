from pydantic import BaseModel
from typing import Optional, List

class ProductCreate(BaseModel):
    name: str
    price: int
    description: Optional[str] = ""
    rarity: Optional[str] = "Обычная"
    stock_quantity: int
    image_urls: Optional[str] = ""
    collection_name: Optional[str] = "Разное"
    hero_class: Optional[str] = ""
    element: Optional[str] = ""
    habitat: Optional[str] = ""
    weakness: Optional[str] = ""
    special_abilities: Optional[str] = ""
    battle_rating: Optional[str] = "⭐"
    stat_health: Optional[int] = 50
    stat_strength: Optional[int] = 50
    stat_defense: Optional[int] = 50
    stat_speed: Optional[int] = 50
    stat_agility: Optional[int] = 50
    stat_intelligence: Optional[int] = 50
    stat_magic: Optional[int] = 50
    stat_luck: Optional[int] = 50
    stat_charisma: Optional[int] = 50

class ProductResponse(ProductCreate):
    id: int
    class Config: from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    bonus_balance: int
    current_level: int
    energy: int
    collection: List[ProductResponse] = [] 
    class Config: from_attributes = True

class QRGenerateRequest(BaseModel): product_id: int
class QRScanRequest(BaseModel): token: str
class RoleUpdateRequest(BaseModel): new_role: str