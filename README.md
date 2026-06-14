# Support Bot

> A RAG support chatbot — a pet project on the path to becoming an AI/LLM Application Engineer.

Answers questions based on a loaded knowledge base. Built incrementally: MVP → RAG → evals → agent → production.

---

## Stack

### Backend

| | |
|---|---|
| **Python 3.12** + **FastAPI** | web framework + ASGI |
| **Pydantic v2** | data validation and configuration |
| **Anthropic SDK** | Claude Haiku 4.5 (demo mode) |
| **Ollama** | llama3.2 locally (dev mode) |
| **SlowAPI** | rate limiting |
| **SSE** | response streaming without WebSocket |

### Frontend

| | |
|---|---|
| **React 19** + **TypeScript** + **Vite** | UI |
| **TanStack Query v5** | server state management |
| **Zod v4** | runtime API response validation |
| **eventsource-parser** | SSE stream parsing |
| **Feature-Sliced Design** | architecture |
| **CSS Modules** | styling |

---

## Architecture

### LLM provider switching

Model calls are behind a single `LLMProvider` interface. Switching is one variable in `.env`, no logic changes needed:

```
LLM_PROVIDER=ollama   # local development, free
LLM_PROVIDER=claude   # demo, Claude Sonnet 4.6
```

```
llm/
├── base.py      # abstract LLMProvider class
├── claude.py    # ClaudeProvider
├── ollama.py    # OllamaProvider
└── factory.py   # get_provider() — selects by env var
```

### Frontend — Feature-Sliced Design

```
src/
├── app/               # global providers (QueryClient)
├── pages/             # composition only, no logic
├── features/
│   ├── chat/
│   │   ├── api/       # zod schemas, request functions
│   │   ├── hooks/     # useChat
│   │   ├── components/# ChatWidget, MessageList, ChatInput, MessageBubble
│   │   ├── types.ts   # domain types (Message, etc.)
│   │   └── index.ts   # public feature API
│   └── health-check/
│       ├── api/       # healthApi, health schema
│       ├── hooks/     # useHealth
│       └── index.ts
└── shared/
    ├── api/       # fetch client, getErrorMessage
    ├── config/    # env variables
    ├── lib/       # cn (classnames)
    └── ui/        # Button
```

Layers import only downward: `pages → features → shared`. Boundaries are enforced by `eslint-plugin-boundaries` — a wrong import is a lint error.

---

## Project structure

```
support-bot/
├── Makefile
├── .pre-commit-config.yaml
├── backend/
│   ├── chat/
│   │   ├── router.py    # HTTP endpoints
│   │   ├── schemas.py   # Pydantic models
│   │   └── service.py   # business logic
│   ├── llm/             # provider abstraction
│   ├── prompts/
│   │   └── system.txt   # system prompt
│   ├── config.py        # Pydantic Settings
│   ├── limiter.py       # SlowAPI rate limiter setup
│   ├── main.py          # FastAPI app, CORS, /health
│   ├── requirements.txt
│   └── requirements-dev.txt
└── frontend/
    └── src/
        ├── app/
        ├── pages/
        ├── features/
        └── shared/
```

---

## Quick start

### 1. Install dependencies

```bash
make install
```

Creates `backend/.venv`, installs Python packages from `requirements-dev.txt`, and runs `npm install` in `frontend/`.

### 2. Configure

`backend/.env`:

```env
LLM_PROVIDER=ollama          # or claude
OLLAMA_MODEL=llama3.2
# ANTHROPIC_API_KEY=sk-...   # required only when LLM_PROVIDER=claude
ALLOWED_ORIGINS=["http://localhost:5173"]
```

`frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Run

```bash
make backend    # FastAPI on :8000
make frontend   # Vite dev server on :5173
```

### Pre-commit hooks (optional)

```bash
make setup-hooks
```

Runs before every commit: `ruff` (lint + format check), `mypy`, `eslint`, and `tsc`.

---

## Dev commands

| Command | What it does |
|---|---|
| `make backend` | Start FastAPI dev server |
| `make frontend` | Start Vite dev server |
| `make install` | Install all dependencies |
| `make lint` | ESLint + Ruff across the project |
| `make check` | mypy + tsc type checking |
| `make format` | Ruff format + Prettier |
| `make setup-hooks` | Install pre-commit hooks |

---

## Roadmap

| Stage | Status | Description |
|---|---|---|
| **MVP** | ✅ done | document in system prompt, streaming chat |
| **v1 — RAG** | 🔜 next | chunking, embeddings, Supabase pgvector, retrieval |
| **v2 — quality** | ⏳ | hybrid search, reranking, evals (RAGAS / Promptfoo) |
| **v3 — agent** | ⏳ | tool use, agentic RAG |
| **v4 — production** | ⏳ | Langfuse tracing, guardrails, caching, Render deploy |

---

## Principles

- Secrets live only in `.env` and are never committed. `ANTHROPIC_API_KEY` stays on the backend only.
- Architecture is designed for the full roadmap upfront, implemented incrementally — the stack does not change mid-way.
- Model calls go only through `llm/factory.py → LLMProvider`, never directly to a provider.
- Industry standard over the path of least resistance: the right library for the right job.
