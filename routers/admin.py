from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Order, OrderItem, User
from schemas import ProductCreate, ProductRestock, RoleUpdate
from dependencies import get_admin_user, get_super_admin_user

router = APIRouter(tags=["Admin Panel"])

@router.post("/catalog")
def add_product(product: ProductCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    new_product = Product(name=product.name, price=product.price, stock_quantity=product.stock_quantity, image_url=product.image_url)
    db.add(new_product)
    db.commit()
    return {"message": "Товар добавлен"}

@router.put("/catalog/{product_id}/restock")
def restock_product(product_id: int, restock_data: ProductRestock, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.stock_quantity += restock_data.add_quantity
        db.commit()
    return {"message": "Остатки обновлены", "new_quantity": product.stock_quantity}

@router.put("/admin/orders/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Заказ не найден или уже отменен")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product: product.stock_quantity += item.quantity
            
    buyer = db.query(User).filter(User.id == order.user_id).first()
    if buyer:
        buyer.bonus_balance = max(0, buyer.bonus_balance - order.earned_bonuses)
        
    order.status = "cancelled"
    db.commit()
    return {"message": "Заказ отменен, товары и бонусы возвращены"}

@router.get("/admin/stats/sales")
def get_sales_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    items = db.query(OrderItem).all()
    sales_data = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order = db.query(Order).filter(Order.id == item.order_id).first()
        buyer = db.query(User).filter(User.id == order.user_id).first()
        if order.status == "completed":
            sales_data.append({
                "product_name": product.name if product else "Удален",
                "quantity_sold": item.quantity,
                "purchase_price": item.price_at_purchase,
                "buyer_phone": buyer.phone if buyer else "Неизвестно",
            })
    return {"total_items_sold": len(sales_data), "details": sales_data}

# --- ФУНКЦИИ СУПЕР-АДМИНА ---

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), super_admin: User = Depends(get_super_admin_user)):
    users = db.query(User).all()
    return [{"id": u.id, "phone": u.phone, "role": u.role} for u in users]

@router.put("/admin/users/{target_user_id}/role")
def change_user_role(target_user_id: int, role_data: RoleUpdate, db: Session = Depends(get_db), super_admin: User = Depends(get_super_admin_user)):
    if role_data.new_role not in ["client", "admin"]:
        raise HTTPException(status_code=400, detail="Допустимые роли: client, admin")
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if target_user.role == "super_admin":
        raise HTTPException(status_code=400, detail="Нельзя изменить роль Главного администратора")
    
    target_user.role = role_data.new_role
    db.commit()
    return {"message": f"Пользователю с номером {target_user.phone} назначена роль {target_user.role}"}

@router.delete("/admin/users/{target_user_id}")
def delete_user(target_user_id: int, db: Session = Depends(get_db), super_admin: User = Depends(get_super_admin_user)):
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if target_user.role == "super_admin":
        raise HTTPException(status_code=400, detail="Нельзя удалить Главного администратора")
    
    db.delete(target_user)
    db.commit()
    return {"message": f"Пользователь с номером {target_user.phone} удален."}