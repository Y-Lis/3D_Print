from pydantic import BaseModel
from datetime import datetime

class CollectionItemResponse(BaseModel):
    id: int
    user_id: int
    collectible_id: int
    acquired_at: datetime

    class Config:
        from_attributes = True