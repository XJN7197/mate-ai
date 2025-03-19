from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Message, save_message
import httpx
from config import settings

app = FastAPI()

# 添加根路径处理器
@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Mate AI"}

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
        # 验证请求数据
        if not message.userId or not message.message:
            raise HTTPException(status_code=400, detail="用户ID和消息内容不能为空")
            
        # 保存用户消息到数据库
        try:
            await save_message(message)
        except Exception as db_error:
            print(f"MongoDB保存用户消息失败: {str(db_error)}")
            raise HTTPException(status_code=500, detail="数据库操作失败，请稍后重试")

        # 调用AI API获取响应
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_API_URL}/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                    json={
                        "model": "deepseek-ai/DeepSeek-V3",
                        "messages": [{"role": "user", "content": message.message}]
                    },
                    timeout=30.0  # 设置超时时间
                )
                
                if response.status_code != 200:
                    error_detail = response.json() if response.status_code != 500 else "AI服务器内部错误"
                    print(f"AI API调用失败: {error_detail}")
                    raise HTTPException(status_code=503, detail="AI服务暂时不可用，请稍后重试")
                
                ai_response = response.json()
                message_content = ai_response['choices'][0]['message']['content']
        except httpx.TimeoutException:
            print("AI API请求超时")
            raise HTTPException(status_code=503, detail="AI服务暂时不可用，请稍后重试")
        except httpx.RequestError as request_error:
            print(f"AI API请求错误: {str(request_error)}")
            raise HTTPException(status_code=503, detail="AI服务暂时不可用，请稍后重试")
            
        # 保存AI响应到数据库
        try:
            ai_message = Message(
                userId=message.userId,
                message=message_content,
                response=message.message  # 原始用户消息作为响应引用
            )
            await save_message(ai_message)
        except Exception as db_error:
            print(f"MongoDB保存AI响应失败: {str(db_error)}")
            # 即使保存响应失败，仍然返回AI的回答
            return {"message": message_content}
            
        return {"message": message_content}
            
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print(f"未预期的错误: {str(e)}")
        raise HTTPException(status_code=500, detail="服务器内部错误，请稍后重试")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)