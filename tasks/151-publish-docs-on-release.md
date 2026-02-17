---
id: "151"
title: "Publish docs site on release version bump"
status: pending
priority: medium
effort: medium
type: chore
tags: [release, docs, ci]
created: 2026-02-17
---

# Publish docs site on release version bump

## Objective

When a new version is released and the project version is bumped, the docs site (`apps/docs`) is not automatically published or updated. Version references in the documentation become stale until someone manually triggers a docs deployment. Ensure the docs site is automatically redeployed whenever a new release is created so that documentation always reflects the latest version.

## Tasks

- [ ] Investigate how the docs site is currently deployed (hosting platform, build triggers)
- [ ] Determine where version references appear in the docs site and how they are sourced
- [ ] Add a CI step or workflow trigger that redeploys `apps/docs` when a new release tag is pushed
- [ ] Ensure the docs build picks up the new version number automatically
- [ ] Test the end-to-end flow: version bump -> release -> docs site reflects new version

## Acceptance Criteria

- Pushing a new release tag automatically triggers a docs site deployment
- The published docs site displays the correct latest version after a release
- No manual intervention is required to update the docs after a release
