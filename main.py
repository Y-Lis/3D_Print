from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
import uuid

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Игромир API")

def get_current_user(x_token: str = Header(...), db: Session = Depends(get_db)):
    if not x_token.startswith("user_"):
        raise HTTPException(status_code=401, detail="Неверный токен")
    user_id = int(x_token.split("_")[1])
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user: raise HTTPException(status_code=400, detail="Логин занят")
    assigned_role = "superadmin" if user.username == "chief" else "client"
    new_user = models.User(username=user.username, password_hash=user.password, role=assigned_role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Успешно", "user_id": new_user.id}

@app.post("/login")
def login_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username, models.User.password_hash == user.password).first()
    if not db_user: raise HTTPException(status_code=400, detail="Неверные данные")
    return {"message": "Успешно", "user_id": db_user.id}

@app.get("/users/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/catalog", response_model=List[schemas.ProductResponse])
def get_catalog(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.post("/catalog")
def add_product(product: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["admin", "superadmin"]: raise HTTPException(status_code=403)
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    return new_product

@app.put("/catalog/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, req: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["admin", "superadmin"]: raise HTTPException(status_code=403)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404)
    for key, value in req.model_dump().items(): setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@app.post("/generate-qr")
def generate_qr(req: schemas.QRGenerateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == req.product_id).first()
    if not product: raise HTTPException(status_code=404)
    new_token = str(uuid.uuid4())[:8]
    new_qr = models.QRCode(token=new_token, product_id=product.id)
    db.add(new_qr)
    db.commit()
    return {"token": new_token}

@app.post("/scan-qr")
def scan_qr(req: schemas.QRScanRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    qr = db.query(models.QRCode).filter(models.QRCode.token == req.token).first()
    if not qr or qr.is_used: raise HTTPException(status_code=400, detail="Неверный или использованный код")
    
    product = db.query(models.Product).filter(models.Product.id == qr.product_id).first()
    qr.is_used = True
    current_user.bonus_balance += product.price if product else 500
    xp = current_user.bonus_balance
    if xp < 2000: current_user.current_level = 1
    elif xp < 5000: current_user.current_level = 2
    elif xp < 10000: current_user.current_level = 3
    elif xp < 20000: current_user.current_level = 4
    else: current_user.current_level = 5
    
    unlocked_msg = ""
    if product and product not in current_user.collection:
        current_user.collection.append(product)
        unlocked_msg = f"Разблокирована игрушка: {product.name}!"
        
    db.commit()
    return {"message": f"Код принят! {unlocked_msg}"}

@app.get("/admin/users")
def get_all_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "superadmin": raise HTTPException(status_code=403)
    return db.query(models.User).filter(models.User.id != current_user.id).all()

@app.post("/admin/users/{target_id}/role")
def change_user_role(target_id: int, req: schemas.RoleUpdateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "superadmin": raise HTTPException(status_code=403)
    target_user = db.query(models.User).filter(models.User.id == target_id).first()
    target_user.role = req.new_role
    db.commit()
    return {"message": "Роль изменена"}