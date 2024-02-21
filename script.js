// Define initial chessboard state
let initialChessboard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],    
];

let deadBlackPieces = [];
let deadWhitePieces = [];

let chessboard = []; // Current chessboard state
resetChessboard(); // Initialize the chessboard

// Variable to keep track of current player (1 for white, -1 for black)
let currentPlayer = 1;

// Variable to keep track of whether the game is ongoing
let gameInProgress = true;

// Function to reset the chessboard
function resetChessboard() {
    // Deep copy the initial chessboard state
    chessboard = initialChessboard.map(row => [...row]);
    renderChessboard();
}

// Function to render the chessboard
function renderChessboard() {
    const table = document.getElementById('chessboard');
    table.innerHTML = ''; // Clear the table

    for (let i = 0; i < 8; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('td');
            cell.textContent = chessboard[i][j];
            cell.classList.add('piece');
            // Add mouseover event listener to highlight valid moves
            cell.addEventListener('mouseover', () => handleHover(i, j));
            // Add click event listener to each cell
            cell.addEventListener('click', () => handleClick(i, j));
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

// Function to handle click on chessboard cell
function handleClick(row, col) {
    const selectedPiece = chessboard[row][col];
    const table = document.getElementById('chessboard');

    // Check if the game is ongoing and it's the current player's turn
    if (!gameInProgress || (currentPlayer === 1 && selectedPiece >= '\u2654' && selectedPiece <= '\u2659') || (currentPlayer === -1 && selectedPiece >= '\u265A' && selectedPiece <= '\u265F')) {
        return; // Can't make a move
    }

    // Reset background color for all cells
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            table.rows[i].cells[j].classList.remove('valid-move', 'attacking-position');
        }
    }

    // Highlight valid moves for the selected piece
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            if (currentPlayer === 1 && isValidMove(row, col, i, j, selectedPiece)) {
                if (isValidAttack(row, col, i, j, selectedPiece)) {
                    table.rows[i].cells[j].classList.add('attacking-position');
                } else {
                    table.rows[i].cells[j].classList.add('valid-move');
                }
                // Add click event listener to each valid cell
                table.rows[i].cells[j].addEventListener('click', () => handleMove(row, col, i, j));
            } else if (currentPlayer === -1 && isValidMove(row, col, i, j, selectedPiece.toUpperCase())) {
                if (isValidAttack(row, col, i, j, selectedPiece.toUpperCase())) {
                    table.rows[i].cells[j].classList.add('attacking-position');
                } else {
                    table.rows[i].cells[j].classList.add('valid-move');
                }
                // Add click event listener to each valid cell
                table.rows[i].cells[j].addEventListener('click', () => handleMove(row, col, i, j));
            }
        }
    }
}

// Function to handle the move when clicking on a valid cell
function handleMove(startRow, startCol, endRow, endCol) {
    const selectedPiece = chessboard[startRow][startCol];
    if (chessboard[endRow][endCol] != ' ') {
        if (currentPlayer == 1) {
            deadWhitePieces.add(chessboard[endRow][endCol]);
        }
        else {
            deadBlackPieces.add(chessboard[endRow][endCol]);
        }
    }
    chessboard[endRow][endCol] = selectedPiece;
    chessboard[startRow][startCol] = ' ';
    renderChessboard();
    currentPlayer *= -1; // Switch players
}

// Function to add event listener to the reset button
document.getElementById('resetButton').addEventListener('click', resetChessboard);

// Function to check if a move is valid for pawn
function isValidMovePawn(startRow, startCol, endRow, endCol, piece) {
    const isBlack = piece === '♟';
    const direction = isBlack ? 1 : -1;

    // Regular move
    if (startCol === endCol) {
        if ((isBlack && endRow === startRow + direction) || (!isBlack && endRow === startRow + direction)) {
            return chessboard[endRow][endCol] === ' ';
        }
        // Initial two-step move
        if ((isBlack && startRow === 1 && endRow === 3) || (!isBlack && startRow === 6 && endRow === 4)) {
            return chessboard[endRow][endCol] === ' ' && chessboard[isBlack ? 2 : 5][endCol] === ' ';
        }
    }
    // Capture move
    else if (Math.abs(startCol - endCol) === 1 && (endRow === startRow + direction)) {
        return chessboard[endRow][endCol] !== ' ' && ((chessboard[startRow][startCol] >= '\u2654' && chessboard[startRow][startCol] <= '\u2659') !== (chessboard[endRow][endCol] >= '\u2654' && chessboard[endRow][endCol] <= '\u2659'));
    }
    return false;
}

// Function to check if a move is valid for rook
function isValidMoveRook(startRow, startCol, endRow, endCol, piece) {
    // Horizontal move
    if (startRow === endRow) {
        const step = endCol > startCol ? 1 : -1;
        for (let col = startCol + step; col !== endCol; col += step) {
            if (chessboard[startRow][col] !== ' ') {
                return false;
            }
        }
        return true;
    }
    // Vertical move
    else if (startCol === endCol) {
        const step = endRow > startRow ? 1 : -1;
        for (let row = startRow + step; row !== endRow; row += step) {
            if (chessboard[row][startCol] !== ' ') {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Function to check if a move is valid for knight
function isValidMoveKnight(startRow, startCol, endRow, endCol, piece) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

// Function to check if a move is valid for bishop
function isValidMoveBishop(startRow, startCol, endRow, endCol, piece) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    if (rowDiff === colDiff) {
        const rowStep = endRow > startRow ? 1 : -1;
        const colStep = endCol > startCol ? 1 : -1;
        for (let i = 1; i < rowDiff; i++) {
            if (chessboard[startRow + i * rowStep][startCol + i * colStep] !== ' ') {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Function to check if a move is valid for queen
function isValidMoveQueen(startRow, startCol, endRow, endCol, piece) {
    return isValidMoveRook(startRow, startCol, endRow, endCol, piece) || isValidMoveBishop(startRow, startCol, endRow, endCol, piece);
}

// Function to check if a move is valid for king
function isValidMoveKing(startRow, startCol, endRow, endCol, piece) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    return (rowDiff <= 1 && colDiff <= 1);
}

// Function to check if a move is valid for a given piece type
function isValidMove(startRow, startCol, endRow, endCol, piece) {
    if (startRow === endRow && startCol === endCol) {
        return false; // Same position
    }

    // If end position is occupied by a piece of the same team
    if (chessboard[endRow][endCol] !== ' ' && ((chessboard[startRow][startCol] >= '\u2654' && chessboard[startRow][startCol] <= '\u2659') == (chessboard[endRow][endCol] >= '\u2654' && chessboard[endRow][endCol] <= '\u2659'))) {
        return false; // Invalid move
    }
    
    switch (piece) {
        case '♟':
            return isValidMovePawn(startRow, startCol, endRow, endCol, piece);
        case '♜':
            return isValidMoveRook(startRow, startCol, endRow, endCol, piece);
        case '♞':
            return isValidMoveKnight(startRow, startCol, endRow, endCol, piece);
        case '♝':
            return isValidMoveBishop(startRow, startCol, endRow, endCol, piece);
        case '♛':
            return isValidMoveQueen(startRow, startCol, endRow, endCol, piece);
        case '♚':
            return isValidMoveKing(startRow, startCol, endRow, endCol, piece);
        case '♙':
            return isValidMovePawn(startRow, startCol, endRow, endCol, piece);
        case '♖':
            return isValidMoveRook(startRow, startCol, endRow, endCol, piece);
        case '♘':
            return isValidMoveKnight(startRow, startCol, endRow, endCol, piece);
        case '♗':
            return isValidMoveBishop(startRow, startCol, endRow, endCol, piece);
        case '♕':
            return isValidMoveQueen(startRow, startCol, endRow, endCol, piece);
        case '♔':
            return isValidMoveKing(startRow, startCol, endRow, endCol, piece);
        default:
            return false; // Invalid piece
    }
}

// Function to check if a move is an attack on an opponent's piece
function isValidAttack(startRow, startCol, endRow, endCol, piece) {
    // Check if the end position is occupied by an opponent's piece
    if (chessboard[endRow][endCol] !== ' ' && ((piece >= '\u2654' && piece <= '\u2659') !== (chessboard[endRow][endCol] >= '\u2654' && chessboard[endRow][endCol] <= '\u2659'))) {
        return isValidMove(startRow, startCol, endRow, endCol, piece);
    }
    return false;
}
