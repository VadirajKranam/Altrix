SHELL := /bin/bash
DATABASE_URL ?= postgresql://altrix:altrix@localhost:54329/altrix_test

.PHONY: deps build typecheck test test-unit test-integration test-all docker-check pg-up pg-down pg-logs pg-reset clean

deps:
	npm install

build:
	npm run build

typecheck:
	npm run typecheck

test: test-unit

test-unit:
	npm run test:unit

test-integration:
	DATABASE_URL=$(DATABASE_URL) npm run test:integration

test-all: typecheck test-unit pg-up
	DATABASE_URL=$(DATABASE_URL) npm run test

docker-check:
	@docker info > /dev/null 2>&1 || (echo "Docker daemon is not running. Start Docker Desktop (or docker service) and retry." && exit 1)

pg-up: docker-check
	docker compose -f docker-compose.test.yml up -d
	@echo "Waiting for PostgreSQL to become healthy..."
	@until [ "$$(docker inspect --format='{{json .State.Health.Status}}' altrix-postgres-test | tr -d '"')" = "healthy" ]; do sleep 1; done

pg-down:
	docker compose -f docker-compose.test.yml down

pg-logs:
	docker compose -f docker-compose.test.yml logs -f postgres

pg-reset:
	docker compose -f docker-compose.test.yml down -v
	docker compose -f docker-compose.test.yml up -d

clean:
	rm -rf dist .altrix
