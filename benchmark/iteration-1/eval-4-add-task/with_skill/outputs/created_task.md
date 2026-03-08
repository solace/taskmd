---
title: "Add dark mode support to the web frontend"
id: "01kk60akx"
status: pending
priority: high
type: feature
tags: ["ui", "frontend"]
created: "2026-03-08"
---

# Add dark mode support to the web frontend

## Objective

Add dark mode support to the taskmd web frontend, allowing users to switch between light and dark color themes. This improves usability in low-light environments, reduces eye strain, and aligns with modern UI expectations. The implementation should respect the user's system preference by default while also providing a manual toggle.

## Tasks

- [ ] Define a dark mode color palette (background, text, borders, accents) that complements the existing light theme
- [ ] Implement a theme context/provider to manage the current theme state across the application
- [ ] Create CSS custom properties (variables) for all theme-dependent colors
- [ ] Update existing components to use theme-aware CSS variables instead of hardcoded colors
- [ ] Add a light/dark mode toggle switch to the UI header or settings area
- [ ] Detect and apply the user's system color scheme preference via `prefers-color-scheme` media query
- [ ] Persist the user's manual theme choice in localStorage
- [ ] Ensure proper contrast ratios (WCAG AA) for all text and interactive elements in dark mode
- [ ] Test all views (task list, board, graph, detail) for visual correctness in dark mode
- [ ] Add smooth transition animations when switching between themes

## Acceptance Criteria

- Users can toggle between light and dark mode using a visible UI control
- The application defaults to the user's OS-level color scheme preference on first visit
- The user's theme choice persists across page reloads and browser sessions
- All text meets WCAG AA contrast ratio requirements in both themes
- All existing views and components render correctly in dark mode without visual artifacts
- Theme switching occurs smoothly without page reload or layout shifts
