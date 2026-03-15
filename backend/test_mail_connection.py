import asyncio
from app.services.mail_service import send_reset_password_email
from app.core.config import settings

async def test_mail():
    print(f"Testing mail with User: {settings.smtp_user}")
    print(f"Host: {settings.smtp_host}, Port: {settings.smtp_port}")
    # We use a known existing email or just any address to test SMTP connection
    success = await send_reset_password_email("gulsevimblbl@gmail.com", "test-token-123")
    if success:
        print("SUCCESS! Check your inbox.")
    else:
        print("FAILED! Check logs/terminal for errors.")

if __name__ == "__main__":
    asyncio.run(test_mail())
