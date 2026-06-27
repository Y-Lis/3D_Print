from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User

def get_current_user(x_token: str = Header(default=None, description="Токен"), db: Session = Depends(get_db)):
    if not x_token:
        raise HTTPException(status_code=401, detail="Токен не предоставлен")
    try:
        user_id = int(x_token.split("_")[1]) 
    except:
        raise HTTPException(status_code=401, detail="Неверный формат токена")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Только для администраторов.")
    return current_user

def get_super_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Только для Главного администратора.")
    return current_user