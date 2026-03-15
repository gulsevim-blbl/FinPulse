from sqlalchemy import text
from app.db.database import engine

def check_columns():
    with engine.connect() as conn:
        result = conn.execute(text("SHOW COLUMNS FROM users"))
        for row in result:
            print(f"Column: {row[0]}, Type: {row[1]}")

if __name__ == "__main__":
    check_columns()
