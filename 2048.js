// 定义游戏的基本常量
const GRID_SIZE = 4; // 游戏板的大小（4x4）
const CELL_SIZE = 100; // 每个单元格的大小（像素）
const CELL_GAP = 15; // 单元格之间的间隙（像素）

const ANIMATION_DURATION = 100; // 减少到100ms以加快动画速度

// 获取DOM元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');

// 定义全局变量
let board; // 游戏板数组
let score; // 当前分数
let isMoving = false; // 是否正在移动中
let gameStarted = false; // 游戏是否已开始
let tileIdCounter = 0; // 用于生成唯一的方块ID

// 初始化游戏
function initGame() {
    // 创建一个4x4的空游戏板
    board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    score = 0; // 重置分数
    tileIdCounter = 0; // 重置 ID 计数器
    gameBoard.innerHTML = ''; // 清空游戏板
    addNewTile(); // 添加一个新方块
    addNewTile(); // 再添加一个新方块
    updateBoard(); // 更新游戏板显示
    gameStarted = true; // 标记游戏已开始
    isMoving = false; // 确保移动标志被重置
}

// 在随机空位置添加一个新方块
function addNewTile() {
    const emptyTiles = [];
    // 找出所有空位置
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({row: i, col: j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        // 随机选择一个空位置
        const {row, col} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        // 90%概率生成2，10%概率生成4
        const value = Math.random() < 0.9 ? 2 : 4;
        board[row][col] = {
            value: value,
            id: tileIdCounter++,
            isNew: true
        };
        // 立即创建并添加新方块到游戏板
        const tile = createNewTile(board[row][col]);
        const x = col * (CELL_SIZE + CELL_GAP) + CELL_GAP;
        const y = row * (CELL_SIZE + CELL_GAP) + CELL_GAP;
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
        gameBoard.appendChild(tile);
    }
}

// 更新游戏板显示
function updateBoard() {
    moveTiles(board);
    scoreElement.textContent = score; // 更新分数显示
}

// 获取方块的颜色（未使用，可以删除或用于自定义颜色）
function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

// 检查是否达到胜利条件（2048）
function checkWin() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] !== 0 && board[i][j].value === 2048) {
                alert('恭喜你赢了！');
                return true;
            }
        }
    }
    return false;
}

// 滑动并合并一行或一列
function slideAndMerge(row) {
    let newRow = row.filter(tile => tile !== 0);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i].value === newRow[i + 1].value) {
            newRow[i] = {
                value: newRow[i].value * 2,
                id: newRow[i].id,
                merged: true
            };
            score += newRow[i].value;
            newRow.splice(i + 1, 1);
        }
    }
    while (newRow.length < GRID_SIZE) {
        newRow.push(0);
    }
    return newRow;
}

// 检查是否还能移动
function canMove() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 0) return true; // 有空格可以移动
            if (i < GRID_SIZE - 1 && board[i][j].value === board[i + 1][j].value) return true; // 可以向下合并
            if (j < GRID_SIZE - 1 && board[i][j].value === board[i][j + 1].value) return true; // 可以向右合并
        }
    }
    return false; // 无法移动
}

// 处理移动
function move(direction) {
    if (!gameStarted || isMoving) return;
    isMoving = true;

    let hasChanged = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    // 重置所有方块的merged状态和记录原始位置
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (newBoard[i][j] !== 0) {
                newBoard[i][j].merged = false;
                newBoard[i][j].oldRow = i;
                newBoard[i][j].oldCol = j;
            }
        }
    }

    if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
        for (let i = 0; i < GRID_SIZE; i++) {
            let row = newBoard[i].filter(tile => tile !== 0);
            if (direction === 'ArrowRight') row.reverse();
            let newRow = slideAndMerge(row);
            if (direction === 'ArrowRight') newRow.reverse();
            newBoard[i] = newRow.concat(Array(GRID_SIZE - newRow.length).fill(0));
            if (JSON.stringify(board[i]) !== JSON.stringify(newBoard[i])) {
                hasChanged = true;
            }
        }
    } else {
        for (let j = 0; j < GRID_SIZE; j++) {
            let col = newBoard.map(row => row[j]).filter(tile => tile !== 0);
            if (direction === 'ArrowDown') col.reverse();
            let newCol = slideAndMerge(col);
            if (direction === 'ArrowDown') newCol.reverse();
            for (let i = 0; i < GRID_SIZE; i++) {
                newBoard[i][j] = newCol[i] || 0;
                if (board[i][j] !== newBoard[i][j]) {
                    hasChanged = true;
                }
            }
        }
    }

    if (hasChanged) {
        moveTiles(newBoard);
        setTimeout(() => {
            board = newBoard;
            addNewTile();
            updateBoard();
            if (checkWin()) {
                setTimeout(() => {
                    alert('恭喜你赢了！');
                    gameStarted = false;
                }, ANIMATION_DURATION);
            } else if (!canMove()) {
                setTimeout(() => {
                    alert('游戏结束！');
                    gameStarted = false;
                }, ANIMATION_DURATION);
            }
            isMoving = false;
        }, ANIMATION_DURATION);
    } else {
        isMoving = false;
    }
}

// 移动方块的动画
function moveTiles(newBoard) {
    const tiles = document.querySelectorAll('.tile');
    const tileMap = new Map();

    tiles.forEach(tile => {
        tileMap.set(parseInt(tile.dataset.id), tile);
    });

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const newTile = newBoard[i][j];
            if (newTile !== 0) {
                const tile = tileMap.get(newTile.id) || createNewTile(newTile);
                const x = j * (CELL_SIZE + CELL_GAP) + CELL_GAP;
                const y = i * (CELL_SIZE + CELL_GAP) + CELL_GAP;

                tile.style.zIndex = newTile.isNew ? '20' : '10';
                tile.style.transition = `all ${ANIMATION_DURATION}ms ease-in-out`;
                tile.style.left = `${x}px`;
                tile.style.top = `${y}px`;
                tile.textContent = newTile.value;
                tile.className = `tile tile-${newTile.value}`;

                if (newTile.merged) {
                    tile.classList.add('tile-merged');
                }

                if (!tileMap.has(newTile.id)) {
                    gameBoard.appendChild(tile);
                }
            }
        }
    }

    tiles.forEach(tile => {
        const id = parseInt(tile.dataset.id);
        if (!newBoard.flat().some(cell => cell !== 0 && cell.id === id)) {
            tile.remove();
        }
    });
}

// 创建新的方块元素
function createNewTile(tileData) {
    const tile = document.createElement('div');
    tile.className = `tile tile-${tileData.value}`;
    tile.textContent = tileData.value;
    tile.dataset.id = tileData.id;
    // 移除初始的透明度和缩放
    // tile.style.opacity = '0';
    // tile.style.transform = 'scale(0.5)';
    return tile;
}

// 添加键盘事件监听器
document.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) && gameStarted) {
        event.preventDefault();
        if (!isMoving) {
            move(event.key);
        }
    }
});

// 添加新游戏按钮事件监听器
document.getElementById('new-game').addEventListener('click', () => {
    initGame();
    gameStarted = true;
});

// 确保在页面加载时初始化游戏
window.addEventListener('load', () => {
    initGame();
    gameStarted = true;
});
