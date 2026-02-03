# Playwright E2E

This folder contains Playwright end-to-end tests for the demo UI.

## Running

1. Start the backend API server (port 5001).
2. Start the Vite client (port 5173).
3. From `demo-website/client`, run:

```bash
npm run test:e2e
```

You can override the target URL with:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e
```
