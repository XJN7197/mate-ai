from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class UserData(Base):
    __tablename__ = 'user_data'

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(String, index=True)
    message = Column(String)
    response = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 数据库连接配置
DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(DATABASE_URL)

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建数据库会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()