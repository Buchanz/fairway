> Historical exploratory scope. For the current proposal and implementation, see [PROPOSAL.md](PROPOSAL.md), [ARCHITECTURE.md](ARCHITECTURE.md) and the [README](../README.md). Statements below describe the early prototype, not current feature status.

# Initial capstone scope

Goal: help golfers compare tee times across supported local courses on mobile and web.

First milestone: a working search-to-details flow using explicitly fictional sample inventory. Do not imply live coverage or booking access.

Next decision gate: choose a region and 3–5 courses; identify their booking providers; verify authorized, reliable access, freshness, costs, and links. Do not commit to scraping or integrated checkout before verifying access.

If live inventory access is unavailable, narrow to a supported provider or pivot to course discovery and group round planning. Preserve the shared UI and data model.

Four-week outline after proposal approval:
1. Validate the data source, submit/finalize proposal, establish architecture, deploy an early vertical slice.
2. Implement real search, details, backend validation, and saved courses.
3. Finish booking handoff, reliability, meaningful unit/integration tests, and device testing.
4. Polish responsiveness/accessibility, deploy, complete README/devlog, rehearse demo.

The assignment asks for proposal approval before development; this initial prototype is exploratory and does not establish instructor approval.

Unresolved: launch region, supported courses, phone targets, API access, currency, hosting, mobile distribution. No paid services or external accounts have been created.

Launch scope confirmed: Greater Victoria → Vancouver Island → BC mainland. Initial directory: Highland Pacific and Cedar Hill. Live integration is pending provider access verification.
