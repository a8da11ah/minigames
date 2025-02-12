class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.board = [];
        this.mineLocations = new Set();
        this.gameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flagsPlaced = 0;
        
        this.initializeGame('beginner');
        this.setupEventListeners();
    }

    initializeGame(difficulty) {
        this.difficulty = this.difficulties[difficulty];
        this.gameOver = false;
        this.firstClick = true;
        this.flagsPlaced = 0;
        this.mineLocations.clear();
        this.stopTimer();
        this.timer = 0;
        document.getElementById('timer').textContent = '0';
        document.getElementById('mines-count').textContent = this.difficulty.mines;
        
        this.createBoard();
        this.renderBoard();
    }

    createBoard() {
        const { rows, cols } = this.difficulty;
        this.board = Array(rows).fill().map(() => 
            Array(cols).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );
    }

    placeMines(firstClickRow, firstClickCol) {
        const { rows, cols, mines } = this.difficulty;
        let minesPlaced = 0;
        
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            // Don't place mine on first click or where a mine already exists
            if ((row !== firstClickRow || col !== firstClickCol) && 
                !this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                this.mineLocations.add(`${row},${col}`);
                minesPlaced++;
            }
        }
        
        this.calculateNeighborMines();
    }

    calculateNeighborMines() {
        const { rows, cols } = this.difficulty;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!this.board[row][col].isMine) {
                    let count = 0;
                    this.getNeighbors(row, col).forEach(([r, c]) => {
                        if (this.board[r][c].isMine) count++;
                    });
                    this.board[row][col].neighborMines = count;
                }
            }
        }
    }

    getNeighbors(row, col) {
        const { rows, cols } = this.difficulty;
        const neighbors = [];
        
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                
                const newRow = row + r;
                const newCol = col + c;
                
                if (newRow >= 0 && newRow < rows && 
                    newCol >= 0 && newCol < cols) {
                    neighbors.push([newRow, newCol]);
                }
            }
        }
        
        return neighbors;
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        const { rows, cols } = this.difficulty;
        
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col].isRevealed) {
                    this.updateCellDisplay(cell, row, col);
                }
                
                if (this.board[row][col].isFlagged) {
                    cell.textContent = '🚩';
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }

    updateCellDisplay(cell, row, col) {
        const currentCell = this.board[row][col];
        cell.classList.add('revealed');
        
        if (currentCell.isMine) {
            cell.textContent = '💣';
            cell.classList.add('mine');
        } else if (currentCell.neighborMines > 0) {
            cell.textContent = currentCell.neighborMines;
            cell.style.color = this.getNumberColor(currentCell.neighborMines);
        }
    }

    getNumberColor(number) {
        const colors = [
            '#0000FF', '#008000', '#FF0000', '#000080',
            '#800000', '#008080', '#000000', '#808080'
        ];
        return colors[number - 1] || '#000000';
    }

    revealCell(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        const cell = this.board[row][col];
        if (cell.isRevealed) return;
        
        cell.isRevealed = true;
        
        if (cell.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.stopTimer();
            setTimeout(() => alert('Game Over!'), 100);
            return;
        }
        
        if (cell.neighborMines === 0) {
            this.getNeighbors(row, col).forEach(([r, c]) => {
                if (!this.board[r][c].isRevealed) {
                    this.revealCell(r, c);
                }
            });
        }
        
        this.renderBoard();
        this.checkWin();
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) return;
        
        const cell = this.board[row][col];
        cell.isFlagged = !cell.isFlagged;
        this.flagsPlaced += cell.isFlagged ? 1 : -1;
        
        document.getElementById('mines-count').textContent = 
            this.difficulty.mines - this.flagsPlaced;
        
        this.renderBoard();
    }

    revealAllMines() {
        this.mineLocations.forEach(loc => {
            const [row, col] = loc.split(',').map(Number);
            this.board[row][col].isRevealed = true;
        });
        this.renderBoard();
    }

    checkWin() {
        const { rows, cols, mines } = this.difficulty;
        let unrevealedCount = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!this.board[row][col].isRevealed) unrevealedCount++;
            }
        }
        
        if (unrevealedCount === mines) {
            this.gameOver = true;
            this.stopTimer();
            setTimeout(() => alert('Congratulations! You won!'), 100);
        }
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const newGameBtn = document.getElementById('new-game-btn');
        const difficultyBtns = document.querySelectorAll('.difficulty button');
        
        gameBoard.addEventListener('click', (e) => {
            const cell = e.target;
            if (cell.classList.contains('cell')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.revealCell(row, col);
            }
        });
        
        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const cell = e.target;
            if (cell.classList.contains('cell')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.toggleFlag(row, col);
            }
        });
        
        newGameBtn.addEventListener('click', () => {
            this.initializeGame(this.currentDifficulty || 'beginner');
        });
        
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.currentDifficulty = difficulty;
                this.initializeGame(difficulty);
            });
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
