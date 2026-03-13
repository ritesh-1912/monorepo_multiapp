# Razorpay integration – what you need to do

The invoice app uses **Razorpay** for payments. Set these env vars to enable the "Pay now" button.

---

## 1. Sign up and get API keys

1. Go to **[dashboard.razorpay.com](https://dashboard.razorpay.com)** and sign up (free).
2. Complete KYC if you want to accept live payments. For testing, **Test Mode** is enough (toggle in the top bar).
3. Go to **Settings → API Keys** (or **Developers → API Keys**).
4. Click **Generate Key** (or use the default Test key).
5. You’ll get:
   - **Key ID** (e.g. `rzp_test_xxxx`)
   - **Key Secret** (show once; copy it).

---

## 2. Add keys to the invoice app

In **`apps/invoice-saas/.env`** add (replace with your values):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
```

Restart the dev server. The **Pay now** button on the public invoice page will use Razorpay Checkout.

---

## 3. Webhook (so the invoice is marked “Paid” after payment)

When a payment is captured, Razorpay calls your server. You need a **webhook URL** and a **webhook secret**.

### Local development (optional)

Use a tunnel so Razorpay can reach `localhost`:

1. Install **[ngrok](https://ngrok.com)** or use **Cloudflare Tunnel**.
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`).
4. In Razorpay: **Settings → Webhooks → Add New Webhook**.
   - **URL:** `https://abc123.ngrok.io/api/webhooks/razorpay`
   - **Events:** enable **payment.captured**.
5. After saving, copy the **Secret** (or “Signing secret”).
6. In `apps/invoice-saas/.env` add:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```
7. Restart the app. Pay an invoice in test mode; the invoice should turn to “Paid” after the webhook fires.

### Production (e.g. Vercel)

1. Deploy the app and note the base URL (e.g. `https://your-app.vercel.app`).
2. In Razorpay: **Settings → Webhooks → Add New Webhook**.
   - **URL:** `https://your-app.vercel.app/api/webhooks/razorpay`
   - **Events:** enable **payment.captured**.
3. Copy the **Secret** and set in your hosting env:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

## Checklist

| Step | What           | Where                                                                         |
| ---- | -------------- | ----------------------------------------------------------------------------- |
| 1    | Key ID         | `RAZORPAY_KEY_ID` in `apps/invoice-saas/.env`                                 |
| 2    | Key Secret     | `RAZORPAY_KEY_SECRET` in `apps/invoice-saas/.env`                             |
| 3    | Webhook URL    | Razorpay Dashboard → Webhooks → `https://your-domain/api/webhooks/razorpay`   |
| 4    | Webhook secret | `RAZORPAY_WEBHOOK_SECRET` in `apps/invoice-saas/.env` (and in production env) |

Without the webhook, payments will succeed in Razorpay but the invoice in your app won’t automatically turn to “Paid”; the webhook does that.

---

## Currency

Razorpay expects amount in **paise** (smallest unit). The app already sends the invoice total in the smallest unit (e.g. paise for INR). Default currency in the app is USD; for India set invoice currency to **INR** when creating invoices (or change the app default).

---

## How to check if Razorpay is working

### 1. Checkout (Pay now button)

1. **Env:** In `apps/invoice-saas/.env` you have `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (Test mode keys from [dashboard.razorpay.com](https://dashboard.razorpay.com)).
2. **Run invoice app:** `npm run dev -w invoice-saas` (port 3000).
3. **Create an invoice:** Log in → Dashboard → “New invoice” → fill client, due date, line item, amount → Save as draft (or send).
4. **Open public invoice:** From dashboard, open the invoice and copy the **public link** (e.g. `http://localhost:3000/invoice/abc123`), or go to `/invoice/[publicId]` for that invoice.
5. **Click “Pay now”:** The Razorpay Checkout modal should open (Test mode). Use Razorpay test cards (e.g. `4111 1111 1111 1111`) to complete. If the modal opens and you can pay, **checkout is working**.

### 2. Webhook (invoice → “Paid” after payment)

- **Without webhook:** Payment succeeds in Razorpay but the invoice in your app stays “Sent” (or draft). You’d have to mark it paid manually.
- **With webhook:** After a successful payment, Razorpay calls your server; the app marks the invoice as **Paid** and you see it in the dashboard.

**To verify the webhook:**

1. **Local:** Use a tunnel (e.g. `ngrok http 3000`). In Razorpay Dashboard → Webhooks, add URL `https://your-ngrok-url/api/webhooks/razorpay`, event **payment.captured**, and set `RAZORPAY_WEBHOOK_SECRET` in `.env`.
2. Pay an invoice in test mode. After payment, refresh the invoice dashboard — the invoice status should change to **Paid**.
3. **Optional:** Check Razorpay Dashboard → Webhooks → your webhook → “Recent deliveries” to see if the request succeeded (200) or failed (4xx/5xx).

**Quick checklist:** Key ID + Secret → Pay now opens Razorpay. Webhook URL + Secret → Invoice turns Paid after payment.
