"use client";

export default function HeaderBar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="header-bar">
      <div className="header-left">
        <div className="header-logo">RV</div>
        <div className="header-text">
          <h1 className="header-title">RevitaVibe Montgomery</h1>
          <p className="header-subtitle">AI Civic Land Intelligence Platform</p>
        </div>
      </div>
      <div className="header-center">
        <p className="header-tagline">
          Turning vacant land into opportunity for parks, housing, and stronger neighborhoods
        </p>
      </div>
      <div className="header-right">
        <div className="header-badge">
          <span className="badge-dot" />
          <span>Powered by Bright Data</span>
        </div>
        <div className="header-date">{today}</div>
      </div>
    </header>
  );
}
