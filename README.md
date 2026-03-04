# Timeline Generator

A browser-based timeline generator for project planning and visualization. Built as a GitHub Pages app — no backend, no install, just open and go.

---

## Features

Timeline Generator takes project parameters and generates a clean, shareable **16:9 Gantt-style timeline** ready for presentations or slide decks. You can download the output as a PNG or JPEG.

---

## Inputs

| Field | Type | Description |
|---|---|---|
| Project Start Date | Date | Optional. If blank, timeline shows weeks (W1, W2...) instead of dates. |
| Primary Workstreams | Integer (1–n) | Number of main project tracks or workstreams. |
| Scale Factor | Integer (1–n) | Complexity multiplier that affects phase durations. |
| Secondary Workstreams | Integer (0–n) | Additional sequential tasks displayed on a shared track. |

---

## Logic

### Primary Workstreams

Each workstream consists of two sequential phases:

**Phase 1**
- Base duration for initial development or design.
- Workstreams are staggered for overlapping execution.

**Phase 2**
- Duration scales based on the **Scale Factor**.
- Starts immediately after Phase 1 completes.

### Secondary Workstreams

- Fixed duration tasks.
- Execute sequentially (one after another).
- All secondary tasks share a single row on the timeline.

---

## Output

- **Format:** PNG or JPEG download.
- **Aspect ratio:** 16:9 (slide-ready).
- **Includes:** A summary of the inputs used to generate the timeline.
- **Responsive:** Scales from mobile to desktop, optimized for desktop.

---

## Color Legend

| Color | Meaning |
|---|---|
| Blue | Main Phase 1 |
| Green | Main Phase 2 |
| Orange | Secondary Task |
