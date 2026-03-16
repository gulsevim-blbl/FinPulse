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

async def send_email(email_to: EmailStr, subject: str, body: str, is_html: bool = False):
    """Genel e-posta gönderim fonksiyonu"""
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html if is_html else MessageType.plain
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"Email sent to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False

async def send_reset_password_email(email_to: EmailStr, token: str):
    """Şifre sıfırlama e-postası gönderir"""

    reset_link = f"http://localhost:5173/reset-password?token={token}"

    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FinPulse</h1>
                </div>

                <h2 style="color: #22d3ee; text-align: center;">Şifre Sıfırlama Talebi</h2>

                <p>Merhaba,</p>

                <p>
                    FinPulse hesabınız için bir <strong>şifre sıfırlama talebi</strong> aldık.
                    Yeni bir şifre belirlemek için aşağıdaki butona tıklayabilirsiniz.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                        Şifremi Sıfırla
                    </a>
                </div>

                <p style="color: #94a3b8; font-size: 14px;">
                    Eğer bu talebi siz oluşturmadıysanız bu e-postayı dikkate almayabilirsiniz.
                    Güvenliğiniz için bu bağlantı <strong>1 saat içinde geçerliliğini kaybedecektir.</strong>
                </p>

               <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
                    © 2026 FinPulse — Tüm Hakları Saklıdır.
                </div>

            </div>
        </body>
    </html>
    """

    return await send_email(
        email_to=email_to,
        subject="FinPulse - Şifre Sıfırlama Talebi",
        body=html,
        is_html=True
    )

async def send_alert_email(email_to: EmailStr, user_name: str, symbol: str, target_price: float, current_price: float, condition: str):
    """Premium Görünümlü Fiyat Alarmı E-postası"""
    
    color = "#10b981" if condition == "above" else "#f43f5e" # Yeşil (above) veya Kırmızı (below)
    condition_text = "Üzerine Çıktı" if condition == "above" else "Altına Düştü"
    arrow = "↑" if condition == "above" else "↓"

    html = f"""
    <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 28px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; padding: 12px; background: linear-gradient(to tr, #22d3ee, #2563eb); border-radius: 14px; margin-bottom: 10px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                        <span style="font-size: 24px; color: white; font-weight: bold;">FP</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">FinPulse</h1>
                    <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Smart Market Intelligence</p>
                </div>

                <div style="background-color: #1e293b; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #334155; text-align: center;">
                    <div style="color: {color}; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                        {symbol} ALARMI TETİKLENDİ
                    </div>
                    <div style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
                        ${current_price} <span style="font-size: 24px; font-weight: 400; color: {color};">{arrow}</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 14px;">
                        Hedeflenen Fiyat: <strong>${target_price}</strong> ({condition_text})
                    </div>
                </div>

                <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
                    Merhaba <strong>{user_name}</strong>,
                </p>
                <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
                    Takip ettiğiniz <strong>{symbol}</strong> varlığı belirlediğiniz <strong>${target_price}</strong> seviyesine ulaştı. Piyasa şu an oldukça hareketli görünüyor!
                </p>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="http://localhost:5173/dashboard" style="background: linear-gradient(to r, #06b6d4, #2563eb); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Piyasayı Görüntüle</a>
                </div>

                <div style="background-color: #0f172a; border-left: 4px solid #334155; padding: 15px; margin-top: 30px;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                        * Bu alarm otomatik olarak pasif hale getirilmiştir. Tekrar bildirim almak isterseniz uygulamadan yeni bir alarm kurabilirsiniz.
                    </p>
                </div>

                <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">
                
                <div style="text-align: center;">
                    <p style="color: #64748b; font-size: 12px;">© 2026 FinPulse Platform | Crypto IQ </p>
                    <div style="margin-top: 10px;">
                        <span style="color: #334155; margin: 0 10px;">•</span>
                        <a href="#" style="color: #475569; text-decoration: none; font-size: 11px;">E-posta Ayarları</a>
                        <span style="color: #334155; margin: 0 10px;">•</span>
                        <a href="#" style="color: #475569; text-decoration: none; font-size: 11px;">Destek</a>
                    </div>
                </div>
            </div>
        </body>
    </html>
    """
    return await send_email(email_to, f"🚨 Alarm: {symbol} Hedefe Ulaştı!", html, is_html=True)
