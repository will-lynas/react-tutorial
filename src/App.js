import { useState } from "react";

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={"square " + (isWinning ? " winning" : "")}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const line = calculateWinner(squares);
  let status;
  if (line) {
    status = "Winner: " + squares[line[0]];
  } else if (squares.every((square) => square)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="board-row">
          {[0, 1, 2].map((j) => {
            const index = i * 3 + j;
            return (
              <Square
                key={index}
                value={squares[index]}
                onSquareClick={() => handleClick(index)}
                isWinning={line?.includes(index)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

function MovesList({ history, currentMove, onJumpTo }) {
  const [isAscending, setIsAscending] = useState(false);

  const moves = history.map((squares, move) => {
    if (move === currentMove) {
      if (move === 0) {
        return <li key={move}>You are at game start</li>;
      } else {
        const [row, col] = findMove(squares, history[move - 1]);
        return (
          <li key={move}>
            You are at move #{move} ({row}, {col})
          </li>
        );
      }
    }

    let description;
    if (move > 0) {
      const [row, col] = findMove(squares, history[move - 1]);
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = "Go to game start";
    }

    return (
      <li key={move}>
        <button onClick={() => onJumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (isAscending) {
    moves.reverse();
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={isAscending}
          onChange={() => setIsAscending(!isAscending)}
        />
        Ascending
      </label>
      <ul>{moves}</ul>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <MovesList
          history={history}
          currentMove={currentMove}
          onJumpTo={jumpTo}
        />
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}

function findMove(currentSquares, previousSquares) {
  const position = currentSquares.findIndex(
    (square, i) => square !== previousSquares[i]
  );
  const row = Math.floor(position / 3);
  const col = position % 3;
  return [row, col];
}
