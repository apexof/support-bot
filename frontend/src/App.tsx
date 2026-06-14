import { useState } from "react";
import { getHealth, type HealthResponse } from "./api";

function App() {
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ping() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await getHealth();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace" }}>
      <h1>Support Bot</h1>
      <button onClick={ping} disabled={loading}>
        {loading ? "Loading..." : "Ping backend /health"}
      </button>
      {result && <pre style={{ marginTop: 16 }}>{JSON.stringify(result, null, 2)}</pre>}
      {error && <pre style={{ marginTop: 16, color: "red" }}>{error}</pre>}
    </div>
  );
}

export default App;
