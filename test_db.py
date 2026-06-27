from sqlalchemy import create_engine
from models import Base

# Подключаемся к локальной базе SQLite (файл появится в папке)
engine = create_engine("sqlite:///database.db", echo=True)

# Даем команду создать все таблицы, которые мы описали в моделях
Base.metadata.create_all(bind=engine)

print("Успех! База данных и таблицы созданы.")