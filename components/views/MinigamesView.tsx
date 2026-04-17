"use client";

import { useState } from "react";
import React from "react";

type Game =
  | "2048"
  | "pong"
  | "wouldyourather"
  | "blockblast"
  | "fruitmerge"
  | "sticker";

export default function MinigamesView() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [wouldYouRatherAnswer, setWouldYouRatherAnswer] = useState<
    string | null
  >(null);

  const games = [
    {
      id: "2048" as const,
      name: "2048",
      icon: "🔢",
      description: "Merge numbers to reach 2048!",
    },
    {
      id: "pong" as const,
      name: "Pong",
      icon: "🏓",
      description: "Classic arcade paddle game",
    },
    {
      id: "wouldyourather" as const,
      name: "Would You Rather",
      icon: "🤔",
      description: "Fun party questions",
    },
    {
      id: "blockblast" as const,
      name: "Block Blast",
      icon: "🧱",
      description: "Match and clear blocks",
    },
    {
      id: "fruitmerge" as const,
      name: "Fruit Merge",
      icon: "🍎",
      description: "Merge fruits for high scores",
    },
    {
      id: "sticker" as const,
      name: "Sticker Creator",
      icon: "🎨",
      description: "Create custom stickers",
    },
  ];

  const renderGame = () => {
    switch (selectedGame) {
      case "2048":
        return <Game2048 onBack={() => setSelectedGame(null)} />;
      case "pong":
        return <PongGame onBack={() => setSelectedGame(null)} />;
      case "wouldyourather":
        return <WouldYouRather onBack={() => setSelectedGame(null)} />;
      case "blockblast":
        return <BlockBlast onBack={() => setSelectedGame(null)} />;
      case "fruitmerge":
        return <FruitMerge onBack={() => setSelectedGame(null)} />;
      case "sticker":
        return <StickerCreator onBack={() => setSelectedGame(null)} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return renderGame();
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <h2 style={{ marginBottom: "24px" }}>🎮 Minigames</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            style={{
              background: "#0f3460",
              borderRadius: "12px",
              padding: "24px",
              cursor: "pointer",
              transition: "transform 0.2s, background 0.2s",
              textAlign: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
              {game.icon}
            </div>
            <h3 style={{ marginBottom: "8px" }}>{game.name}</h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
              {game.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2048 Game Component
function Game2048({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>(() => {
    const newGrid = Array(4)
      .fill(null)
      .map(() => Array(4).fill(0));
    addNewTile(newGrid);
    addNewTile(newGrid);
    return newGrid;
  });
  const [score, setScore] = useState(0);

  function addNewTile(grid: number[][]) {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length) {
      const [row, col] = empty[Math.floor(Math.random() * empty.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const key = e.key;
    let newGrid = grid.map((row) => [...row]);
    let moved = false;

    switch (key) {
      case "ArrowLeft":
        for (let i = 0; i < 4; i++) {
          const row = newGrid[i].filter((v) => v !== 0);
          for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
              row[j] *= 2;
              setScore((s) => s + row[j]);
              row.splice(j + 1, 1);
            }
          }
          while (row.length < 4) row.push(0);
          if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
          newGrid[i] = row;
        }
        break;
      case "ArrowRight":
        for (let i = 0; i < 4; i++) {
          const row = newGrid[i].filter((v) => v !== 0);
          for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
              row[j] *= 2;
              setScore((s) => s + row[j]);
              row.splice(j - 1, 1);
              j--;
            }
          }
          while (row.length < 4) row.unshift(0);
          if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
          newGrid[i] = row;
        }
        break;
      case "ArrowUp":
        for (let j = 0; j < 4; j++) {
          const col = newGrid.map((row) => row[j]).filter((v) => v !== 0);
          for (let i = 0; i < col.length - 1; i++) {
            if (col[i] === col[i + 1]) {
              col[i] *= 2;
              setScore((s) => s + col[i]);
              col.splice(i + 1, 1);
            }
          }
          while (col.length < 4) col.push(0);
          for (let i = 0; i < 4; i++) {
            if (newGrid[i][j] !== col[i]) moved = true;
            newGrid[i][j] = col[i];
          }
        }
        break;
      case "ArrowDown":
        for (let j = 0; j < 4; j++) {
          const col = newGrid.map((row) => row[j]).filter((v) => v !== 0);
          for (let i = col.length - 1; i > 0; i--) {
            if (col[i] === col[i - 1]) {
              col[i] *= 2;
              setScore((s) => s + col[i]);
              col.splice(i - 1, 1);
              i--;
            }
          }
          while (col.length < 4) col.unshift(0);
          for (let i = 0; i < 4; i++) {
            if (newGrid[i][j] !== col[i]) moved = true;
            newGrid[i][j] = col[i];
          }
        }
        break;
    }

    if (moved) {
      addNewTile(newGrid);
      setGrid(newGrid);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>2048</h2>
      <div style={{ marginTop: 20, marginBottom: 10 }}>Score: {score}</div>
      <div
        style={{
          display: "grid",
          gap: 8,
          background: "#bbada0",
          padding: 8,
          borderRadius: 8,
        }}
      >
        {grid.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            {row.map((cell, j) => (
              <div
                key={j}
                style={{
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: cell ? "#eee4da" : "#cdc1b4",
                  color: cell > 4 ? "white" : "#776e65",
                  fontSize: cell > 100 ? 20 : 28,
                  fontWeight: "bold",
                  borderRadius: 6,
                }}
              >
                {cell || ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setGrid(
            Array(4)
              .fill(null)
              .map(() => Array(4).fill(0)),
          );
          setScore(0);
          addNewTile(
            Array(4)
              .fill(null)
              .map(() => Array(4).fill(0)),
          );
        }}
        style={{
          marginTop: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        New Game
      </button>
    </div>
  );
}

// Pong Game Component
function PongGame({ onBack }: { onBack: () => void }) {
  const [ballPos, setBallPos] = useState({ x: 400, y: 250 });
  const [ballVel, setBallVel] = useState({ x: 5, y: 3 });
  const [paddle1Y, setPaddle1Y] = useState(200);
  const [paddle2Y, setPaddle2Y] = useState(200);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBallPos((prev) => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;

        // Wall collision
        if (newY <= 0 || newY >= 500) setBallVel((v) => ({ ...v, y: -v.y }));

        // Paddle collision
        if (
          newX <= 20 &&
          newX >= 10 &&
          newY >= paddle1Y &&
          newY <= paddle1Y + 100
        ) {
          setBallVel((v) => ({
            x: -v.x,
            y: v.y + (newY - (paddle1Y + 50)) * 0.2,
          }));
          newX = 21;
        }
        if (
          newX >= 780 &&
          newX <= 790 &&
          newY >= paddle2Y &&
          newY <= paddle2Y + 100
        ) {
          setBallVel((v) => ({
            x: -v.x,
            y: v.y + (newY - (paddle2Y + 50)) * 0.2,
          }));
          newX = 779;
        }

        // Score
        if (newX <= 0) {
          setScore2((s) => s + 1);
          return { x: 400, y: 250 };
        }
        if (newX >= 800) {
          setScore1((s) => s + 1);
          return { x: 400, y: 250 };
        }

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [ballVel, paddle1Y, paddle2Y]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect?.();
      if (rect) {
        setPaddle1Y(Math.min(400, Math.max(0, e.clientY - rect.top - 50)));
      }
    };
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>Pong</h2>
      <div style={{ display: "flex", gap: 40, marginBottom: 10 }}>
        <span>Player: {score1}</span>
        <span>AI: {score2}</span>
      </div>
      <div
        style={{
          position: "relative",
          width: 800,
          height: 500,
          background: "#000",
          border: "2px solid #fff",
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPaddle1Y(Math.min(400, Math.max(0, e.clientY - rect.top - 50)));
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10,
            top: paddle1Y,
            width: 10,
            height: 100,
            background: "#fff",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 10,
            top: paddle2Y,
            width: 10,
            height: 100,
            background: "#fff",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: ballPos.x,
            top: ballPos.y,
            width: 10,
            height: 10,
            background: "#fff",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 0,
            width: 2,
            height: 500,
            background: "#fff",
          }}
        />
      </div>
    </div>
  );
}

// Would You Rather Component
function WouldYouRather({ onBack }: { onBack: () => void }) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const questions = [
    { option1: "Be able to fly", option2: "Be invisible" },
    { option1: "Travel to the past", option2: "Travel to the future" },
    { option1: "Be a famous musician", option2: "Be a famous athlete" },
    { option1: "Live in a treehouse", option2: "Live in a castle" },
    { option1: "Have unlimited coffee", option2: "Have unlimited pizza" },
  ];

  const [current, setCurrent] = useState(questions[0]);

  const nextQuestion = () => {
    const newQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrent(newQ);
    setAnswered(false);
    setSelected(null);
  };

  const answer = (choice: string) => {
    setSelected(choice);
    setAnswered(true);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2 style={{ marginBottom: 40 }}>Would You Rather?</h2>
      <div
        style={{
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => answer("option1")}
          disabled={answered}
          style={{
            padding: "40px 60px",
            background:
              answered && selected === "option1" ? "#4caf50" : "#0f3460",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.2rem",
            cursor: answered ? "default" : "pointer",
            transition: "transform 0.2s",
          }}
        >
          {current.option1}
        </button>
        <div style={{ fontSize: "2rem", alignSelf: "center" }}>VS</div>
        <button
          onClick={() => answer("option2")}
          disabled={answered}
          style={{
            padding: "40px 60px",
            background:
              answered && selected === "option2" ? "#4caf50" : "#0f3460",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.2rem",
            cursor: answered ? "default" : "pointer",
            transition: "transform 0.2s",
          }}
        >
          {current.option2}
        </button>
      </div>
      {answered && (
        <button
          onClick={nextQuestion}
          style={{
            marginTop: 40,
            padding: "12px 24px",
            background: "#667eea",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Next Question →
        </button>
      )}
    </div>
  );
}

// Simplified Block Blast
function BlockBlast({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState(() =>
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(0)),
  );
  const [score, setScore] = useState(0);

  const placeBlock = (row: number, col: number) => {
    if (grid[row][col] !== 0) return;
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = 1;

    // Check rows
    for (let i = 0; i < 8; i++) {
      if (newGrid[i].every((cell) => cell === 1)) {
        newGrid[i] = newGrid[i].map(() => 0);
        setScore((s) => s + 10);
      }
    }

    // Check columns
    for (let j = 0; j < 8; j++) {
      let full = true;
      for (let i = 0; i < 8; i++) {
        if (newGrid[i][j] !== 1) full = false;
      }
      if (full) {
        for (let i = 0; i < 8; i++) newGrid[i][j] = 0;
        setScore((s) => s + 10);
      }
    }

    setGrid(newGrid);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>Block Blast</h2>
      <div>Score: {score}</div>
      <div
        style={{
          display: "grid",
          gap: 2,
          background: "#0f3460",
          padding: 10,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        {grid.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 2 }}>
            {row.map((cell, j) => (
              <div
                key={j}
                onClick={() => placeBlock(i, j)}
                style={{
                  width: 40,
                  height: 40,
                  background: cell ? "#667eea" : "#1a1a2e",
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setGrid(
            Array(8)
              .fill(null)
              .map(() => Array(8).fill(0)),
          );
          setScore(0);
        }}
        style={{
          marginTop: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  );
}

// Fruit Merge
function FruitMerge({ onBack }: { onBack: () => void }) {
  const [fruits, setFruits] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const fruitsList = ["🍎", "🍊", "🍐", "🍑", "🍒", "🍉", "🥝", "🍓"];

  const addFruit = () => {
    const newFruit = fruitsList[Math.floor(Math.random() * fruitsList.length)];
    setFruits([...fruits, newFruit]);
  };

  const mergeFruits = (index: number) => {
    if (index >= fruits.length - 1) return;
    if (fruits[index] === fruits[index + 1]) {
      const currentIndex = fruitsList.indexOf(fruits[index]);
      const nextFruit =
        fruitsList[currentIndex + 1] || fruitsList[currentIndex];
      const newFruits = [...fruits];
      newFruits.splice(index, 2, nextFruit);
      setFruits(newFruits);
      setScore((s) => s + 10);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>Fruit Merge</h2>
      <div>Score: {score}</div>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          margin: 20,
          maxWidth: 500,
        }}
      >
        {fruits.map((fruit, i) => (
          <div
            key={i}
            onClick={() => mergeFruits(i)}
            style={{
              fontSize: "3rem",
              cursor: "pointer",
              transition: "transform 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {fruit}
          </div>
        ))}
      </div>
      <button
        onClick={addFruit}
        style={{
          padding: "12px 24px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Add Fruit
      </button>
      <button
        onClick={() => {
          setFruits([]);
          setScore(0);
        }}
        style={{
          marginTop: 10,
          padding: "8px 16px",
          background: "#e53e3e",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  );
}

// Sticker Creator
function StickerCreator({ onBack }: { onBack: () => void }) {
  const [stickers, setStickers] = useState<string[]>([]);
  const [stickerText, setStickerText] = useState("");
  const [stickerColor, setStickerColor] = useState("#667eea");

  const createSticker = () => {
    if (stickerText.trim()) {
      setStickers([...stickers, stickerText]);
      setStickerText("");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 16px",
          background: "#667eea",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>Sticker Creator</h2>
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          value={stickerText}
          onChange={(e) => setStickerText(e.target.value)}
          placeholder="Enter sticker text..."
          style={{
            padding: "10px",
            background: "#0f3460",
            border: "none",
            borderRadius: "6px",
            color: "white",
            marginRight: 10,
          }}
        />
        <input
          type="color"
          value={stickerColor}
          onChange={(e) => setStickerColor(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button
          onClick={createSticker}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create Sticker
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          marginTop: 30,
          maxWidth: 600,
          justifyContent: "center",
        }}
      >
        {stickers.map((sticker, i) => (
          <div
            key={i}
            style={{
              padding: "10px 15px",
              background: stickerColor,
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
            onClick={() => navigator.clipboard.writeText(sticker)}
          >
            {sticker}
          </div>
        ))}
      </div>
    </div>
  );
}
