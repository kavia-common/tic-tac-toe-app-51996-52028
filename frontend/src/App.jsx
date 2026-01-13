import React, { useEffect, useMemo, useState } from "react";
import { createSession, resetSession, submitMove } from "./api.js";

function formatStatus(state) {
  if (!state) return "Loading…";
  if (state.winner) return `Winner: ${state.winner}`;
  if (state.isDraw) return "Draw!";
  return `Next player: ${state.nextPlayer}`;
}

function isValidIndex(index) {
  return Number.isInteger(index) && index >= 0 && index <= 8;
}

/**
 * PUBLIC_INTERFACE
 * Main application component.
 */
export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [busyIndex, setBusyIndex] = useState(null);
  const [error, setError] = useState(null);

  const statusText = useMemo(() => formatStatus(gameState), [gameState]);

  // Create a session on first load.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await createSession();
        if (!mounted) return;
        setSessionId(session.id);
        setGameState(session.state);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to start a session");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCellClick(index) {
    setError(null);

    // Client-side guard (backend will also validate).
    if (!isValidIndex(index) || !gameState || !sessionId) return;
    if (gameState.isTerminal) return;
    if (gameState.board[index] !== null) return;

    try {
      setBusyIndex(index);
      const updated = await submitMove(sessionId, index);
      setGameState(updated.state);
    } catch (e) {
      setError(e.message || "Move failed");
    } finally {
      setBusyIndex(null);
    }
  }

  async function handleReset() {
    setError(null);
    if (!sessionId) return;
    try {
      const updated = await resetSession(sessionId);
      setGameState(updated.state);
    } catch (e) {
      setError(e.message || "Reset failed");
    }
  }

  return (
    <div className="page">
      <main className="card" aria-label="Tic Tac Toe">
        <header className="header">
          <h1 className="title">Tic Tac Toe</h1>
          <div className="subtitle">Local 2-player • Session-backed</div>
        </header>

        <section className="status" aria-live="polite">
          <div className="statusText">{statusText}</div>
          <button className="resetButton" onClick={handleReset} type="button">
            Reset
          </button>
        </section>

        {error ? (
          <div className="error" role="alert">
            {error}
          </div>
        ) : null}

        <section className="board" role="grid" aria-label="3 by 3 game board">
          {(gameState?.board || Array(9).fill(null)).map((value, idx) => {
            const disabled =
              !gameState ||
              !sessionId ||
              gameState.isTerminal ||
              value !== null ||
              busyIndex !== null;

            return (
              <button
                key={idx}
                className="cell"
                role="gridcell"
                type="button"
                disabled={disabled}
                aria-label={`Cell ${idx + 1}${value ? `, ${value}` : ""}`}
                onClick={() => handleCellClick(idx)}
              >
                <span className={`mark ${value ? "filled" : ""}`}>{value || ""}</span>
              </button>
            );
          })}
        </section>

        <footer className="footer">
          <div className="meta">
            <div>
              <strong>Session:</strong> {sessionId ? sessionId.slice(0, 8) : "—"}
            </div>
            <div>
              <strong>Moves:</strong> {gameState?.moveCount ?? 0}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
