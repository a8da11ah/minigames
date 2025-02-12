// Snake Game Implementation

class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.highScoreDisplay = document.getElementById('highScoreDisplay');
        this.gameOverDisplay = document.getElementById('gameOverDisplay'); // Added game over display

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = {};
        this.dx = this.gridSize;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0; // Persistent high score
        this.gameRunning = false;
        this.gameAnimationFrame = null;

        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => this.changeDirection(e));

        // Initialize high score display
        this.highScoreDisplay.textContent = this.highScore;
    }

    initializeSnake() {
        this.snake = [
            {x: 10 * this.gridSize, y: 10 * this.gridSize},
            {x: 9 * this.gridSize, y: 10 * this.gridSize},
            {x: 8 * this.gridSize, y: 10 * this.gridSize}
        ];
    }

    drawSnake() {
        this.ctx.fillStyle = 'green';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize - 2, this.gridSize - 2);
        });
    }

    moveSnake() {
        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };

        this.snake.unshift(head);

        // Check if snake eats food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreDisplay.textContent = this.score;
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
                y: Math.floor(Math.random() * this.tileCount) * this.gridSize
            };
        } while (this.snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        ));
        
        this.food = newFood;
    }

    drawFood() {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize - 2, this.gridSize - 2);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (
            head.x < 0 || 
            head.x >= this.canvas.width || 
            head.y < 0 || 
            head.y >= this.canvas.height
        ) {
            return true;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    gameLoop() {
        if (!this.gameRunning) return;

        if (this.checkCollision()) {
            this.endGame();
            return;
        }

        this.clearCanvas();
        this.moveSnake();
        this.drawFood();
        this.drawSnake();

        this.gameAnimationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    changeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const keyPressed = event.key;
        const goingUp = this.dy === -this.gridSize;
        const goingDown = this.dy === this.gridSize;
        const goingRight = this.dx === this.gridSize;
        const goingLeft = this.dx === -this.gridSize;

        switch(keyPressed) {
            case 'ArrowLeft':
                if (!goingRight) {
                    this.dx = -this.gridSize;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (!goingLeft) {
                    this.dx = this.gridSize;
                    this.dy = 0;
                }
                break;
            case 'ArrowUp':
                if (!goingDown) {
                    this.dx = 0;
                    this.dy = -this.gridSize;
                }
                break;
            case 'ArrowDown':
                if (!goingUp) {
                    this.dx = 0;
                    this.dy = this.gridSize;
                }
                break;
        }
    }

    startGame() {
        if (this.gameRunning) return;

        // Reset game state
        this.gameRunning = true;
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.gameOverDisplay.style.display = 'none';
        this.initializeSnake();
        this.dx = this.gridSize;
        this.dy = 0;
        this.generateFood();
        this.gameLoop();
    }

    restartGame() {
        cancelAnimationFrame(this.gameAnimationFrame);
        this.startGame();
    }

    endGame() {
        cancelAnimationFrame(this.gameAnimationFrame);
        this.gameRunning = false;
        this.updateHighScore();
        this.gameOverDisplay.textContent = `Game Over! Your Score: ${this.score}`;
        this.gameOverDisplay.style.display = 'block';
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreDisplay.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame('gameCanvas');
});
