import sqlite3

# Подключаемся к базе данных
conn = sqlite3.connect('database.db')

# Достаем всех пользователей
users = conn.execute("SELECT phone, password_hash, role FROM users").fetchall()

print("\n--- СПИСОК ПОЛЬЗОВАТЕЛЕЙ ---")
for user in users:
    print(f"Роль: {user[2]} | Телефон: {user[0]} | Пароль: {user[1]}")
print("----------------------------\n")