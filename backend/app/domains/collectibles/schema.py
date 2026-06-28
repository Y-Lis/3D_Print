from pydantic import BaseModel
from typing import Optional

class CollectibleBase(BaseModel):
    name: str
    price: int
    description: str = ""
    rarity: str = "Обычная"
    stock_quantity: int = 0
    image_urls: str = ""
    collection_name: str = "Разное"
    hero_class: str = ""
    element: str = ""
    habitat: str = ""
    weakness: str = ""
    special_abilities: str = ""
    battle_rating: str = "⭐"
    stat_health: int = 50
    stat_strength: int = 50
    stat_defense: int = 50
    stat_speed: int = 50
    stat_agility: int = 50
    stat_intelligence: int = 50
    stat_magic: int = 50
    stat_luck: int = 50
    stat_charisma: int = 50

class CollectibleCreate(CollectibleBase):
    pass

class CollectibleUpdate(CollectibleBase):
    name: Optional[str] = None
    price: Optional[int] = None

class CollectibleResponse(CollectibleBase):
    id: int

    class Config:
        from_attributes = True