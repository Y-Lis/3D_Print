from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.shared.database.connection import get_db
from backend.app.domains.games.schema import GameStartRequest, GameResultRequest, GameResultResponse
from backend.app.domains.games.repository import GameRepository
from backend.app.domains.games.service import GameService
from backend.app.domains.auth.router import get_current_user
from backend.app.domains.auth.model import User

router = APIRouter(prefix="/games", tags=["Games"])

def get_game_service(db: Session = Depends(get_db)) -> GameService:
    repo = GameRepository(db)
    return GameService(repo)

@router.post("/start")
def start_game(
    req: GameStartRequest,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service)
):
    """Инициализация игры со списанием энергии."""
    return service.start_game(current_user, req)

@router.post("/result", response_model=GameResultResponse)
def submit_result(
    req: GameResultRequest,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service)
):
    """Фиксация результатов уровня, изменение коэффициента и игрового уровня."""
    return service.process_result(current_user, req)