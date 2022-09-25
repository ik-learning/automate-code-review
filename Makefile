SHELL = /bin/bash -o pipefail
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c

DOCKER_LOCAL := danger
DOCKER_IMAGE := hollandandbarrett/k8s-deploy:2.36

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
	@docker build . --tag $(DOCKER_LOCAL) -f Dockerfile --progress plain

docker-exec-local: ## Docker exec to an image build locally
	@docker run -it --rm $(DOCKER_LOCAL)

run: ## Run Docker locally
	docker run --rm -it \
		-e DANGER_GITLAB_API_TOKEN \
		-e DANGER_GITLAB_TEAM \
		-e DANGER_GITLAB_HOST \
		-e DANGER_PR_URL \
		-e DANGER_TEST_PR \
		-w /workspace \
		-v ${PWD}/dangerfile.js:/workspace/dangerfile.js \
		$(DOCKER_LOCAL)

run-remote: ## Docker exec to an image
	@docker run --rm -it $(DOCKER_IMAGE)
