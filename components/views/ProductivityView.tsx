"use client";

import { useState, useEffect, useRef } from "react";

export default function ProductivityView() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            // Play sound when timer ends
            if (audioRef.current) {
              audioRef.current.play();
            }
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((s) => s - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const startTimer = () => {
    if (minutes > 0 || seconds > 0) {
      setIsActive(true);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const setCustomTime = (mins: number) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          Focus Mode
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "100px",
            padding: "40px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "5rem",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "30px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {!isActive ? (
            <button onClick={startTimer} style={buttonStyle("#4caf50")}>
              Start
            </button>
          ) : (
            <button onClick={pauseTimer} style={buttonStyle("#ff9800")}>
              Pause
            </button>
          )}
          <button onClick={resetTimer} style={buttonStyle("#f44336")}>
            Reset
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button onClick={() => setCustomTime(5)} style={smallButtonStyle}>
            5 min
          </button>
          <button onClick={() => setCustomTime(15)} style={smallButtonStyle}>
            15 min
          </button>
          <button onClick={() => setCustomTime(25)} style={smallButtonStyle}>
            25 min
          </button>
          <button onClick={() => setCustomTime(45)} style={smallButtonStyle}>
            45 min
          </button>
          <button onClick={() => setCustomTime(60)} style={smallButtonStyle}>
            60 min
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={toggleMusic}
            style={buttonStyle(isPlaying ? "#ff9800" : "#667eea")}
          >
            {isPlaying ? "Stop Music" : "Play Focus Music"}
          </button>
        </div>

        <div
          style={{ marginTop: "30px", textAlign: "center", maxWidth: "400px" }}
        >
          <p style={{ opacity: 0.9, fontSize: "0.9rem" }}>
            "The secret of getting ahead is getting started." - Mark Twain
          </p>
        </div>
      </div>

      <audio ref={audioRef} loop>
        <source
          src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_c8c8a7c3f3.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
}

const buttonStyle = (bg: string): React.CSSProperties => ({
  padding: "12px 24px",
  fontSize: "1rem",
  background: bg,
  border: "none",
  borderRadius: "40px",
  color: "white",
  cursor: "pointer",
  transition: "transform 0.2s, opacity 0.2s",
});

const smallButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "0.9rem",
  background: "rgba(102, 126, 234, 0.8)",
  border: "none",
  borderRadius: "20px",
  color: "white",
  cursor: "pointer",
  backdropFilter: "blur(5px)",
};
