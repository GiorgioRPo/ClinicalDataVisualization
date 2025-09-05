import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import IndexPage from "./pages/home.js";
import PlotPage from "./pages/plot.js";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-logo">Clinical Study Dashboard</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/plot" className="nav-link">Plot</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/plot" element={<PlotPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
