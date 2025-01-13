const BOARD_SIZE = 19;
let currentPlayer = 'black';
let gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null)); // 初始化游戏棋盘
let gameActive = true;
let startTime = Date.now();
let moves = 0;

// 添加游戏历史记录数组
let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

// 添加音乐控制变量
let isMusicPlaying = false;

function createBoard() {
    const board = document.getElementById('board');
    if (!board) {
        console.error('找不到棋盘元素');
        return;
    }
    board.innerHTML = ''; // 清空棋盘
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleMove);
            board.appendChild(cell);
        }
    }
}

// 修改事件监听器初始化
window.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initMusicSettings();
});

function initializeEventListeners() {
    const startButton = document.getElementById('startButton');
    const backButton = document.getElementById('backButton');
    const historyButton = document.getElementById('historyButton');
    const musicSettingsButton = document.getElementById('musicSettingsButton');
    
    if (startButton) {
        startButton.addEventListener('click', () => {
            document.getElementById('cover').classList.add('hidden');
            document.getElementById('gameContainer').classList.remove('hidden');
            initGame();
        });
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            document.getElementById('cover').classList.remove('hidden');
            document.getElementById('gameContainer').classList.add('hidden');
        });
    }

    if (historyButton) {
        historyButton.addEventListener('click', showHistory);
    }

    if (musicSettingsButton) {
        musicSettingsButton.addEventListener('click', showMusicSettings);
    }

    // 添加音乐控制相关事件监听
    const musicToggle = document.getElementById('musicToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const bgMusic = document.getElementById('bgMusic');
    
    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicToggle.classList.add('paused');
            } else {
                bgMusic.play();
                musicToggle.classList.remove('paused');
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    if (volumeSlider && volumeValue && bgMusic) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            bgMusic.volume = volume / 100;
            volumeValue.textContent = `${volume}%`;
        });
    }
}

// 添加初始化音乐设置函数
function initMusicSettings() {
    const bgMusic = document.getElementById('bgMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    if (bgMusic && volumeSlider) {
        bgMusic.volume = volumeSlider.value / 100;
    }
}

function initGame() {
    gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    gameActive = true;
    startTime = Date.now();
    moves = 0;
    updateMoveCount(); // 重置回合数显示
    createBoard();
    
    const currentPlayerSpan = document.getElementById('current-player');
    if (currentPlayerSpan) {
        currentPlayerSpan.textContent = '黑子';
    }
}

// 修改resetGame函数
function resetGame() {
    const modal = document.getElementById('gameOverModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 返回首页
    const cover = document.getElementById('cover');
    const gameContainer = document.getElementById('gameContainer');
    cover.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

function handleMove(event) {
    if (!gameActive) return;
    
    let cell = event.target;
    if (cell.classList.contains('piece')) {
        return;
    }
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (!gameBoard[row] || !gameBoard[row][col] === undefined) {
        console.error('无效的棋盘位置');
        return;
    }

    if (gameBoard[row][col]) return;

    moves++;
    updateMoveCount(); // 更新回合数显示
    placePiece(cell, row, col);
    
    if (checkWin(row, col)) {
        gameActive = false;
        setTimeout(() => {
            showGameOver(currentPlayer);
        }, 100);
        return;
    }

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    const currentPlayerSpan = document.getElementById('current-player');
    if (currentPlayerSpan) {
        currentPlayerSpan.textContent = currentPlayer === 'black' ? '黑子' : '白子';
    }
}

function placePiece(cell, row, col) {
    const piece = document.createElement('div');
    piece.className = `piece ${currentPlayer}`;
    cell.appendChild(piece);
    gameBoard[row][col] = currentPlayer;
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]], // 水平
        [[1, 0], [-1, 0]], // 垂直
        [[1, 1], [-1, -1]], // 对角线
        [[1, -1], [-1, 1]] // 反对角线
    ];

    return directions.some(dir => {
        const count = 1 + 
            countDirection(row, col, dir[0][0], dir[0][1]) +
            countDirection(row, col, dir[1][0], dir[1][1]);
        return count >= 5;
    });
}

function countDirection(row, col, deltaRow, deltaCol) {
    let count = 0;
    let currentRow = row + deltaRow;
    let currentCol = col + deltaCol;

    while (
        currentRow >= 0 && currentRow < BOARD_SIZE &&
        currentCol >= 0 && currentCol < BOARD_SIZE &&
        gameBoard[currentRow][currentCol] === currentPlayer
    ) {
        count++;
        currentRow += deltaRow;
        currentCol += deltaCol;
    }

    return count;
}

function showGameOver(winner) {
    const modal = document.getElementById('gameOverModal');
    const winnerText = document.getElementById('winner-text');
    const gameTime = document.getElementById('game-time');
    const totalMoves = document.getElementById('total-moves');
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    winnerText.textContent = `${winner === 'black' ? '黑子' : '白子'}获胜！`;
    gameTime.textContent = timeSpent;
    totalMoves.textContent = moves;
    
    modal.style.display = 'block';

    // 保存游戏记录
    const gameRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        winner: winner === 'black' ? '黑子' : '白子',
        moves: moves,
        duration: timeSpent,
        board: JSON.parse(JSON.stringify(gameBoard))
    };
    
    gameHistory.push(gameRecord);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}

function updateMoveCount() {
    const moveCountSpan = document.getElementById('move-count');
    if (moveCountSpan) {
        moveCountSpan.textContent = moves;
    }
}

// ...existing code...

function showHistory() {
    console.log('显示战绩...');
    
    // 创建新的模态框
    const modalHTML = `
        <div id="historyModal" class="history-modal">
            <div class="modal-content">
                <button class="close-modal">×</button>
                <h2>对局历史</h2>
                <div id="historyList"></div>
                <div id="historyDetail" style="display: none;">
                    <h3>对局详情</h3>
                    <div id="gameDetails"></div>
                    <button onclick="showHistoryList()">返回列表</button>
                </div>
            </div>
        </div>
    `;

    // 移除旧模态框并添加新模态框
    const oldModal = document.getElementById('historyModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 获取新创建的模态框元素
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    
    // 绑定关闭按钮事件
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    
    // 显示历史记录
    if (!Array.isArray(gameHistory) || gameHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px;">暂无对局记录</p>';
        return;
    }
    
    const recordsHTML = gameHistory.reverse().map(game => `
        <div class="history-item" onclick="showGameDetail(${game.id})">
            <div>对局时间: ${game.date}</div>
            <div>获胜方: ${game.winner}</div>
            <div>总步数: ${game.moves}</div>
        </div>
    `).join('');
    
    historyList.innerHTML = recordsHTML;
}

function showGameDetail(gameId) {
    const game = gameHistory.find(g => g.id === gameId);
    if (!game) return;
    
    const historyList = document.getElementById('historyList');
    const historyDetail = document.getElementById('historyDetail');
    const gameDetails = document.getElementById('gameDetails');
    
    historyList.style.display = 'none';
    historyDetail.style.display = 'block';
    
    // 创建历史棋盘HTML
    const boardHTML = `
        <div class="history-board">
            ${Array(BOARD_SIZE).fill().map((_, i) => 
                Array(BOARD_SIZE).fill().map((_, j) => {
                    const piece = game.board[i][j];
                    return `
                        <div class="history-cell">
                            ${piece ? `<div class="history-piece ${piece}"></div>` : ''}
                        </div>
                    `;
                }).join('')
            ).join('')}
        </div>
    `;
    
    gameDetails.innerHTML = `
        <div class="game-details">
            <div class="details-info">
                <p><strong>对局时间:</strong> ${game.date}</p>
                <p><strong>获胜方:</strong> ${game.winner}</p>
                <p><strong>总步数:</strong> ${game.moves}</p>
                <p><strong>对局时长:</strong> ${game.duration}秒</p>
            </div>
            ${boardHTML}
        </div>
    `;
}

function showHistoryList() {
    const historyList = document.getElementById('historyList');
    const historyDetail = document.getElementById('historyDetail');
    
    if (historyList && historyDetail) {
        historyList.style.display = 'block';
        historyDetail.style.display = 'none';
    }
}

// ...existing code...

function showMusicSettings() {
    const musicSettingsHTML = `
        <div id="musicSettings" class="music-settings">
            <div class="music-header">
                <button class="back-button" id="musicBackButton">返回首页</button>
                <h2>音乐设置</h2>
            </div>
            <div class="music-controls">
                <div class="control-item">
                    <span>背景音乐</span>
                    <button id="toggleMusic" class="music-btn ${isMusicPlaying ? '' : 'paused'}">
                        ${isMusicPlaying ? '暂停' : '播放'}
                    </button>
                </div>
                <div class="control-item">
                    <span>音量控制</span>
                    <input type="range" id="musicVolume" class="volume-control" 
                           min="0" max="100" value="${document.getElementById('bgMusic')?.volume * 100 || 50}">
                </div>
                <div class="control-item">
                    <span>当前音量</span>
                    <span id="currentVolume">${document.getElementById('bgMusic')?.volume * 100 || 50}%</span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', musicSettingsHTML);

    // 绑定事件
    const musicSettings = document.getElementById('musicSettings');
    const toggleMusic = document.getElementById('toggleMusic');
    const musicVolume = document.getElementById('musicVolume');
    const currentVolume = document.getElementById('currentVolume');
    const musicBackButton = document.getElementById('musicBackButton');
    const bgMusic = document.getElementById('bgMusic');

    if (musicBackButton) {
        musicBackButton.addEventListener('click', () => {
            musicSettings?.remove();
        });
    }

    if (toggleMusic && bgMusic) {
        toggleMusic.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                toggleMusic.classList.add('paused');
                toggleMusic.textContent = '播放';
            } else {
                bgMusic.play();
                toggleMusic.classList.remove('paused');
                toggleMusic.textContent = '暂停';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    if (musicVolume && currentVolume && bgMusic) {
        musicVolume.addEventListener('input', (e) => {
            const volume = e.target.value;
            bgMusic.volume = volume / 100;
            currentVolume.textContent = `${volume}%`;
        });
    }
}

// 初始化游戏
createBoard();
