from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GameStartRequest(BaseModel):
    game_name: str

    class Config:
        from_attributes = True

class GameResultRequest(BaseModel):
    game_name: str
    level_id: int
    is_success: bool

    class Config:
        from_attributes = True

class GameResultResponse(BaseModel):
    status: str
    message: str
    current_level: int
    current_energy: int
    new_coefficient: float

    class Config:
        from_attributes = True