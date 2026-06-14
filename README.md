# Support Bot

> RAG-чат-бот поддержки — пет-проект на пути к роли AI/LLM Application Engineer.

Отвечает на вопросы по загруженной базе знаний. Развивается поэтапно: MVP → RAG → эвалы → агент → прод.

---

## Стек

### Backend
| | |
|---|---|
| **Python 3.12** + **FastAPI** | веб-фреймворк + ASGI |
| **Pydantic v2** | валидация данных и конфигурации |
| **Anthropic SDK** | Claude Sonnet 4.6 (demo-режим) |
| **Ollama** | llama3.2 локально (dev-режим) |
| **SSE** | стриминг ответов без WebSocket |

### Frontend
| | |
|---|---|
| **React 19** + **TypeScript** + **Vite** | UI |
| **TanStack Query v5** | серверный стейт |
| **Zod v4** | валидация ответов API в рантайме |
| **Feature-Sliced Design** | архитектура |
| **CSS Modules** | стилизация |

---

## Архитектура

### Переключение LLM-провайдера

Вызов модели вынесен за единый интерфейс `LLMProvider`. Переключение — одна переменная в `.env`, без правок логики:

```
LLM_PROVIDER=ollama   # локальная разработка, бесплатно
LLM_PROVIDER=claude   # demo, Claude Sonnet 4.6
```

```
llm/
├── base.py      # абстрактный класс LLMProvider
├── claude.py    # ClaudeProvider
├── ollama.py    # OllamaProvider
└── factory.py   # get_provider() — выбор по переменной
```

### Frontend — Feature-Sliced Design

```
src/
├── app/          # глобальные провайдеры (QueryClient)
├── pages/        # только композиция фич, никакой логики
├── features/
│   └── chat/
│       ├── api/        # zod-схемы, функции запросов
│       ├── hooks/      # useChat
│       ├── components/ # ChatWidget, MessageList, ChatInput, MessageBubble
│       └── index.ts    # публичный API фичи
└── shared/
    ├── api/      # axios client, getErrorMessage
    ├── config/   # env-переменные
    ├── lib/      # cn (classnames)
    └── ui/       # Button
```

Слои импортируют только вниз: `pages → features → shared`. Границы защищены `eslint-plugin-boundaries` — неверный импорт = ошибка линтера.

---

## Структура проекта

```
support-bot/
├── backend/
│   ├── chat/
│   │   ├── router.py    # HTTP-эндпоинты
│   │   ├── schemas.py   # Pydantic-модели
│   │   └── service.py   # бизнес-логика
│   ├── llm/             # абстракция провайдеров
│   ├── prompts/
│   │   └── system.txt   # system prompt
│   ├── config.py        # Pydantic Settings
│   ├── main.py          # FastAPI app
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        ├── pages/
        ├── features/
        └── shared/
```

---

## Быстрый старт

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Создай `.env`:

```env
LLM_PROVIDER=ollama          # или claude
OLLAMA_MODEL=llama3.2
# ANTHROPIC_API_KEY=sk-...   # нужен только при LLM_PROVIDER=claude
ALLOWED_ORIGINS=["http://localhost:5173"]
```

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Создай `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## Roadmap

| Этап | Статус | Описание |
|---|---|---|
| **MVP** | ✅ готово | документ в system prompt, чат со стримингом |
| **v1 — RAG** | 🔜 в планах | чанкинг, эмбеддинги, Supabase pgvector, retrieval |
| **v2 — качество** | ⏳ | hybrid search, reranking, эвалы (RAGAS / Promptfoo) |
| **v3 — агент** | ⏳ | tool use, agentic RAG |
| **v4 — прод** | ⏳ | Langfuse tracing, гардрейлы, кэширование, Render deploy |

---

## Принципы

- Секреты только в `.env`, никогда не коммитятся. `ANTHROPIC_API_KEY` живёт исключительно на бекенде.
- Архитектура закладывается под весь roadmap сразу, реализуется поэтапно — стек по ходу не меняем.
- Вызов модели — только через `llm/factory.py → LLMProvider`, нигде напрямую к провайдеру.
- Индустриальный стандарт вместо минимального сопротивления: правильные библиотеки для правильных задач.
