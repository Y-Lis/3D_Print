from datetime import datetime
from fastapi import HTTPException
from backend.app.domains.auth.model import User
from backend.app.domains.games.schema import GameResultRequest, GameResultResponse, GameStartRequest
from backend.app.domains.games.repository import GameRepository
from backend.app.domains.games.model import GameLog

class GameService:
    def __init__(self, repository: GameRepository):
        self.repository = repository

    def start_game(self, current_user: User, req: GameStartRequest) -> dict:
        # Проверяем лимиты энергии перед началом игры
        if current_user.energy < 20:
            raise HTTPException(status_code=400, detail="Недостаточно энергии для начала игры. Требуется 20 единиц.")
        
        current_user.energy -= 20
        self.repository.db.add(current_user)
        self.repository.db.commit()
        
        return {
            "status": "success",
            "message": f"Игра {req.game_name} успешно начата. Списано 20 энергии.",
            "remaining_energy": current_user.energy
        }

    def process_result(self, current_user: User, req: GameResultRequest) -> GameResultResponse:
        db = self.repository.db
        
        # Записываем лог сессии в базу для будущей аналитики и отчетов
        log = GameLog(
            user_id=current_user.id,
            game_name=req.game_name,
            level_passed=req.level_id,
            is_success=req.is_success,
            xp_earned=50 if req.is_success else 10,
            created_at=datetime.utcnow()
        )
        self.repository.log_game(log)

        message = "Уровень не пройден. Попробуйте еще раз!"
        
        if req.is_success:
            # ПОВЫШЕНИЕ УРОВНЯ: Строго после успешного прохождения игры
            current_user.level += 1
            
            # РОСТ КОЭФФИЦИЕНТА: Растет на 0.1 при активности, кап равен 2.0
            current_user.activity_coefficient = min(2.0, current_user.activity_coefficient + 0.1)
            
            # Обновляем временную метку активности, чтобы грейс-период (7 дней) пошел заново
            current_user.last_activity_at = datetime.utcnow()
            
            message = f"Поздравляем! Уровень {req.level_id} успешно пройден. Ваш игровой уровень повышен!"

        db.add(current_user)
        db.commit()

        return GameResultResponse(
            status="success",
            message=message,
            current_level=current_user.level,
            current_energy=current_user.energy,
            new_coefficient=round(current_user.activity_coefficient, 1)
        )