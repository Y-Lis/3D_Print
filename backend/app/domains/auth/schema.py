from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    message: str
    user_id: int