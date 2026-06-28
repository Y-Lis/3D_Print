from backend.app.shared.events.bus import event_bus
from backend.app.shared.database.connection import SessionLocal
from backend.app.domains.profile.repository import ProfileRepository
from backend.app.domains.profile.service import ProfileService
from backend.app.domains.collectibles.repository import CollectibleRepository

async def on_qr_validated_for_profile(payload: dict):
    db = SessionLocal()
    try:
        profile_repo = ProfileRepository(db)
        profile_service = ProfileService(profile_repo)
        
        collectible_id = payload.get("collectible_id")
        product_price = 500  # Стандартное начисление, если цена не указана
        
        if collectible_id:
            collectible_repo = CollectibleRepository(db)
            collectible = collectible_repo.get_by_id(collectible_id)
            if collectible:
                product_price = collectible.price

        await profile_service.handle_qr_validated(payload, product_price)
    finally:
        db.close()

def register_profile_events():
    """
    Регистрация слушателей событий для домена Profile.
    Будет вызываться при инициализации приложения.
    """
    event_bus.subscribe("QR_VALIDATED", on_qr_validated_for_profile)