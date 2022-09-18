help:
	@printf "Usage: make [target] [VARIABLE=value]\nTargets:\n"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Install pre-commit hooks
	@pre-commit install
	@pre-commit gc

uninstall: ## Uninstall hooks
	@pre-commit uninstall

validate: ## Validate files with pre-commit hooks
	@pre-commit run --all-files

install: ## Install dependencies
	@npm install

local: ## Run locally
	@yarn danger pr $(DANGER_PR_URL)

open-mr: ## Run locally and open mr
	@yarn danger ci

docker-build: ## Docker image build
	@docker build . --tag danger -f Dockerfile --progress plain

docker-exec: ## Docker exec to a file
	@docker run -it --rm danger
