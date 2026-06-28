from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.shared.database.connection import engine
from backend.app.shared.database.base import Base

# Импорт роутеров независимых доменов
from backend.app.domains.auth.router import router as auth_router
from backend.app.domains.profile.router import router as profile_router
from backend.app.domains.collectibles.router import router as collectibles_router
from backend.app.domains.qr.router import router as qr_router
from backend.app.domains.collection.router import router as collection_router
from backend.app.domains.admin.router import router as admin_router
from backend.app.domains.crm.router import router as crm_router

# Импорт регистраторов событий (Event Driven Architecture)
from backend.app.domains.collection.events import register_collection_events
from backend.app.domains.profile.events import register_profile_events

# Инициализация всех таблиц, которые были привязаны к Base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ToyVerse API", description="Clean Architecture & Event Driven DDD", version="2.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация подписок на Event Bus
# Это гарантирует, что профиль и коллекция "услышат" сканирование QR-кода
register_collection_events()
register_profile_events()

# Подключение роутеров доменов
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(collectibles_router)
app.include_router(qr_router)
app.include_router(collection_router)
app.include_router(admin_router)
app.include_router(crm_router)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "architecture": "Event-Driven DDD"}