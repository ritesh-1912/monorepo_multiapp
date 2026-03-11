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

## Checklist

| Step | What                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 1    | Google Cloud project + OAuth consent screen configured                             |
| 2    | OAuth client ID (Web application) with redirect URI `.../api/auth/callback/google` |
| 3    | `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/invoice-saas/.env`          |
