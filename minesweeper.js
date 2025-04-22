class Minesweeper {
    constructor() {
        this.boardSize = 10;
        this.mineCount = 10;
        this.board = [];
        this.gameOver = false;
        this.firstClick = true;
        this.flagsPlaced = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeBoard();
        this.setupEventListeners();
        this.updateMinesCount();
    }

    initializeBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0
                };
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                gameBoard.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const resetButton = document.getElementById('reset-button');
        
        gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        resetButton.addEventListener('click', () => this.resetGame());
    }

    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            if (!this.board[row][col].isMine && 
                (row < firstClickRow - 1 || row > firstClickRow + 1 ||
                 col < firstClickCol - 1 || col > firstClickCol + 1)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateAdjacentMines();
    }

    calculateAdjacentMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].isMine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const newRow = i + di;
                            const newCol = j + dj;
                            if (newRow >= 0 && newRow < this.boardSize &&
                                newCol >= 0 && newCol < this.boardSize &&
                                this.board[newRow][newCol].isMine) {
                                count++;
                            }
                        }
                    }
                    this.board[i][j].adjacentMines = count;
                }
            }
        }
    }

    handleCellClick(event) {
        if (this.gameOver) return;
        
        const cell = event.target;
        if (!cell.classList.contains('cell') || cell.classList.contains('flagged')) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        if (this.board[row][col].isMine) {
            this.revealAllMines();
            this.gameOver = true;
            this.stopTimer();
            return;
        }
        
        this.revealCell(row, col);
        this.checkWin();
    }

    handleRightClick(event) {
        if (this.gameOver) return;
        
        const cell = event.target;
        if (!cell.classList.contains('cell')) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (!this.board[row][col].isRevealed) {
            if (this.board[row][col].isFlagged) {
                this.board[row][col].isFlagged = false;
                cell.classList.remove('flagged');
                this.flagsPlaced--;
            } else {
                this.board[row][col].isFlagged = true;
                cell.classList.add('flagged');
                this.flagsPlaced++;
            }
            this.updateMinesCount();
        }
    }

    revealCell(row, col) {
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize ||
            this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        this.board[row][col].isRevealed = true;
        cell.classList.add('revealed');
        
        if (this.board[row][col].adjacentMines > 0) {
            cell.textContent = this.board[row][col].adjacentMines;
            cell.style.color = this.getNumberColor(this.board[row][col].adjacentMines);
        } else {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    this.revealCell(row + di, col + dj);
                }
            }
        }
    }

    revealAllMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j].isMine) {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    cell.classList.add('mine');
                }
            }
        }
    }

    checkWin() {
        let unrevealedCount = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].isRevealed && !this.board[i][j].isMine) {
                    unrevealedCount++;
                }
            }
        }
        
        if (unrevealedCount === 0) {
            this.gameOver = true;
            this.stopTimer();
            alert('Congratulations! You won!');
        }
    }

    updateMinesCount() {
        const minesCountElement = document.querySelector('.mines-count');
        minesCountElement.textContent = this.mineCount - this.flagsPlaced;
    }

    startTimer() {
        this.timer = 0;
        const timerElement = document.querySelector('.timer');
        this.timerInterval = setInterval(() => {
            this.timer++;
            timerElement.textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    resetGame() {
        this.gameOver = false;
        this.firstClick = true;
        this.flagsPlaced = 0;
        this.stopTimer();
        document.querySelector('.timer').textContent = '0';
        this.initializeBoard();
        this.updateMinesCount();
    }

    getNumberColor(number) {
        const colors = {
            1: '#0000FF',
            2: '#008000',
            3: '#FF0000',
            4: '#000080',
            5: '#800000',
            6: '#008080',
            7: '#000000',
            8: '#808080'
        };
        return colors[number] || '#000000';
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Minesweeper();
}); 