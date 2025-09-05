import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import "./plot.css"; // 👈 add this

export default function SpiderPlot() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    arm: "All",
    dose: "All",
    tumor: "All",
  });

  useEffect(() => {
  setLoading(true);

  let query = [];
  if (filters.arm !== "All") query.push(`arms=${filters.arm}`);
  if (filters.dose !== "All") query.push(`doses=${filters.dose}`);
  if (filters.tumor !== "All") query.push(`tumor_types=${filters.tumor}`);
  const url = `http://127.0.0.1:5000/get-spider${
    query.length ? "?" + query.join("&") : ""
  }`;

  fetch(url)
    .then((r) => r.json())
    .then((rows) => {
      const patients = {};
      rows.forEach((r) => {
        (patients[r.subject_id] = patients[r.subject_id] || []).push(r);
      });

      // Color map for Arm/Dose
      const colorMap = {
        "A-1800": "rgba(255,182,193,0.8)", // light pink
        "A-3000": "rgba(255,105,180,0.9)", // dark pink
        "B-1800": "rgba(135,206,250,0.8)", // light blue
        "B-3000": "rgba(0,0,205,0.9)",     // dark blue
      };

        const seenGroups = new Set();

        const ts = Object.values(patients).map((list) => {
        list.sort((a, b) => +a.days - +b.days);
        const arm = list[0].arm;
        const dose = list[0].dose;
        const key = `${arm}-${dose}`;
        const color = colorMap[key] || "gray";

        const name = `${arm} ${dose} mg`;
        
        const weeks = list.map((d) => (+d.days) / 7);
        const changes = list.map((d) => +d.change);

        const trace = {
            x: [0, ...weeks],
            y: [0, ...changes],
            type: "scatter",
            mode: "lines+markers",
            name,
            line: { width: 2, color },
            marker: { size: 6, color },
            legendgroup: key,
            showlegend: !seenGroups.has(key), // ✅ only first patient in group shows legend
        };

        seenGroups.add(key);
        return trace;
        });

      setTraces(ts);
    })
    .catch(() => setTraces([]))
    .finally(() => setLoading(false));
}, [filters]);

  const resetFilters = () =>
    setFilters({
      arm: "All",
      dose: "All",
      tumor: "All",
    });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Spider Plot</h1>
          <p className="page-subtitle">
            Tumor size % change over time by subject
          </p>
        </div>
      </header>

      <section className="toolbar">
        <div className="filter">
          <label className="filter-label" htmlFor="arm">
            Treatment Arms
          </label>
          <select
            id="arm"
            className="select"
            value={filters.arm}
            onChange={(e) => setFilters({ ...filters, arm: e.target.value })}
          >
            <option value="All">All Arms</option>
            <option value="A">Arm A</option>
            <option value="B">Arm B</option>
          </select>
        </div>

        <div className="filter">
          <label className="filter-label" htmlFor="dose">
            Doses
          </label>
          <select
            id="dose"
            className="select"
            value={filters.dose}
            onChange={(e) => setFilters({ ...filters, dose: e.target.value })}
          >
            <option value="All">All Doses</option>
            <option value="1800">1800</option>
            <option value="3000">3000</option>
          </select>
        </div>

        <div className="filter">
          <label className="filter-label" htmlFor="tumor">
            Tumor Types
          </label>
          <select
            id="tumor"
            className="select"
            value={filters.tumor}
            onChange={(e) => setFilters({ ...filters, tumor: e.target.value })}
          >
            <option value="All">All Types</option>
            <option value="sqNSCLC">sqNSCLC</option>
            <option value="HNSCC">HNSCC</option>
          </select>
        </div>

        <button className="btn" onClick={resetFilters}>
          Reset
        </button>
      </section>

      <section className="card">
        {loading ? (
          <div className="skeleton">Loading plot…</div>
        ) : traces.length === 0 ? (
          <div className="empty">No data for the selected filters.</div>
        ) : (
        <Plot
            data={traces}
            layout={{
                title: "Tumor Size Change Over Time",
                xaxis: {
                    title: { text: "Weeks on Treatment", standoff: 15 },
                    zeroline: false,
                },
                yaxis: {
                    title: { text: "% Change from Baseline", standoff: 15 },
                    range: [-100, 100],
                    zeroline: true,
                    zerolinecolor: "#999",
                },
                showlegend: true,
                margin: { t: 60, r: 20, l: 60, b: 60 },
                shapes: [
                    {
                        type: "line",
                        xref: "paper",
                        x0: 0,
                        x1: 1,
                        y0: 20,
                        y1: 20,
                        line: { dash: "dash", width: 1.5, color: "#666" },
                    },
                    {
                        type: "line",
                        xref: "paper",
                        x0: 0,
                        x1: 1,
                        y0: -30,
                        y1: -30,
                        line: { dash: "dash", width: 1.5, color: "#666" },
                    },
                ],
            }}
            style={{ width: "100%", height: "640px" }}
            config={{ displaylogo: false, responsive: true }}
        />
        )}
      </section>
    </div>
  );
}
