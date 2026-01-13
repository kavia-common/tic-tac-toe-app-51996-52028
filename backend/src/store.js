const crypto = require("crypto");
const { createEmptyBoard, evaluateBoard, validateMove } = require("./gameLogic");

/**
 * @typedef {"X"|"O"} Player
 *
 * @typedef {Object} GameState
 * @property {(null|Player)[]} board
 * @property {Player} nextPlayer
 * @property {null|Player} winner
 * @property {boolean} isDraw
 * @property {boolean} isTerminal
 * @property {number} moveCount
 */

const sessions = new Map();

/**
 * Create a new game state.
 * @returns {GameState}
 */
function newGameState() {
  const board = createEmptyBoard();
  const evalResult = evaluateBoard(board);
  return {
    board,
    nextPlayer: "X",
    winner: evalResult.winner,
    isDraw: evalResult.isDraw,
    isTerminal: evalResult.isTerminal,
    moveCount: 0
  };
}

/**
 * PUBLIC_INTERFACE
 * Create a new session.
 * @returns {{ id: string, state: GameState }}
 */
function createSession() {
  const id = crypto.randomUUID();
  const session = { id, state: newGameState() };
  sessions.set(id, session);
  return session;
}

/**
 * PUBLIC_INTERFACE
 * Get an existing session.
 * @param {string} id
 * @returns {{ id: string, state: GameState } | null}
 */
function getSession(id) {
  return sessions.get(id) || null;
}

/**
 * PUBLIC_INTERFACE
 * Reset session state.
 * @param {string} id
 * @returns {{ id: string, state: GameState } | null}
 */
function resetSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  session.state = newGameState();
  return session;
}

/**
 * PUBLIC_INTERFACE
 * Apply a move to a session.
 * @param {string} id
 * @param {number} index
 * @returns {{ session?: {id: string, state: GameState}, error?: string, code?: string }}
 */
function submitMove(id, index) {
  const session = sessions.get(id);
  if (!session) return { error: "Session not found", code: "NOT_FOUND" };

  const { state } = session;

  const validation = validateMove(state.board, index, state.isTerminal);
  if (!validation.ok) return { error: validation.error, code: validation.code };

  const board = state.board.slice();
  board[index] = state.nextPlayer;

  const evalResult = evaluateBoard(board);
  const nextPlayer = state.nextPlayer === "X" ? "O" : "X";

  session.state = {
    board,
    nextPlayer: evalResult.isTerminal ? state.nextPlayer : nextPlayer,
    winner: evalResult.winner,
    isDraw: evalResult.isDraw,
    isTerminal: evalResult.isTerminal,
    moveCount: state.moveCount + 1
  };

  return { session };
}

module.exports = {
  createSession,
  getSession,
  resetSession,
  submitMove
};
