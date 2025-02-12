class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.levelDisplay = document.getElementById('levelDisplay');

        // Game constants
        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = this.COLS * this.BLOCK_SIZE;
        this.BOARD_HEIGHT = this.ROWS * this.BLOCK_SIZE;

        // Game state
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.currentPiece = null;
        this.currentPosition = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;

        // Tetromino shapes
        this.SHAPES = [
            [[1, 1, 1, 1]],
            [[1, 1], [1, 1]],
            [[1, 1, 1], [0, 1, 0]],
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1, 1], [0, 0, 1]],
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1, 1], [1, 1, 0]]
        ];

        this.COLORS = [
            '#FF0D72', '#0DC2FF', '#0DFF72', 
            '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
        ];

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
    }

    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        
        if (!this.currentPiece) {
            this.generateNewPiece();
            this.gameLoop();
        }
    }

    resetGame() {
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.gameLoop();
        }
    }

    generateNewPiece() {
        const randomIndex = Math.floor(Math.random() * this.SHAPES.length);
        this.currentPiece = {
            shape: this.SHAPES[randomIndex],
            color: this.COLORS[randomIndex]
        };
        this.currentPosition = { 
            x: Math.floor(this.COLS / 2) - Math.ceil(this.currentPiece.shape[0].length / 2), 
            y: 0 
        };

        // Check for game over
        if (this.checkCollision()) {
            this.gameOver = true;
            alert(`Game Over! Your score: ${this.score}`);
        }
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board background
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.BOARD_WIDTH, this.BOARD_HEIGHT);

        // Draw existing blocks
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        col * this.BLOCK_SIZE, 
                        row * this.BLOCK_SIZE, 
                        this.BLOCK_SIZE - 1, 
                        this.BLOCK_SIZE - 1
                    );
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        this.ctx.fillStyle = this.currentPiece.color;
                        this.ctx.fillRect(
                            (this.currentPosition.x + dx) * this.BLOCK_SIZE,
                            (this.currentPosition.y + dy) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE - 1,
                            this.BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
    }

    movePiece(dx, dy) {
        this.currentPosition.x += dx;
        this.currentPosition.y += dy;

        if (this.checkCollision()) {
            // Revert the move
            this.currentPosition.x -= dx;
            this.currentPosition.y -= dy;

            // If moving down, lock the piece
            if (dy > 0) {
                this.lockPiece();
                this.clearLines();
                this.generateNewPiece();
            }
        }
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, index) => 
            this.currentPiece.shape.map(row => row[index]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (this.checkCollision()) {
            // Revert rotation if it causes a collision
            this.currentPiece.shape = originalShape;
        }
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (
                    this.currentPiece.shape[y][x] &&
                    (
                        this.currentPosition.x + x < 0 ||
                        this.currentPosition.x + x >= this.COLS ||
                        this.currentPosition.y + y >= this.ROWS ||
                        (this.board[this.currentPosition.y + y] && 
                         this.board[this.currentPosition.y + y][this.currentPosition.x + x])
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    lockPiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    this.board[this.currentPosition.y + dy][this.currentPosition.x + dx] = 
                        this.currentPiece.color;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                // Remove the line
                this.board.splice(y, 1);
                // Add a new empty line at the top
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }

        // Update score based on lines cleared
        if (linesCleared > 0) {
            const scoreMultiplier = [40, 100, 300, 1200];
            this.score += scoreMultiplier[linesCleared - 1] * this.level;
            this.scoreDisplay.textContent = this.score;

            // Increase level every 10 lines
            if (Math.floor(this.score / 1000) + 1 > this.level) {
                this.level++;
                this.levelDisplay.textContent = this.level;
            }
        }
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch(event.key) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
        this.drawBoard();
    }

    gameLoop() {
        if (this.gameOver || this.isPaused) return;

        // Move piece down
        this.movePiece(0, 1);
        this.drawBoard();

        // Set game speed based on level
        setTimeout(() => this.gameLoop(), Math.max(100, 1000 - (this.level * 100)));
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
