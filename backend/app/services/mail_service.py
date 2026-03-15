from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.smtp_user,
    MAIL_PASSWORD=settings.smtp_password,
    MAIL_FROM=settings.emails_from_email,
    MAIL_PORT=settings.smtp_port,
    MAIL_SERVER=settings.smtp_host,
    MAIL_FROM_NAME=settings.emails_from_name,
    MAIL_STARTTLS=settings.smtp_tls,
    MAIL_SSL_TLS=settings.smtp_ssl,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_reset_password_email(email_to: EmailStr, token: str):
   
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
                <h2 style="color: #22d3ee; text-align: center;">FinPulse Şifre Sıfırlama</h2>
                <p>Merhaba,</p>
                <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold;">Şifremi Sıfırla</a>
                </div>
                <p style="color: #94a3b8; font-size: 14px;">Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.</p>
                <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">
                <p style="text-align: center; color: #64748b; font-size: 12px;">© 2026 FinPulse | Tüm Hakları Saklıdır.</p>
            </div>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="FinPulse - Şifre Sıfırlama Talebi",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"Password reset email sent to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False
