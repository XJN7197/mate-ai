from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Message, save_message
import httpx
from config import settings

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(message: Message):
    try:
        # 保存用户消息到数据库
        await save_message(message)

        # 调用AI API获取响应
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.AI_API_URL}/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": message.message}]
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="AI API调用失败")
            
            ai_response = response.json()
            message_content = ai_response['choices'][0]['message']['content']
            
            # 保存AI响应到数据库
            ai_message = Message(
                userId=message.userId,
                message=message_content,
                response=message.message  # 原始用户消息作为响应引用
            )
            await save_message(ai_message)
            
            return {"message": message_content}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)