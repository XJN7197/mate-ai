const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 用户唯一标识
  type: { type: String, enum: ['goal', 'inspiration', 'diary', 'user', 'ai'], required: true }, // 输入类型
  content: { type: String, required: true }, // 用户输入内容
  summary: { type: String }, // AI 整理后的摘要
  createdAt: { type: Date, default: Date.now }, // 创建时间
});

module.exports = mongoose.model('UserData', UserDataSchema);