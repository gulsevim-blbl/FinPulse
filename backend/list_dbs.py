from sqlalchemy import text
from app.db.database import engine

def list_dbs():
    with engine.connect() as conn:
        result = conn.execute(text("SHOW DATABASES"))
        dbs = [row[0] for row in result]
        print(f"Databases: {dbs}")
        result = conn.execute(text("SELECT DATABASE()"))
        current_db = result.scalar()
        print(f"Current DB: {current_db}")

if __name__ == "__main__":
    list_dbs()
