---
id: "181"
title: "Add responsive mobile design to web UI"
status: completed
priority: medium
effort: large
type: improvement
tags:
  - web
  - ux
  - mobile
created: 2026-02-20
---

# Add Responsive Mobile Design to Web UI

## Objective

Make the web interface usable on tablets and phones. The current layout is desktop-only, which prevents users from checking task status or making quick updates on mobile devices.

## Tasks

- [ ] Audit all pages for mobile breakpoint issues
- [ ] Add responsive breakpoints (mobile: <640px, tablet: <1024px)
- [ ] Make the tasks table horizontally scrollable or switch to a card layout on mobile
- [ ] Make the board view single-column scrollable on mobile
- [ ] Make the graph view pinch-to-zoom and pannable on touch devices
- [ ] Collapse the sidebar navigation into a hamburger menu on small screens
- [ ] Ensure the task detail page is readable on narrow viewports
- [ ] Make filter/search controls stack vertically on mobile
- [ ] Test on iOS Safari and Android Chrome
- [ ] Ensure touch targets are at least 44x44px

## Acceptance Criteria

- All pages are usable at 375px viewport width (iPhone SE)
- Navigation is accessible via hamburger menu on mobile
- Table and board views adapt layout for small screens
- No horizontal overflow or hidden content on mobile
- Touch interactions work smoothly (no accidental taps, proper tap targets)
