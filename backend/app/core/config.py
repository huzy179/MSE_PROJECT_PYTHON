import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    # Database settings
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASS: str = os.getenv("DB_PASS", "postgres")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "MSE")

    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "MSE_2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 3

    # CORS settings
    BACKEND_CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5174").split(
            ","
        )
    ]

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
