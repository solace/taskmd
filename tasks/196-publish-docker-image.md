---
id: "196"
title: "Publish Docker image to GitHub Container Registry"
status: completed
priority: medium
effort: medium
type: chore
tags: [docker, distribution]
created: 2026-02-22
---

# Publish Docker image to GitHub Container Registry

## Objective

Publish the taskmd Docker image to GitHub Container Registry (ghcr.io) so that users can pull it from a public registry instead of building locally.

## Tasks

- [x] Review and update the existing `Dockerfile` as needed
- [x] Set up GitHub Actions workflow to build and push the Docker image to `ghcr.io`
- [x] Configure image tagging strategy (latest, semver, git SHA)
- [x] Ensure the package visibility is set to public on GitHub
- [x] Add labels and metadata to the Docker image (version, description, source URL)
- [x] Test pulling and running the image from the public registry
- [x] Document Docker usage in the README or docs

## Acceptance Criteria

- Docker image is publicly available at `ghcr.io/<org>/taskmd`
- Users can pull with `docker pull ghcr.io/<org>/taskmd:latest`
- A CI workflow builds and pushes new images on release or version tag
- Image includes proper labels and metadata
