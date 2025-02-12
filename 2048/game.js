class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        
        this.initializeBoard();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeBoard() {
        // Clear existing board
        this.gameBoard.innerHTML = '';
        this.board = Array.from({ length: this.boardSize }, () => 
            Array(this.boardSize).fill(0)
        );
        
        // Create grid cells
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tile');
            this.gameBoard.appendChild(cell);
        }

        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.board[r][c] = value;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const tiles = this.gameBoard.querySelectorAll('.tile');
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const index = r * this.boardSize + c;
                const value = this.board[r][c];
                const tile = tiles[index];
                
                // Reset tile classes
                tile.className = 'tile';
                
                // Add value-specific class if tile has a value
                if (value !== 0) {
                    tile.classList.add(`tile-${value}`);
                    tile.textContent = value;
                } else {
                    tile.textContent = '';
                }
            }
        }

        // Update score
        this.scoreDisplay.textContent = this.score;
        this.bestScoreDisplay.textContent = this.bestScore;
    }

    move(direction) {
        let moved = false;

        const rotateBoard = () => {
            const newBoard = Array.from({ length: this.boardSize }, () => 
                Array(this.boardSize).fill(0)
            );
            for (let r = 0; r < this.boardSize; r++) {
                for (let c = 0; c < this.boardSize; c++) {
                    newBoard[r][c] = this.board[this.boardSize - 1 - c][r];
                }
            }
            this.board = newBoard;
        };

        const slide = () => {
            for (let r = 0; r < this.boardSize; r++) {
                let row = this.board[r].filter(val => val !== 0);
                
                // Merge tiles
                for (let c = 0; c < row.length - 1; c++) {
                    if (row[c] === row[c + 1]) {
                        row[c] *= 2;
                        this.score += row[c];
                        row.splice(c + 1, 1);
                    }
                }

                // Pad with zeros
                while (row.length < this.boardSize) {
                    row.push(0);
                }

                // Check if board changed
                for (let c = 0; c < this.boardSize; c++) {
                    if (this.board[r][c] !== row[c]) {
                        moved = true;
                    }
                }

                this.board[r] = row;
            }
        };

        // Rotate board to standardize sliding
        switch(direction) {
            case 'ArrowLeft':
                slide();
                break;
            case 'ArrowRight':
                // Reverse rows before sliding
                this.board = this.board.map(row => row.reverse());
                slide();
                this.board = this.board.map(row => row.reverse());
                break;
            case 'ArrowUp':
                // Rotate counter-clockwise, slide, then rotate back
                for (let i = 0; i < 3; i++) rotateBoard();
                slide();
                rotateBoard();
                break;
            case 'ArrowDown':
                // Rotate clockwise, slide, then rotate back
                rotateBoard();
                slide();
                for (let i = 0; i < 3; i++) rotateBoard();
                break;
        }

        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }

        // Add new tile if board changed
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
        }

        this.checkGameStatus();
    }

    checkGameStatus() {
        // Check for win condition
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 2048) {
                    alert('Congratulations! You won!');
                    return;
                }
            }
        }

        // Check for lose condition
        const hasEmptyCell = this.board.some(row => row.includes(0));
        const canMerge = this.checkMergePossible();

        if (!hasEmptyCell && !canMerge) {
            alert('Game Over! No more moves possible.');
        }
    }

    checkMergePossible() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize - 1; c++) {
                if (this.board[r][c] === this.board[r][c + 1]) return true;
            }
        }

        for (let c = 0; c < this.boardSize; c++) {
            for (let r = 0; r < this.boardSize - 1; r++) {
                if (this.board[r][c] === this.board[r + 1][c]) return true;
            }
        }

        return false;
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key);
            }
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                this.move(diffX > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else {
                // Vertical swipe
                this.move(diffY > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        });

        // New Game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.score = 0;
            this.initializeBoard();
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
