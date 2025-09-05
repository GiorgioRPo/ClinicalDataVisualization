import React, { useEffect, useMemo, useState } from "react";

export default function IndexPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get-spider")
      .then(r => {
        if (!r.ok) throw new Error("Network error");
        return r.json();
      })
      .then(setRows)
      .catch(e => setError(e.message));
  }, []);

  const summary = useMemo(() => {
    if (!rows) return null;

    const uniq = (arr) => Array.from(new Set(arr));
    const patients = uniq(rows.map(r => r.subject_id));
    const arms = uniq(rows.map(r => r.arm)).sort();
    const doses = uniq(rows.map(r => r.dose)).sort((a,b)=>Number(a)-Number(b));

    return {
      patientsCount: patients.length,
      arms,
      doses
    };
  }, [rows]);

  if (error) return <div>Error: {error}</div>;
  if (!summary) return <div>Loading…</div>;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 16 }}>Study Overview</h1>

      <div style={grid}>
        <Card title="Unique Patients" value={summary.patientsCount} />

        <Card
          title="Treatment Arms"
          value={summary.arms.length}
          detail={summary.arms.join(", ")}
        />

        <Card
          title="Dose Levels"
          value={summary.doses.length}
          detail={summary.doses.map(String).join(", ")}
        />
      </div>
    </div>
  );
}

/* --- tiny UI helpers --- */

function Card({ title, value, detail }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {detail && <div style={{ marginTop: 8, color: "#374151" }}>{detail}</div>}
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
};
