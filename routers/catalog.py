from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Favorite, RestockSubscription, Order, OrderItem, User
from schemas import OrderCreate
from dependencies import get_current_user

router = APIRouter(tags=["Catalog & Orders"])

@router.get("/catalog")
def get_catalog(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True, Product.stock_quantity > 0).all()

@router.get("/catalog/{product_id}")
def view_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.view_count += 1
        db.commit()
    return product

@router.post("/favorites/{product_id}")
def add_to_favorites(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_fav = Favorite(user_id=current_user.id, product_id=product_id)
    db.add(new_fav)
    db.commit()
    return {"message": "Добавлено в избранное"}

@router.post("/subscribe/{product_id}")
def subscribe_to_restock(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_sub = RestockSubscription(user_id=current_user.id, product_id=product_id)
    db.add(new_sub)
    db.commit()
    return {"message": "Вы подписаны"}

@router.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_order = Order(user_id=current_user.id, total_amount=0, earned_bonuses=0)
    db.add(new_order)
    db.flush()
    
    total_amount = 0
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Товар недоступен в нужном количестве")
        
        product.stock_quantity -= item.quantity
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_item = OrderItem(order_id=new_order.id, product_id=product.id, quantity=item.quantity, price_at_purchase=product.price)
        db.add(order_item)
        
    earned_bonuses = int(total_amount * 0.05)
    new_order.total_amount = total_amount
    new_order.earned_bonuses = earned_bonuses
    current_user.bonus_balance += earned_bonuses
    db.commit()
    return {"message": "Заказ оформлен!", "total_amount": total_amount, "earned_bonuses": earned_bonuses}

@router.get("/orders/my")
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == current_user.id).all()