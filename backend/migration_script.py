from sqlalchemy import text
from app.db.database import engine
from app.core.config import settings

def migrate():
    print(f"Connecting to database to add missing columns...")
    with engine.connect() as conn:
        try:
            # reset_token sütununu ekle
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL"))
            print("Added reset_token column.")
        except Exception as e:
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("reset_token column already exists.")
            else:
                print(f"Error adding reset_token: {e}")

        try:
            # reset_token_expiry sütununu ekle
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL"))
            print("Added reset_token_expiry column.")
        except Exception as e:
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("reset_token_expiry column already exists.")
            else:
                print(f"Error adding reset_token_expiry: {e}")
        
        conn.commit()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
