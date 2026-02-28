.PHONY: install-dev install-dev-full check test lint sync-spec docker-build docker-run

# Install development binary (delegates to apps/cli)
install-dev:
	$(MAKE) -C apps/cli install-dev

# Install development binary with embedded web assets
install-dev-full:
	$(MAKE) -C apps/cli install-dev-full

# Run all checks (CLI tests, lint, vet + web tests)
check:
	$(MAKE) -C apps/cli check
	cd apps/web && npx vitest run

# Run tests only
test:
	$(MAKE) -C apps/cli test

# Run linter only
lint:
	$(MAKE) -C apps/cli lint

# Sync spec copies from docs/taskmd_specification.md
sync-spec:
	$(MAKE) -C apps/cli sync-spec

# Build Docker image
docker-build:
	docker build -t taskmd:local .

# Run Docker container (mount ./tasks as read-only)
docker-run: docker-build
	docker run --rm -p 8080:8080 -v ./tasks:/tasks:ro taskmd:local
