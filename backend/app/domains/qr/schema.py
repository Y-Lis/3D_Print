from pydantic import BaseModel

class QRGenerateRequest(BaseModel):
    collectible_id: int

class QRScanRequest(BaseModel):
    token: str

class QRResponse(BaseModel):
    token: str
    is_used: bool
    collectible_id: int

    class Config:
        from_attributes = True