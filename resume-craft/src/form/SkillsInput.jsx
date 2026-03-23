function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        {skills.map((s, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: "#f5f2ee", border: "1px solid #d9d3cc",
            borderRadius: "20px", padding: "4px 10px", fontSize: "0.78rem"
          }}>
            {s}
            <button onClick={() => onChange(skills.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "0.85rem", lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          style={{ flex: 1, border: "1px solid #d9d3cc", borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", outline: "none", background: "#f8f5f0" }}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onChange([...skills, input.trim()]); setInput(""); } }}
          placeholder="Add skill, press Enter"
        />
        <button className="btn btn-secondary" style={{ padding: "8px 14px" }}
          onClick={() => { if (input.trim()) { onChange([...skills, input.trim()]); setInput(""); } }}>Add</button>
      </div>
    </div>
  );
}