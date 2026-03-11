# Fixing 500 errors on JS chunks (webpack.js, main.js, \_app.js, etc.)

If the browser shows **500 Internal Server Error** for `webpack.js`, `main.js`, `_app.js`, `_error.js`, or `react-refresh.js`, the Next.js **dev server** is failing when compiling or serving those files. The browser only shows "500"; the real cause is in the **terminal** where `next dev` is running.

## What to do

### 1. Stop all dev servers

Kill any Next dev processes so ports are free and no bad state remains:

```bash
# From repo root
pkill -f "next dev" || true
# Or kill by port:
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
```

### 2. Clean build cache and restart

From the **app directory** you want to run (e.g. invoice-saas):

```bash
cd apps/invoice-saas   # or analytics-dashboard or booking-platform
npm run dev:clean
```

Or manually:

```bash
cd apps/invoice-saas
rm -rf .next
npm run dev
```

### 3. Check the terminal for the real error

When you load the page, watch the **terminal** where `next dev` is running. Any compilation or runtime error (e.g. missing module, syntax error, error in layout/providers) will appear there and is what needs to be fixed.

### 4. If it still 500s

- Run a production build to see compile errors:  
  `npm run build -w @repo/ui && npm run build -w invoice-saas`
- Ensure you're not running `next dev` from the repo root; run it from inside the app folder or use:  
  `npm run dev -w invoice-saas` from root.
- Try Node 18+ and the same Node version across the monorepo.

## Config changes made to reduce 500s

- Removed unused `geist` from `transpilePackages` in all three apps’ `next.config.js`.
- Added `dev:clean` script in each app to clear `.next` and start dev (e.g. `npm run dev:clean` in the app directory).

### Layout/CSS completely gone

If the sidebar or layout disappears, Tailwind or PostCSS may have failed (e.g. preset did not load). Base styles now use raw CSS instead of `@apply` for preset classes. If it still breaks: `rm -rf .next` in the app folder, then `npm run dev`.
