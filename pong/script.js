class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startButton = document.getElementById('startButton');
        this.player1ScoreEl = document.getElementById('player1Score');
        this.player2ScoreEl = document.getElementById('player2Score');

        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            speed: 5,
            dx: 5,
            dy: 5
        };

        this.player1 = {
            x: 0,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            score: 0,
            speed: 10
        };

        this.player2 = {
            x: this.canvas.width - 10,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            score: 0,
            speed: 10
        };

        this.keys = {};
        this.gameRunning = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.startButton.addEventListener('click', () => this.startGame());
    }

    startGame() {
        if (this.gameRunning) return;
        this.gameRunning = true;
        this.resetBall();
        this.gameLoop();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = Math.random() > 0.5 ? 5 : -5;
        this.ball.dy = Math.random() > 0.5 ? 5 : -5;
    }

    movePlayers() {
        // Player 1 controls (W/S)
        if (this.keys['w'] && this.player1.y > 0) {
            this.player1.y -= this.player1.speed;
        }
        if (this.keys['s'] && this.player1.y < this.canvas.height - this.player1.height) {
            this.player1.y += this.player1.speed;
        }

        // Player 2 controls (Up/Down Arrows)
        if (this.keys['ArrowUp'] && this.player2.y > 0) {
            this.player2.y -= this.player2.speed;
        }
        if (this.keys['ArrowDown'] && this.player2.y < this.canvas.height - this.player2.height) {
            this.player2.y += this.player2.speed;
        }
    }

    drawObjects() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 15]);
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

        // Draw ball
        this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Wall collision (top and bottom)
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.dy *= -1;
        }

        // Paddle collision
        if (
            (this.ball.x - this.ball.radius < this.player1.x + this.player1.width &&
            this.ball.y > this.player1.y && 
            this.ball.y < this.player1.y + this.player1.height) ||
            (this.ball.x + this.ball.radius > this.player2.x &&
            this.ball.y > this.player2.y && 
            this.ball.y < this.player2.y + this.player2.height)
        ) {
            this.ball.dx *= -1.1; // Increase speed slightly on each hit
        }

        // Scoring
        if (this.ball.x < 0) {
            this.player2.score++;
            this.player2ScoreEl.textContent = this.player2.score;
            this.resetBall();
        }
        if (this.ball.x > this.canvas.width) {
            this.player1.score++;
            this.player1ScoreEl.textContent = this.player1.score;
            this.resetBall();
        }
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.movePlayers();
        this.moveBall();
        this.drawObjects();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});
