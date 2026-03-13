# Pushing to GitHub – security checklist

Before pushing this repo to GitHub, ensure **no secrets or API keys** are committed.

## What is already protected

- **`.env`** – Ignored (contains database URLs, NextAuth secret, Razorpay keys, Google OAuth)
- **`.env.local`**, **`.env.*.local`** – Ignored
- **`rzp-key.csv`** – Ignored (contains Razorpay credentials)
- **`*-key.csv`**, **`*.pem`**, **`*-credentials*.json`** – Ignored
- **`node_modules`**, **`.next`**, **`dist`** – Ignored

## Pre-push checklist

1. **Verify .gitignore** – Run:
   ```bash
   git status
   ```
   You should **NOT** see:
   - `apps/*/\.env`
   - `rzp-key.csv`
   - Any file with API keys or passwords

2. **Double-check** – Run:
   ```bash
   git check-ignore -v apps/invoice-saas/.env apps/analytics-dashboard/.env apps/booking-platform/.env rzp-key.csv
   ```
   Each should show "Ignored by" a rule.

3. **Set up new repo** – Create a new repository on GitHub (do **not** initialize with README if you have local content).

4. **Push**:
   ```bash
   git init
   git add .
   git status   # Review: no .env, no rzp-key.csv
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## If you accidentally commit secrets

1. **Rotate all keys immediately** – Razorpay Dashboard → regenerate keys; Google Cloud Console → create new OAuth client; etc.
2. **Remove from history** – Use `git filter-branch` or BFG Repo-Cleaner to remove the file from history (the keys are still compromised and must be rotated).
3. **Never rely on "we'll fix it later"** – Assume anything committed is public.

## After pushing

- Add secrets as **GitHub Secrets** or env vars in your deployment platform (Vercel, Railway, etc.).
- Use `.env.example` files as templates – they contain placeholders only, no real values.
