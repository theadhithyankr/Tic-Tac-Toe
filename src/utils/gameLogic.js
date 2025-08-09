/**
 * Game Logic Utilities for Tic-Tac-Toe
 * Handles win detection, AI moves, and game state management
 */

/**
 * Calculate winner for any grid size
 * @param {Array} squares - Current board state
 * @param {number} gridSize - Size of the grid (3 or 4)
 * @returns {Object|null} - Winner info or null
 */
export function calculateWinner(squares, gridSize) {
  const lines = [];
  
  // Generate all possible winning lines for any grid size
  // Horizontal lines
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - 3; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push(row * gridSize + col + i);
      }
      lines.push(line);
    }
  }
  
  // Vertical lines
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - 3; row++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col);
      }
      lines.push(line);
    }
  }
  
  // Diagonal lines (top-left to bottom-right)
  for (let row = 0; row <= gridSize - 3; row++) {
    for (let col = 0; col <= gridSize - 3; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col + i);
      }
      lines.push(line);
    }
  }
  
  // Diagonal lines (top-right to bottom-left)
  for (let row = 0; row <= gridSize - 3; row++) {
    for (let col = 2; col < gridSize; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col - i);
      }
      lines.push(line);
    }
  }

  // Check for winner
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c], type: 'winner' };
    }
  }
  
  // Check for draw
  if (squares.every(Boolean)) return { winner: null, line: null, type: 'draw' };
  
  return null;
}

/**
 * Find winning move for a player
 * @param {Array} board - Current board state
 * @param {string} playerSymbol - Symbol to check for winning move
 * @param {number} gridSize - Size of the grid
 * @returns {number|null} - Index of winning move or null
 */
export function findWinningMove(board, playerSymbol, gridSize) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = playerSymbol;
      if (calculateWinner(testBoard, gridSize)?.winner === playerSymbol) {
        return i;
      }
    }
  }
  return null;
}

/**
 * Find blocking move against opponents
 * @param {Array} board - Current board state
 * @param {string} playerSymbol - Current player's symbol
 * @param {Array} allPlayers - All player configurations
 * @param {number} gridSize - Size of the grid
 * @returns {number|null} - Index of blocking move or null
 */
export function findBlockingMove(board, playerSymbol, allPlayers, gridSize) {
  const opponents = allPlayers.filter(p => p.symbol !== playerSymbol);
  
  for (const opponent of opponents) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = opponent.symbol;
        if (calculateWinner(testBoard, gridSize)?.winner === opponent.symbol) {
          return i;
        }
      }
    }
  }
  return null;
}

/**
 * Make AI move based on difficulty
 * @param {Array} board - Current board state
 * @param {string} playerSymbol - AI player's symbol
 * @param {string} difficulty - AI difficulty level
 * @param {Array} allPlayers - All player configurations
 * @param {number} gridSize - Size of the grid
 * @returns {number|null} - Index of AI move or null
 */
export function makeAIMove(board, playerSymbol, difficulty, allPlayers, gridSize) {
  const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
  
  if (emptyCells.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      // Random move
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      
    case 'medium':
      // Try to win, then try to block, then random
      const winMove = findWinningMove(board, playerSymbol, gridSize);
      if (winMove !== null) return winMove;
      
      const blockMove = findBlockingMove(board, playerSymbol, allPlayers, gridSize);
      if (blockMove !== null) return blockMove;
      
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      
    case 'hard':
      // Advanced strategy: win > block > center > corner > random
      const winMoveHard = findWinningMove(board, playerSymbol, gridSize);
      if (winMoveHard !== null) return winMoveHard;
      
      const blockMoveHard = findBlockingMove(board, playerSymbol, allPlayers, gridSize);
      if (blockMoveHard !== null) return blockMoveHard;
      
      // Try center (for 3x3) or middle cells (for 4x4)
      const centerCells = gridSize === 3 ? [4] : [5, 6, 9, 10];
      const availableCenters = centerCells.filter(cell => emptyCells.includes(cell));
      if (availableCenters.length > 0) {
        return availableCenters[Math.floor(Math.random() * availableCenters.length)];
      }
      
      // Try corners
      const corners = gridSize === 3 ? [0, 2, 6, 8] : [0, 3, 12, 15];
      const availableCorners = corners.filter(cell => emptyCells.includes(cell));
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
      
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      
    default:
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
}
