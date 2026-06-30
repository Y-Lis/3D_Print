from sqlalchemy.orm import Session
from backend.app.domains.games.model import GameLog

class GameRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_game(self, log: GameLog) -> GameLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log