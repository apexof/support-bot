# Support Bot — RAG чат-бот поддержки

## О проекте

Пет-проект для освоения навыков **AI/LLM application engineer**. Чат-бот поддержки,
который отвечает на вопросы на основе загруженной базы знаний (документа).
Развивается поэтапно: от простого MVP до системы с RAG, эвалами, агентностью и observability.

## Правила общения и кода

- **Всё общение в чате — на русском.** Вывод информации о размышлениях в консоль — тоже на русском.
- **Этот файл (CLAUDE.md) — на русском.**
- **Все комментарии в коде — на английском.**
- Имена переменных, функций, файлов — на английском.
- Объяснять шаги подробно: цель проекта — обучение, а не только результат.
  Каждую новую команду/концепцию кратко пояснять.
- **Не запускать сборку (build) для проверки кода. Не запускать dev-сервер самостоятельно.**
- **Никогда не делать коммиты в git.**
- **Для документации библиотек и примеров кода использовать context7 MCP.**

## Цель автора

Senior Frontend Engineer (React/TS, 8+ лет), осваивает Python и LLM-стек.
Метит в роль **AI/LLM application engineer**. Python — основной учебный трек проекта,
поэтому бекенд намеренно на Python, а не на TS.

## Стек

### Backend (основная логика)

- **Python 3.12** + **FastAPI** — веб-фреймворк
- **uvicorn** — ASGI-сервер
- **pydantic** — валидация данных, API-контракт
- **python-dotenv** — конфигурация через `.env`
- Менеджер пакетов: **pip + venv** (окружение в `backend/.venv`)

### LLM-провайдеры (через абстракцию-переключатель)

- **Ollama** (`llama3.2`, локально) — режим разработки, бесплатно
- **Claude** (`claude-sonnet-4-6`, API) — режим демо
- Переключение через переменную `LLM_PROVIDER` в `.env` (`ollama` | `claude`)
- Вызов модели вынесен в отдельный модуль `llm.py` за единым интерфейсом,
  чтобы менять провайдера без правок остального кода

### Frontend (тонкий клиент)

- **Vite + React + TypeScript + Tailwind**
- Деплой: **Vercel** (статика)
- **axios** — HTTP-клиент (единственное место вызова — `api/client.ts`)
- **zod** — валидация ответов бека в рантайме, типы выводятся через `z.infer`
- **TanStack Query** — стейт-менеджмент для серверных данных

#### Архитектура фронтенда — Feature-Sliced Design (FSD)

```
src/
├── app/            # глобальные провайдеры (QueryClient, Router и т.д.)
├── pages/          # страницы — только композиция фич, никакой логики
├── features/       # фичи — замкнутые модули (chat, health-check, ...)
│   └── chat/
│       ├── api/        # zod-схемы, типы, функции запросов
│       ├── hooks/      # useQuery/useMutation хуки
│       ├── components/ # UI компоненты фичи
│       └── index.ts    # публичный экспорт — снаружи видно только его
└── shared/         # переиспользуемое без привязки к фиче
    └── api/            # axios client, getErrorMessage
```

**Правила:**
- Импорты только вниз по слоям: `pages` → `features` → `shared`. Никогда в обратную сторону.
- Между фичами импорты запрещены — только через `shared`.
- Снаружи фичи импортируем только из её `index.ts`.
- `useQuery` и `useMutation` — никогда напрямую в компоненте, всегда выносим в хук внутри фичи.
- Типы возврата хуков не аннотируем явно — TS выводит их через inference.
- Алиас `@/` указывает на `src/` — используем вместо относительных путей вида `../../`.
- `index.ts` — только реэкспорт. Файлы с логикой называем по смыслу: `healthApi.ts`, `chatApi.ts`.
- Границы слоёв защищены `eslint-plugin-boundaries` + `eslint-import-resolver-typescript`.
  Неверный импорт (например из `shared` в `features`) — ошибка линтера. Проверка: `npm run lint`.

#### Правила импортов

```typescript
// ✅ Правильно — через публичный API (index.ts)
import { Button } from "@/shared/ui";
import { ChatWidget } from "@/features/chat";

// ❌ Неправильно — прямые импорты обходят публичный API
import { Button } from "@/shared/ui/Button/Button";
import ChatWidget from "@/features/chat/components/ChatWidget";
```

Каждый слайс экспортирует публичный API через `index.ts`. Экспортировать нужно прямо из компонентов и модулей, без промежуточных `index.ts` на каждом уровне вложенности.

#### Правила компонентов

- Функциональные компоненты с TypeScript.
- Тип `FC` из React для всех компонентов.
- Интерфейс пропсов называется `Props` (если не экспортируется).
- Деструктуризация пропсов — на отдельной строке, не в параметрах функции.
- Только именованные экспорты, никогда `export default`.
- Для комбинирования классов — утилита `cn` из `@/shared/lib`, не шаблонные строки.

```typescript
// ✅ Правильно
import { FC, ReactNode } from "react";
import { cn } from "@/shared/lib";

interface Props {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary";
}

export const Button: FC<Props> = (props) => {
  const { children, onClick, disabled, variant } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(s.button, s[variant], disabled && s.disabled)}
    >
      {children}
    </button>
  );
};

// ❌ Неправильно — нет FC, деструктуризация в параметрах, export default
export default function Button({ children, onClick }: Props) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Связь

- REST + **SSE** для стриминга ответов
- **CORS** настроен на бекенде (фронт и бек на разных доменах)
- `ANTHROPIC_API_KEY` живёт ТОЛЬКО на бекенде, в браузер не попадает

### Инфраструктура (появится на следующих этапах)

- Векторная БД: **Supabase (pgvector)** — free tier
- Эмбеддинги: **sentence-transformers** (локально) или **Voyage API**
- Observability: **Langfuse** (self-host / free tier)
- Эвалы: **Promptfoo / RAGAS**
- Деплой бекенда: **Render** (free tier)

## Структура проекта

```
support-bot/
├── backend/              # FastAPI, Python
│   ├── .venv/            # виртуальное окружение (git ignore)
│   ├── .env              # секреты и настройки (git ignore)
│   ├── config.py         # чтение .env, единая точка конфигурации
│   ├── llm.py            # абстракция провайдера (Ollama/Claude)
│   ├── main.py           # FastAPI-приложение, эндпоинты
│   └── requirements.txt
└── frontend/             # Vite + React + TypeScript
    ├── .env.local         # VITE_API_URL (git ignore)
    └── src/
        ├── app/           # глобальные провайдеры
        ├── pages/         # страницы (home, ...)
        ├── features/      # фичи (health-check, chat, ...)
        ├── shared/        # общий код (api client, утилиты)
        └── main.tsx       # точка входа
```

## План развития (roadmap)

- **MVP** — документ целиком в system prompt + чат со стримингом, без RAG
- **v1 (RAG)** — чанкинг, эмбеддинги, векторная БД, retrieval перед вызовом модели
- **v2 (качество)** — hybrid search, reranking, эвалы (метрики retrieval/генерации) ← ключевой этап
- **v3 (агент)** — tool use, бот ходит в инструменты, agentic RAG
- **v4 (прод)** — стриминг, трейсинг (Langfuse), гардрейлы, кэширование

## Принципы

- Безопасность: секреты только в `.env`, никогда не коммитятся, ключ только на бекенде.
- Архитектура закладывается под весь roadmap сразу, но реализуется поэтапно —
  стек по ходу не меняем.
- Вызов модели — всегда через `llm.py`, нигде больше напрямую к провайдеру не обращаемся.
