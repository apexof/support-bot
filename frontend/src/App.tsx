import { getErrorMessage } from "./api";
import { useHealth } from "./hooks/useHealth";

function App() {
  const { data, error, isFetching, refetch } = useHealth();

  return (
    <div style={{ padding: 32, fontFamily: "monospace" }}>
      <h1>Support Bot</h1>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Loading..." : "Ping backend /health"}
      </button>
      {data && <pre style={{ marginTop: 16 }}>{JSON.stringify(data, null, 2)}</pre>}
      {error && <pre style={{ marginTop: 16, color: "red" }}>{getErrorMessage(error)}</pre>}
    </div>
  );
}

export default App;
