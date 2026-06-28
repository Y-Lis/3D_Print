from backend.app.domains.collection.repository import CollectionRepository
from backend.app.shared.events.bus import event_bus

class CollectionService:
    def __init__(self, repository: CollectionRepository):
        self.repository = repository

    def get_my_collection(self, user_id: int):
        return self.repository.get_user_collection(user_id)

    async def handle_qr_validated(self, payload: dict):
        """
        Бизнес-логика, которая срабатывает при валидации QR кода.
        """
        user_id = payload.get("user_id")
        collectible_id = payload.get("collectible_id")
        
        if user_id and collectible_id:
            # Проверяем, есть ли уже предмет в коллекции (защита от дубликатов)
            if not self.repository.has_item(user_id, collectible_id):
                self.repository.add_item(user_id, collectible_id)
                
                # Сообщаем остальной системе, что коллекция обновилась.
                # Дальше это могут слушать домены Gameplay, Achievements, Loyalty и Profile
                await event_bus.publish("COLLECTION_UPDATED", {
                    "user_id": user_id,
                    "collectible_id": collectible_id,
                    "total_items": len(self.repository.get_user_collection(user_id))
                })