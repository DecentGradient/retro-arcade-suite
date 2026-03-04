const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart');

let board = Array(9).fill('');
let gameActive = true;
const huPlayer = 'X';
const aiPlayer = 'O';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handlePlayerTurn(clickedCell, clickedCellIndex);
}

function handlePlayerTurn(clickedCell, clickedCellIndex) {
    updateCell(clickedCell, clickedCellIndex, huPlayer);
    
    if (checkWin(board, huPlayer)) {
        statusDisplay.innerHTML = "You Win!";
        gameActive = false;
        return;
    }
    if (!board.includes('')) {
        statusDisplay.innerHTML = "Draw!";
        gameActive = false;
        return;
    }

    statusDisplay.innerHTML = "AI Thinking...";
    
    if (gameActive) {
        // AI Turn with slight delay for realism
        setTimeout(() => {
            const bestSpot = minimax(board, aiPlayer).index;
            if (bestSpot !== undefined && gameActive) {
                const aiCell = cells[bestSpot];
                updateCell(aiCell, bestSpot, aiPlayer);
                
                if (checkWin(board, aiPlayer)) {
                    statusDisplay.innerHTML = "AI Wins!";
                    gameActive = false;
                } else if (!board.includes('')) {
                    statusDisplay.innerHTML = "Draw!";
                    gameActive = false;
                } else {
                    statusDisplay.innerHTML = "Your Turn (X)";
                }
            }
        }, 500);
    }
}

function updateCell(cell, index, player) {
    board[index] = player;
    cell.innerHTML = player;
    cell.classList.add(player.toLowerCase());
}

function restartGame() {
    gameActive = true;
    board = Array(9).fill('');
    statusDisplay.innerHTML = "Your Turn (X)";
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o');
    });
}

// Minimax Algorithm
function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (checkWin(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer) {
            const result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }

    return bestMove;
}

function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
