# Google OAuth – “Continue with Google” on login

Add “Continue with Google” to the invoice app login page. You need a **Google Cloud OAuth client** (free).

---

## 1. Create OAuth credentials in Google Cloud

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)** and sign in.
2. Create a project (or pick an existing one): **Select a project** → **New Project** → name it (e.g. “Invoice App”) → **Create**.
3. Open **APIs & Services** → **Credentials**.
4. Click **Create Credentials** → **OAuth client ID**.
5. If asked to configure the **OAuth consent screen**:
   - **User Type:** External (or Internal if it’s a workspace-only app) → **Create**.
   - **App name:** e.g. “Invoice App”.
   - **User support email:** your email.
   - **Developer contact:** your email.
   - **Save and Continue** through Scopes (default is fine) and Test users (optional). **Back to Dashboard**.
6. Again: **Credentials** → **Create Credentials** → **OAuth client ID**.
7. **Application type:** **Web application**.
8. **Name:** e.g. “Invoice app web”.
9. **Authorized JavaScript origins:**
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.com`
10. **Authorized redirect URIs:**
    - Local: `http://localhost:3000/api/auth/callback/google`
    - Production: `https://your-domain.com/api/auth/callback/google`
11. **Create**. Copy the **Client ID** and **Client Secret**.

---

## 2. Add to the invoice app

In **`apps/invoice-saas/.env`** add:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

Restart the dev server. The login page will show **Continue with Google**; new Google users are created in your DB on first sign-in.

---

---

## 3. Google Sign-In on Vercel (Production)

If you get **"Server error - There is a problem with the server configuration"** when using Google sign-in on Vercel, fix these:

### A. Environment variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add or update:

| Variable | Value | Notes |
| -------- | ----- | ----- |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Use your **exact** Vercel URL (e.g. `https://invoice-xyz.vercel.app`) |
| `AUTH_TRUST_HOST` | `true` | **Required on Vercel** – NextAuth must trust the host header |
| `NEXTAUTH_SECRET` | (32+ char random string) | Required in production |
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Same as local |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Same as local |

### B. Google Cloud Console – add Vercel URLs

In **Google Cloud Console** → **Credentials** → your OAuth client → **Edit**:

1. **Authorized JavaScript origins** – add:
   - `https://your-app.vercel.app` (your Vercel URL)
2. **Authorized redirect URIs** – add:
   - `https://your-app.vercel.app/api/auth/callback/google`

Use the exact URL Vercel gives you (e.g. `https://monorepo-multiapp-invoice-abc123.vercel.app`). No trailing slash.

### C. Redeploy

After changing env vars, trigger a **Redeploy** in Vercel so the new values are used.

---

## Checklist

| Step | What                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 1    | Google Cloud project + OAuth consent screen configured                             |
| 2    | OAuth client ID (Web application) with redirect URI `.../api/auth/callback/google` |
| 3    | `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/invoice-saas/.env`          |
| 4    | On Vercel: `NEXTAUTH_URL`, `AUTH_TRUST_HOST=true`, add Vercel URL to Google OAuth  |
