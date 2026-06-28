import uuid
from fastapi import HTTPException
from backend.app.domains.qr.repository import QRRepository
from backend.app.shared.events.bus import event_bus

class QRService:
    def __init__(self, repository: QRRepository):
        self.repository = repository

    def generate_qr(self, collectible_id: int) -> str:
        # Генерируем уникальный токен
        new_token = str(uuid.uuid4())[:8]
        qr = self.repository.create_qr(new_token, collectible_id)
        return qr.token

    async def scan_qr(self, token: str, user_id: int) -> dict:
        qr = self.repository.get_qr_by_token(token)
        
        if not qr or qr.is_used:
            raise HTTPException(status_code=400, detail="Неверный или использованный код")

        # Помечаем код как использованный
        self.repository.mark_as_used(qr)

        # Главное правило архитектуры: отправляем событие в Event Bus.
        # Домены Profile, Collection и Gameplay будут слушать это событие.
        await event_bus.publish("QR_VALIDATED", {
            "user_id": user_id,
            "collectible_id": qr.collectible_id,
            "qr_token": token
        })

        return {
            "message": "Код принят. Предмет отправлен на регистрацию в вашем профиле.", 
            "collectible_id": qr.collectible_id
        }