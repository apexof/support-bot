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

## Стандарт качества

Этот проект — не минимальный MVP и не учебная поделка. Цель: показать уровень больших компаний.

- **Никогда не идти по пути минимального сопротивления.** Если есть индустриальный стандарт — используем его.
- **Использовать правильные библиотеки** для правильных задач, даже если "можно написать самому".
- **Архитектурные решения** должны быть такими, которые не стыдно показать на code review в топовой компании.
- **Каждый инструмент в стеке** должен быть осознанным выбором, а не случайным.

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

- **Vite + React + TypeScript + CSS Modules**
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

#### Где хранить типы

Типы делятся на два вида — доменные и API-контракт:

- **Доменные типы** (что такое сущность: `Message`, `User`) — в `features/<name>/types.ts`. Используются во всех частях фичи: хуках, компонентах, API. Экспортируются наружу через `index.ts` если нужны другим слоям.
- **API-типы** (что передаём на сервер: `ChatRequest`) — в `api/<name>Api.ts` рядом с функцией запроса. Если используются только внутри файла — без `export`.
- **Локальные типы компонентов** (`Props`, `State`) — объявляются прямо в файле компонента, никогда не экспортируются.
- Zod-схемы (`healthSchema`) остаются в `api/*.ts` — они нужны для валидации ответа бека на системной границе. Тип выводится через `z.infer` и экспортируется, схема — нет.

Циклические зависимости контролируются правилом `import-x/no-cycle` в eslint — любой цикл будет ошибкой линтера.

#### `key` в списках

`key={index}` корректен когда список только пополняется (append-only) и не поддерживает мутации (удаление, вставка, перестановка). Стабильный `id` нужен только когда элементы могут менять порядок или удаляться.

#### Правила экспортов

- `export` ставим только если символ используется снаружи файла. Если функция, константа или тип нужны только внутри — без `export`.
- Исключение: компоненты React в отдельных файлах всегда экспортируются — иначе их нельзя импортировать и `react-refresh` не работает.
- Zod-схемы не экспортируются если используются только для вывода типа внутри файла — в этом случае схему заменяем на `interface`.

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
- Если единственный проп — `children`, использовать `PropsWithChildren` вместо ручного объявления интерфейса.
- Для комбинирования классов — утилита `cn` из `@/shared/lib`, не шаблонные строки.

```typescript
// ✅ Правильно
import { type FC } from "react";
import { cn } from "@/shared/lib";
import s from "./Button.module.css";

interface Props {
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
      className={cn(s.button, s[variant], disabled && s.isDisabled)}
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

#### Стилизация — CSS Modules

Глобальный CSS (`index.css`) — только для CSS-переменных (`:root`), reset (`*`, `body`, `html`) и dark mode media query. Никаких глобальных классов.

Каждый компонент стилизуется через свой `ComponentName.module.css`:

```
ComponentName/
├── ComponentName.tsx
└── ComponentName.module.css
```

**Правила:**
- Импорт стилей — всегда с алиасом `s`: `import s from "./ComponentName.module.css"`.
- Имена классов — только camelCase: `.buttonPrimary`, `.isDisabled`. Никогда kebab-case.
- Для комбинирования — `cn` из `@/shared/lib`. Никогда шаблонные строки.
- Никаких inline стилей в компонентах.
- Никаких комментариев в CSS — имена классов должны быть самодокументирующимися.
- CSS-переменные из `index.css` доступны во всех модулях через `var(--accent)` и т.д.

```css
/* ✅ Button.module.css */
.button {
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}

.secondary {
  background: var(--border);
  color: var(--text-h);
}

.isDisabled {
  opacity: 0.5;
  cursor: not-allowed;
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
│   ├── config.py         # Pydantic Settings, единая точка конфигурации
│   ├── main.py           # создание app, подключение роутеров
│   ├── llm/              # абстракция LLM-провайдеров
│   │   ├── base.py       # абстрактный класс LLMProvider
│   │   ├── claude.py     # ClaudeProvider
│   │   ├── ollama.py     # OllamaProvider
│   │   └── factory.py    # get_provider() — выбор по имени
│   ├── chat/             # фича чата
│   │   ├── router.py     # HTTP-эндпоинты
│   │   ├── schemas.py    # Pydantic модели запроса/ответа
│   │   └── service.py    # бизнес-логика
│   ├── prompts/
│   │   └── system.txt    # system prompt
│   └── requirements.txt
└── frontend/             # Vite + React + TypeScript
    ├── .env.local        # VITE_API_URL (git ignore)
    └── src/
        ├── app/          # глобальные провайдеры, index.css
        ├── pages/        # страницы (home, ...)
        ├── features/     # фичи (health-check, chat, ...)
        ├── shared/       # общий код (api client, lib/cn, ...)
        └── main.tsx      # точка входа
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
- Вызов модели — всегда через `llm/factory.py` → `LLMProvider`, нигде больше напрямую к провайдеру не обращаемся.
