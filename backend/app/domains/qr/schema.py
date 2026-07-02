from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class QRGenerateCrm(BaseModel):
    collectible_id: int
    burn_bonuses: Optional[int] = 0

class QRScanRequest(BaseModel):
    token: str

class QRResponse(BaseModel):
    id: int
    token: str
    collectible_id: int
    burn_bonuses: int
    is_used: bool
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True