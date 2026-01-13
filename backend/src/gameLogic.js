/**
 * Tic Tac Toe core game logic.
 *
 * Board is a flat array of length 9 containing "X", "O", or null.
 */

/**
 * PUBLIC_INTERFACE
 * Create an empty 3x3 board.
 * @returns {(null|"X"|"O")[]}
 */
function createEmptyBoard() {
  return Array(9).fill(null);
}

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

/**
 * PUBLIC_INTERFACE
 * Determine the winner.
 * @param {(null|"X"|"O")[]} board
 * @returns {null|"X"|"O"}
 */
function calculateWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Check if board is full (draw candidate).
 * @param {(null|"X"|"O")[]} board
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

/**
 * PUBLIC_INTERFACE
 * Compute derived game status.
 * @param {(null|"X"|"O")[]} board
 * @returns {{ winner: null|"X"|"O", isDraw: boolean, isTerminal: boolean }}
 */
function evaluateBoard(board) {
  const winner = calculateWinner(board);
  const isDraw = !winner && isBoardFull(board);
  return { winner, isDraw, isTerminal: Boolean(winner) || isDraw };
}

/**
 * PUBLIC_INTERFACE
 * Validate a move.
 * @param {(null|"X"|"O")[]} board
 * @param {number} index
 * @param {boolean} isTerminal
 * @returns {{ ok: true } | { ok: false, code: string, error: string }}
 */
function validateMove(board, index, isTerminal) {
  if (isTerminal) {
    return { ok: false, code: "GAME_OVER", error: "Game is already over" };
  }
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return { ok: false, code: "BAD_INDEX", error: "Index must be an integer between 0 and 8" };
  }
  if (board[index] !== null) {
    return { ok: false, code: "CELL_TAKEN", error: "Cell is already taken" };
  }
  return { ok: true };
}

module.exports = {
  createEmptyBoard,
  evaluateBoard,
  validateMove
};
