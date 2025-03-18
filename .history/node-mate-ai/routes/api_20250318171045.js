const express = require('express');
const axios = require('axios');
const UserData = require('../models/UserData');
const router = express.Router();

// 处理聊天消息
router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;

  try {
    // 调用 AI API 获取回复
    const aiResponse = await axios.post(
      process.env.AI_API_URL,
      { text: message },
      { headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` } }
    );

    const reply = aiResponse.data.text || aiResponse.data.message;

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
    // 调用 AI API（假设返回 summary 和 schedule）
    const aiResponse = await axios.post(
      process.env.AI_API_URL,
      { text: content },
      { headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` } }
    );

    const summary = aiResponse.data.summary;

    // 保存到数据库
    const newData = new UserData({ userId, type, content, summary });
    await newData.save();

    res.json({ summary, id: newData._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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