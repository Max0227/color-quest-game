require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Схема прогресса
const progressSchema = new mongoose.Schema({
    userId: Number,
    level: Number,
    score: Number,
    achievements: [String]
});

const Progress = mongoose.model('Progress', progressSchema);

// API для игры
app.get('/api/progress', async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.headers['x-telegram-user'] });
        res.json(progress || {});
    } catch(error) {
        res.status(500).send(error);
    }
});

app.post('/api/progress', async (req, res) => {
    try {
        const data = req.body;
        const progress = await Progress.findOneAndUpdate(
            { userId: req.headers['x-telegram-user'] },
            {
                level: data.level,
                score: data.score,
                achievements: data.achievements
            },
            { upsert: true, new: true }
        );
        res.json(progress);
    } catch(error) {
        res.status(500).send(error);
    }
});

// Команды бота
bot.start((ctx) => {
    ctx.reply('🎮 Добро пожаловать в Color Quest!', {
        reply_markup: {
            inline_keyboard: [[{
                text: 'Играть',
                web_app: { url: process.env.GAME_URL }
            }]]
        }
    });
});

bot.launch();
app.listen(3000, () => console.log('Server started'));
