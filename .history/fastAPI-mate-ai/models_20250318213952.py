from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class Message(BaseModel):
    userId: str
    message: str
    timestamp: Optional[datetime] = None
    response: Optional[str] = None

# 数据库连接
client = AsyncIOMotorClient(settings.MONGO_URI)
db = client.get_database('ai-mate')
messages_collection = db.get_collection('messages')

async def save_message(message: Message):
    message.timestamp = datetime.now()
    await messages_collection.insert_one(message.dict())
    return message

async def get_user_messages(user_id: str, limit: int = 50):
    cursor = messages_collection.find({'userId': user_id}).sort('timestamp', -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    return messages