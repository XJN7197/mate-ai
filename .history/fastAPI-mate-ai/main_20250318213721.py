from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    userId: str
    message: str

class ChatResponse(BaseModel):
    message: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    # TODO: 实现AI对话逻辑
    return ChatResponse(message=f"Echo: {message.message}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)