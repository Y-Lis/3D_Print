from pydantic import BaseModel

class ProfileStatsResponse(BaseModel):
    id: int
    username: str
    role: str
    balance: int
    level: int
    energy: int
    collection_count: int

class UpdateUsernameRequest(BaseModel):
    new_username: str

class UpdatePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ProfileResponse(BaseModel):
    status: str
    message: str