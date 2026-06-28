from pydantic import BaseModel

class RoleUpdateRequest(BaseModel):
    new_role: str

class UserAdminResponse(BaseModel):
    id: int
    username: str
    role: str
    bonus_balance: int
    current_level: int
    energy: int

    class Config:
        from_attributes = True