const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let objects = [];
let score = 0;
let timeLeft = 30;
let level = 1;
let targetColor = '#FF0000';
let gameTimer;

// Установка размеров холста
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Класс игрового объекта
class GameObject {
    constructor(x, y, color, size, hidden) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.hidden = hidden;
        this.collected = false;
    }

    draw() {
        if(this.hidden || this.collected) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isClicked(x, y) {
        return !this.collected && 
            Math.sqrt((x-this.x)**2 + (y-this.y)**2) < this.size;
    }
}

// Создание уровня
function createLevel() {
    objects = [];
    const targetCount = 5 + level * 2;
    const hiddenCount = Math.min(3 + level, targetCount - 1);
    const objectSize = Math.max(12, 30 - level * 0.5);

    // Безопасная зона
    const safeArea = {
        x: 160,
        y: 120,
        width: canvas.width - 220,
        height: canvas.height - 180
    };

    for(let i = 0; i < targetCount; i++) {
        const hidden = i < hiddenCount;
        const x = Math.random() * safeArea.width + safeArea.x;
        const y = Math.random() * safeArea.height + safeArea.y;
        
        objects.push(new GameObject(
            x,
            y,
            targetColor,
            objectSize,
            hidden
        ));
    }
    document.getElementById('targetCount').textContent = targetCount;
}

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    objects.forEach(obj => obj.draw());
    
    document.getElementById('counter').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('timer').className = timeLeft <= 10 ? 'timer-danger' : '';
}

// Обработка кликов
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    objects.forEach(obj => {
        if(obj.isClicked(x, y) && obj.color === targetColor) {
            score++;
            obj.collected = true;
            if(score >= document.getElementById('targetCount').textContent) {
                clearInterval(gameTimer);
                alert(`Уровень ${level} пройден!`);
                level++;
                startLevel();
            }
        }
    });
});

// Запуск уровня
function startLevel() {
    clearInterval(gameTimer);
    score = 0;
    timeLeft = 30 + level * 3;
    targetColor = `hsl(${Math.random()*360}, 70%, 50%)`;
    document.querySelector('.target-sample').style.backgroundColor = targetColor;
    createLevel();
    
    gameTimer = setInterval(() => {
        timeLeft--;
        if(timeLeft <= 0) {
            clearInterval(gameTimer);
            alert('Время вышло! Попробуйте еще раз.');
            startLevel();
        }
    }, 1000);
}

// Система подсказок
function showAd() {
    if(confirm('Посмотреть рекламу для подсказки?')) {
        const originalStates = objects.map(obj => obj.hidden);
        objects.forEach(obj => obj.hidden = false);
        
        setTimeout(() => {
            objects.forEach((obj, index) => {
                obj.hidden = originalStates[index];
            });
        }, 2000);
    }
}

// Запуск игры
startLevel();
setInterval(gameLoop, 1000/60);