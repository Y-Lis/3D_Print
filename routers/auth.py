from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, AdminCreate, UserLogin
from dependencies import get_current_user

router = APIRouter(tags=["Auth"])

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, нет ли уже такого номера
    existing_user = db.query(User).filter(User.phone == user.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот номер уже зарегистрирован")
    
    new_user = User(phone=user.phone, password_hash=user.password, role="client")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Успешно", "user_id": new_user.id}

@router.post("/register/admin")
def register_admin(user: AdminCreate, db: Session = Depends(get_db)):
    if user.secret_key != "secret123":
        raise HTTPException(status_code=403, detail="Неверный секретный ключ")
    if user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Роль должна быть admin или super_admin")
    
    new_user = User(phone=user.phone, password_hash=user.password, role=user.role)
    db.add(new_user)
    db.commit()
    return {"message": f"Пользователь с ролью {user.role} создан", "user_id": new_user.id}

@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    # Ищем пользователя по телефону и паролю
    db_user = db.query(User).filter(User.phone == user.phone, User.password_hash == user.password).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Неверный телефон или пароль")
    
    return {"message": "Успешный вход", "user_id": db_user.id}

@router.get("/users/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "role": current_user.role,
        "bonus_balance": current_user.bonus_balance
    }