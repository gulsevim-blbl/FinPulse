import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def send_email(self, recipient_email: str, subject: str, message_body: str):
        # Eğer ayarlar eksikse mail göndermeyi atla ama log düş
        if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
            logger.warning(f"SMTP ayarları eksik. Mail gönderilemedi: {recipient_email}")
            return False

        try:
            # Email mesajını oluştur
            msg = MIMEMultipart()
            msg["From"] = f"{settings.emails_from_name} <{settings.emails_from_email}>"
            msg["To"] = recipient_email
            msg["Subject"] = subject

            # Mesaj içeriğini ekle (HTML de eklenebilir ama şu an düz metin)
            msg.attach(MIMEText(message_body, "plain", "utf-8"))

            # Sunucuya bağlan ve maili gönder
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                if settings.smtp_tls:
                    server.starttls()
                
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
                
            logger.info(f"E-posta başarıyla gönderildi: {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"E-posta gönderme hatası ({recipient_email}): {e}")
            return False

email_service = EmailService()
