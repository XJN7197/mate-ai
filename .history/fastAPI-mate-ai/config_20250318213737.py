from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./chat.db"
    
    # AI模型配置
    MODEL_NAME: str = "gpt-3.5-turbo"
    MAX_TOKENS: int = 150
    TEMPERATURE: float = 0.7
    
    # API配置
    API_V1_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()