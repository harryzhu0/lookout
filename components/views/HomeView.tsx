"use client";

import { useState, useEffect } from "react";

interface HomeViewProps {
  userId: string;
  workspaceId: string;
}

interface Quote {
  content: string;
  author: string;
}

interface WikipediaArticle {
  title: string;
  extract: string;
  url: string;
}

interface Horoscope {
  sign: string;
  prediction: string;
}

export default function HomeView({ userId, workspaceId }: HomeViewProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [article, setArticle] = useState<WikipediaArticle | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Fetch quote of the day
    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote({ content: data.content, author: data.author }))
      .catch(console.error);

    // Fetch Wikipedia article of the day
    fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary")
      .then((res) => res.json())
      .then((data) =>
        setArticle({
          title: data.title,
          extract: data.extract.substring(0, 200) + "...",
          url: data.content_urls?.desktop?.page,
        }),
      )
      .catch(console.error);

    // Simulate horoscope
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const predictions = [
      "Today is a great day for collaboration!",
      "Focus on your studies - big breakthroughs await.",
      "Take a break and play a minigame to refresh your mind.",
      "Connect with a teammate today - new opportunities await.",
      "Your creativity is at its peak - share your ideas!",
    ];
    setHoroscope({
      sign: signs[Math.floor(Math.random() * signs.length)],
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
    });
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <h2 style={{ marginBottom: "24px" }}>Home</h2>

      {/* Unread Notifications */}
      <div
        style={{
          background: "#0f3460",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ marginBottom: "12px" }}>📢 Unread Notifications</h3>
        <p style={{ opacity: 0.8 }}>No new notifications</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Quote of the Day */}
        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>💭 Quote of the Day</h3>
          {quote ? (
            <>
              <p style={{ fontStyle: "italic", marginBottom: "8px" }}>
                "{quote.content}"
              </p>
              <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                - {quote.author}
              </p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* Horoscope */}
        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>🔮 Your Horoscope</h3>
          {horoscope ? (
            <>
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                {horoscope.sign}
              </p>
              <p style={{ fontSize: "0.9rem" }}>{horoscope.prediction}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* Wikipedia Article */}
        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>📖 Wikipedia Pick</h3>
          {article ? (
            <>
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                {article.title}
              </p>
              <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
                {article.extract}
              </p>
              <a
                href={article.url}
                target="_blank"
                style={{ color: "#667eea", fontSize: "0.85rem" }}
              >
                Read more →
              </a>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* Study Tips */}
        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>📝 Study Tip</h3>
          <p>
            Use the Pomodoro Technique: 25 minutes of focused study, then a
            5-minute break. Your productivity is waiting!
          </p>
        </div>

        {/* Popular Study Groups */}
        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>👥 Popular Study Groups</h3>
          <p>Join active study sessions in your workspace!</p>
          <button
            style={{
              marginTop: "12px",
              padding: "6px 12px",
              background: "#667eea",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Explore Groups
          </button>
        </div>
      </div>
    </div>
  );
}
