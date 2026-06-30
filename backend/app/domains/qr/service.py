from uuid import uuid4
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.domains.qr.model import QRCode
from backend.app.domains.qr.schema import QRGenerateCrm
from backend.app.domains.qr.repository import QRRepository
from backend.app.domains.auth.model import User
from backend.app.domains.collectibles.repository import CollectibleRepository
from backend.app.domains.collection.repository import CollectionRepository
from backend.app.domains.bonus.model import BonusTransaction

class QRService:
    def __init__(self, repository: QRRepository):
        self.repository = repository

    def generate_qr(self, current_user: User, payload: QRGenerateCrm) -> QRCode:
        if current_user.role not in ["admin", "superadmin"]:
            raise HTTPException(status_code=403, detail="Недостаточно прав для генерации QR-кода")
        
        db: Session = self.repository.db
        collectible_repo = CollectibleRepository(db)
        collectible = collectible_repo.get_by_id(payload.collectible_id)
        if not collectible:
            raise HTTPException(status_code=404, detail="Игрушка не найдена")
            
        token = str(uuid4())[:8]
        qr_code = QRCode(
            token=token,
            collectible_id=payload.collectible_id,
            burn_bonuses=payload.burn_bonuses,
            is_used=False,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        return self.repository.save(qr_code)

    def scan_qr(self, token: str, current_user: User) -> dict:
        qr_code = self.repository.get_by_token(token)
        if not qr_code:
            raise HTTPException(status_code=404, detail="QR-код не найден")
            
        if qr_code.is_used:
            raise HTTPException(status_code=400, detail="Этот QR-код уже был использован")
            
        if qr_code.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Срок действия QR-кода истек")
            
        db: Session = self.repository.db
        collectible_repo = CollectibleRepository(db)
        collectible = collectible_repo.get_by_id(qr_code.collectible_id)
        if not collectible:
            raise HTTPException(status_code=404, detail="Связанная игрушка не найдена")
            
        # 1. Списание бонусов (если заложено)
        if qr_code.burn_bonuses > 0:
            if current_user.balance < qr_code.burn_bonuses:
                raise HTTPException(status_code=400, detail=f"Недостаточно бонусов. Нужно: {qr_code.burn_bonuses}, есть: {current_user.balance}")
            
            current_user.balance -= qr_code.burn_bonuses
            spent_tx = BonusTransaction(
                user_id=current_user.id,
                collectible_id=collectible.id,
                operation_type="spent",
                amount=qr_code.burn_bonuses,
                created_at=datetime.utcnow()
            )
            db.add(spent_tx)

        # 2. Логика "деградации" коэффициента при долгом бездействии
        now = datetime.utcnow()
        days_since_active = (now - current_user.last_activity_at).days
        
        if days_since_active > 7 and current_user.activity_coefficient > 1.0:
            decay_days = days_since_active - 7
            decay_amount = decay_days * 0.1
            new_coeff = max(1.0, current_user.activity_coefficient - decay_amount)
            current_user.activity_coefficient = new_coeff
            # Сдвигаем дату так, чтобы завтра сгорело еще 0.1 (эффект непрерывного штрафа)
            current_user.last_activity_at = now - timedelta(days=7)

        # 3. Расчет кэшбека с учетом коэффициента активности
        final_cashable_price = max(0, collectible.price - qr_code.burn_bonuses)
        base_cashback = final_cashable_price * 0.1
        bonus_cashback = int(base_cashback * current_user.activity_coefficient)
        
        if bonus_cashback > 0:
            current_user.balance += bonus_cashback
            earned_tx = BonusTransaction(
                user_id=current_user.id,
                collectible_id=collectible.id,
                operation_type="earned",
                amount=bonus_cashback,
                created_at=datetime.utcnow()
            )
            db.add(earned_tx)

        # 4. Добавление предмета в коллекцию
        collection_repo = CollectionRepository(db)
        collection_repo.add_to_collection(
            user_id=current_user.id,
            collectible_id=collectible.id
        )
        
        qr_code.is_used = True
        qr_code.used_by_user_id = current_user.id
        qr_code.used_at = datetime.utcnow()
        
        self.repository.save(qr_code)
        
        # Сохраняем обновленные данные пользователя (баланс и коэффициент)
        db.add(current_user)
        db.commit()
        
        return {
            "status": "success",
            "message": f"Покупка '{collectible.name}' оформлена. Множитель: x{current_user.activity_coefficient:.1f}. Начислено: {bonus_cashback} бонусов.",
            "collectible_id": collectible.id,
            "bonus_spent": qr_code.burn_bonuses,
            "bonus_earned": bonus_cashback,
            "current_balance": current_user.balance,
            "applied_coefficient": round(current_user.activity_coefficient, 1)
        }