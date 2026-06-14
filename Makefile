BACKEND_DIR  := backend
FRONTEND_DIR := frontend

.PHONY: backend frontend install install-backend install-frontend \
        lint lint-backend lint-frontend \
        check check-backend check-frontend \
        format setup-hooks

# ── Dev servers ────────────────────────────────────────────────────────────────

backend:
	cd $(BACKEND_DIR) && .venv/bin/uvicorn main:app --reload

frontend:
	cd $(FRONTEND_DIR) && npm run dev

# ── Install ────────────────────────────────────────────────────────────────────

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && python3 -m venv .venv && .venv/bin/python -m pip install -r requirements-dev.txt

install-frontend:
	cd $(FRONTEND_DIR) && npm install

# ── Lint (style + import order) ────────────────────────────────────────────────

lint: lint-backend lint-frontend

lint-backend:
	cd $(BACKEND_DIR) && .venv/bin/ruff check .

lint-frontend:
	cd $(FRONTEND_DIR) && npm run lint

# ── Type check ────────────────────────────────────────────────────────────────

check: check-backend check-frontend

check-backend:
	cd $(BACKEND_DIR) && .venv/bin/mypy .

check-frontend:
	cd $(FRONTEND_DIR) && npm run type-check

# ── Format ────────────────────────────────────────────────────────────────────

format:
	cd $(BACKEND_DIR) && .venv/bin/ruff format .
	cd $(FRONTEND_DIR) && npm run format

# ── Pre-commit ────────────────────────────────────────────────────────────────

setup-hooks:
	cd $(BACKEND_DIR) && .venv/bin/pre-commit install --config ../.pre-commit-config.yaml
