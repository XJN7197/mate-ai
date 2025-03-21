const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');  // 添加 cors 导入

// 加载环境变量
dotenv.config();

const app = express();

// 配置 CORS
app.use(cors({
  origin: '*',  // 允许所有来源访问，生产环境建议设置具体的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 中间件：解析 JSON 请求体
app.use(express.json());

// 连接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// 根路由处理
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Mate AI API Server' });
});

// API路由
app.use('/api', require('./routes/api'));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));