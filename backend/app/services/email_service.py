import logging
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

VERIFY_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .container {{ background: #f9fafb; border-radius: 12px; padding: 32px; margin: 20px 0; }}
        .button {{ display: inline-block; background: #2563eb; color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0; }}
        .button:hover {{ background: #1d4ed8; }}
        .footer {{ color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Подтвердите ваш email</h2>
        <p>Добро пожаловать в {app_name}!</p>
        <p>Для завершения регистрации нажмите кнопку ниже:</p>
        <a href="{verification_url}" class="button">Подтвердить email</a>
        <p>Или скопируйте эту ссылку в браузер:</p>
        <p style="word-break: break-all; font-size: 13px; color: #6b7280;">{verification_url}</p>
        <p>Ссылка действительна в течение 24 часов.</p>
        <p>Если вы не регистрировались в {app_name}, просто проигнорируйте это письмо.</p>
    </div>
    <div class="footer">
        <p>Это автоматическое письмо, отвечать на него не нужно.</p>
        <p>{app_name}</p>
    </div>
</body>
</html>
"""

RESET_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .container {{ background: #f9fafb; border-radius: 12px; padding: 32px; margin: 20px 0; }}
        .button {{ display: inline-block; background: #2563eb; color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0; }}
        .button:hover {{ background: #1d4ed8; }}
        .footer {{ color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }}
        .code {{ font-family: monospace; font-size: 24px; letter-spacing: 4px; color: #2563eb; background: #eff6ff; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 12px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Сброс пароля</h2>
        <p>Вы получили это письмо, потому что запросили сброс пароля для вашего аккаунта.</p>
        <p>Код для сброса пароля:</p>
        <div class="code">{code}</div>
        <p>Код действителен в течение {minutes} минут.</p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
    </div>
    <div class="footer">
        <p>Это автоматическое письмо, отвечать на него не нужно.</p>
        <p>{app_name}</p>
    </div>
</body>
</html>
"""


async def send_verification_email(email: str, verification_url: str) -> bool:
    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP not configured. Verification URL for %s: %s",
            email,
            verification_url,
        )
        return True

    try:
        import aiosmtplib
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = email
        msg["Subject"] = f"Подтвердите email — {settings.APP_NAME}"

        html = VERIFY_EMAIL_TEMPLATE.format(
            verification_url=verification_url,
            app_name=settings.APP_NAME,
        )
        msg.add_alternative(html, subtype="html")

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info("Verification email sent to %s", email)
        return True
    except Exception:
        logger.exception("Failed to send verification email to %s", email)
        return False


async def send_password_reset_email(email: str, reset_code: str) -> bool:
    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP not configured. Password reset code for %s: %s",
            email,
            reset_code,
        )
        return True

    try:
        import aiosmtplib
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = email
        msg["Subject"] = "Сброс пароля — Finance Tutor"

        html = RESET_EMAIL_TEMPLATE.format(
            code=reset_code,
            minutes=settings.PASSWORD_RESET_EXPIRATION_MINUTES,
            app_name=settings.APP_NAME,
        )
        msg.add_alternative(html, subtype="html")

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info("Password reset email sent to %s", email)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", email)
        return False
