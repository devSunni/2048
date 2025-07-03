class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = localStorage.getItem('2048-best-score') || 0;
        this.gameOver = false;
        this.won = false;
        this.records = this.loadRecords();
        
        this.init();
    }
    
    init() {
        this.updateScore();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.updateRecordsDisplay();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 새 게임 버튼
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        // 터치 이벤트 (모바일 스와이프)
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        let startX, startY, endX, endY;
        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
        }, { passive: true });
    }
    
    newGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.updateScore();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.updateGameStatus('');
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        const originalGrid = JSON.parse(JSON.stringify(this.grid));
        let moved = false;
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameState();
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            const newRow = row.concat(Array(4 - row.length).fill(0));
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            const newRow = Array(4 - row.length).fill(0).concat(row);
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            const newColumn = column.concat(Array(4 - column.length).fill(0));
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            const newColumn = Array(4 - column.length).fill(0).concat(column);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    checkGameState() {
        // 2048 달성 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 2048 && !this.won) {
                    this.won = true;
                    this.updateGameStatus('🎉 2048 달성! 계속 플레이하세요!');
                }
            }
        }
        
        // 게임 오버 확인
        if (this.isGameOver()) {
            this.gameOver = true;
            this.updateGameStatus('게임 오버! 다시 시도해보세요.');
            // 게임 오버 시 기록 저장
            if (this.score > 0) {
                this.addRecord(this.score);
            }
        }
    }
    
    isGameOver() {
        // 빈 셀이 있는지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 합칠 수 있는 타일이 있는지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                if ((i < 3 && this.grid[i + 1][j] === current) ||
                    (j < 3 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore);
        }
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }
    
    loadRecords() {
        const records = localStorage.getItem('2048-records');
        return records ? JSON.parse(records) : [];
    }
    
    saveRecords() {
        localStorage.setItem('2048-records', JSON.stringify(this.records));
    }
    
    addRecord(score) {
        const newRecord = {
            score: score,
            date: new Date().toLocaleDateString('ko-KR'),
            timestamp: Date.now()
        };
        
        this.records.push(newRecord);
        this.records.sort((a, b) => b.score - a.score);
        this.records = this.records.slice(0, 5); // 상위 5개만 유지
        this.saveRecords();
        this.updateRecordsDisplay();
    }
    
    updateRecordsDisplay() {
        const recordsList = document.getElementById('records-list');
        recordsList.innerHTML = '';
        
        if (this.records.length === 0) {
            recordsList.innerHTML = '<p style="color: #776e65; font-style: italic;">아직 기록이 없습니다</p>';
            return;
        }
        
        this.records.forEach((record, index) => {
            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';
            recordItem.innerHTML = `
                <span class="record-score">${record.score}</span>
                <span class="record-date">${record.date}</span>
            `;
            recordsList.appendChild(recordItem);
        });
    }
    
    updateDisplay() {
        this.updateScore();
        
        // 기존 타일 제거
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 새로운 타일 생성
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    cell.appendChild(tile);
                }
            }
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
}); 