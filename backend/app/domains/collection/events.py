from backend.app.shared.events.bus import event_bus
from backend.app.domains.collection.service import CollectionService
from backend.app.shared.database.connection import SessionLocal
from backend.app.domains.collection.repository import CollectionRepository

async def on_qr_validated(payload: dict):
    # Обработчики событий работают асинхронно и вне скоупа HTTP-запроса, 
    # поэтому мы открываем и закрываем сессию БД вручную.
    db = SessionLocal()
    try:
        repo = CollectionRepository(db)
        service = CollectionService(repo)
        await service.handle_qr_validated(payload)
    finally:
        db.close()

def register_collection_events():
    """
    Регистрируем слушателей для домена Collection.
    Эта функция будет вызываться при старте приложения в main.py.
    """
    event_bus.subscribe("QR_VALIDATED", on_qr_validated)