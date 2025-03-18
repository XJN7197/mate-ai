const express = require('express');
const axios = require('axios');
const UserData = require('../models/UserData');
const router = express.Router();

// 处理聊天消息
router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;

  try {
    // 调用 AI API 获取回复
    console.log('Sending request to AI API:', {
      url: process.env.AI_API_URL,
      message: message
    });
    
    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/v1/chat/completions`,
      {
        model: "grok-2-1212",
        messages: [{ role: "user", content: message }]
      },
      { 
        headers: { 
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 设置30秒超时
        validateStatus: function (status) {
          return status >= 200 && status < 500; // 只有状态码大于等于500时才会reject
        }
      }
    );

    console.log('AI API Response:', aiResponse.data);
    const reply = aiResponse.data.choices?.[0]?.message?.content || aiResponse.data.text || aiResponse.data.message;

    // 保存对话记录
    const userMessage = new UserData({ userId, type: 'user', content: message });
    const aiMessage = new UserData({ userId, type: 'ai', content: reply });
    
    await Promise.all([
      userMessage.save(),
      aiMessage.save()
    ]);

    res.json({ message: reply });
  } catch (error) {
    console.error('Chat API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'Failed to process chat message';
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'No response received from AI API';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    res.status(error.response?.status || 500).json({ message: errorMessage });
  }
});

// 处理用户输入并调用 AI
router.post('/input', async (req, res) => {
  const { userId, type, content } = req.body;

  try {
    // 调用 AI API
    console.log('Sending request to AI API:', {
      url: process.env.AI_API_URL,
      content: content
    });

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/v1/chat/completions`,
      {
        model: "grok-2-1212",
        messages: [{ role: "user", content: content }]
      },
      { 
        headers: { 
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 设置30秒超时
        validateStatus: function (status) {
          return status >= 200 && status < 500; // 只有状态码大于等于500时才会reject
        }
      }
    );

    console.log('AI API Response:', aiResponse.data);
    const summary = aiResponse.data.choices?.[0]?.message?.content || aiResponse.data.summary;

    // 保存到数据库
    const newData = new UserData({ userId, type, content, summary });
    await newData.save();

    res.json({ summary, id: newData._id });
  } catch (error) {
    console.error('Input API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'Failed to process input';
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'No response received from AI API';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    res.status(error.response?.status || 500).json({ message: errorMessage });
  }
});

// 获取用户历史记录
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await UserData.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;