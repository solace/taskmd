---
title: "Create Electron desktop app"
id: "01kkk2x2c"
status: pending
priority: medium
type: feature
tags: ["desktop", "electron"]
effort: large
created: "2026-03-13"
---

# Create Electron desktop app

## Objective

Build a cross-platform desktop application for taskmd using Electron. The app should embed the existing web UI (`apps/web`) and wrap it in a native window. The key additional feature over the web app is a directory picker that lets users choose their "Task Directory" — the folder where `.taskmd.yaml` lives — so the app knows which project to manage.

## Tasks

- [ ] Scaffold `apps/desktop` Electron project (electron-builder or electron-forge)
- [ ] Configure Electron main process to load the existing web app (either bundled static assets or dev server in development)
- [ ] Add a "Task Directory" chooser using Electron's native `dialog.showOpenDialog` for folder selection
- [ ] Persist the selected task directory across app launches (e.g. electron-store or a simple JSON config)
- [ ] Pass the selected task directory to the embedded web app so it operates on the correct project
- [ ] Wire up the CLI backend — either bundle the `taskmd` binary or invoke it via `child_process` so the web UI can execute taskmd commands against the chosen directory
- [ ] Add a menu bar / settings UI to change the task directory after initial selection
- [ ] Configure electron-builder for macOS, Windows, and Linux packaging
- [ ] Add build scripts to the root `package.json` or `apps/desktop/package.json`
- [ ] Test the app end-to-end: launch, pick a directory, view tasks, create/update tasks
- [ ] Add documentation for the desktop app (installation, usage, and development) to `apps/docs`

## Acceptance Criteria

- The desktop app launches as a native window on macOS (and ideally Windows/Linux)
- The existing web UI renders inside the Electron window with full functionality
- Users can select a task directory via a native folder picker on first launch
- The selected directory is persisted and used on subsequent launches
- Users can change the task directory from within the app (menu or settings)
- The app can run taskmd operations (list, add, update, etc.) against the chosen directory
- Documentation covers installation, usage, and development setup for the desktop app
