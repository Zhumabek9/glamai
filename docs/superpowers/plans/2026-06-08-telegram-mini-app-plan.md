# Telegram Mini App (TMA) Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the GlamAI web application into a Telegram Mini App (TMA), ensuring seamless Telegram authentication, UI adaptation (hiding external headers/footers), and optimized touch interactions.

**Architecture:** Integrate `@twa-dev/sdk` into the existing React/Vite application. Use Telegram's `initDataUnsafe` to identify users, bypassing the standard Clerk flow when accessed inside the Telegram WebView. Modify the UI based on the `window.Telegram.WebApp` context.

**Tech Stack:** React, `@twa-dev/sdk`, Express (for backend token validation).

---

### Task 1: Integrate Telegram SDK

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\index.html`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\package.json`
- Create: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\utils\telegram.js`

- [ ] **Step 1: Install the SDK**
  Install the Telegram Web App SDK.
  ```bash
  npm install @twa-dev/sdk
  ```

- [ ] **Step 2: Add Telegram Script to index.html**
  Ensure the script is loaded globally for safety, although the npm package wraps it.
  ```html
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  ```

- [ ] **Step 3: Create Telegram Context Utility**
  Create `src/utils/telegram.js` to manage the Telegram object.
  ```javascript
  import WebApp from '@twa-dev/sdk';

  export const isTMA = () => {
    return WebApp.initData !== '';
  };

  export const getTelegramUser = () => {
    if (!isTMA()) return null;
    return WebApp.initDataUnsafe?.user || null;
  };

  export const initTelegramApp = () => {
    if (isTMA()) {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor('secondary_bg_color');
    }
  };
  ```

- [ ] **Step 4: Commit SDK Setup**
  ```bash
  git add package.json package-lock.json index.html src/utils/telegram.js
  git commit -m "feat(tma): integrate @twa-dev/sdk and setup utility"
  ```

### Task 2: UI Adaptation for Telegram

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\App.jsx`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\components.css`

- [ ] **Step 1: Initialize SDK and Set Global State**
  In `App.jsx`, initialize the app and hide standard web elements.
  ```javascript
  import { initTelegramApp, isTMA } from './utils/telegram';

  // Inside App component:
  useEffect(() => {
    initTelegramApp();
    if (isTMA()) {
      document.body.classList.add('telegram-app');
    }
  }, []);
  ```

- [ ] **Step 2: Hide Navbar and Footer in TMA**
  In `components.css`, add rules to hide web-specific elements when inside Telegram.
  ```css
  body.telegram-app .navbar {
    display: none !important;
  }
  body.telegram-app .footer {
    display: none !important;
  }
  body.telegram-app .playground-section {
    padding-top: 0 !important;
  }
  ```

- [ ] **Step 3: Commit UI Adaptations**
  ```bash
  git add src/App.jsx src/components.css
  git commit -m "style(tma): hide web navigation and expand viewport in telegram"
  ```

### Task 3: Authentication Bridge (Bypass Clerk in TMA)

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\App.jsx`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\apiClient.js`

- [ ] **Step 1: Mock User State from Telegram**
  If inside Telegram, skip Clerk's `useUser()` and inject the Telegram user.
  ```javascript
  // App.jsx
  import { getTelegramUser, isTMA } from './utils/telegram';
  // ...
  const clerkUser = useUser();
  const telegramUser = getTelegramUser();
  
  const user = isTMA() && telegramUser ? {
    id: `tg_${telegramUser.id}`,
    firstName: telegramUser.first_name,
    isGuest: false,
    tokens: 50 // Fetch real tokens from backend later
  } : clerkUser.user;
  ```

- [ ] **Step 2: Update API Client Headers**
  Pass the `initData` to the backend for verification instead of the Clerk JWT.
  ```javascript
  // apiClient.js
  import WebApp from '@twa-dev/sdk';
  
  export const authFetch = async (url, options = {}) => {
    const headers = options.headers ? new Headers(options.headers) : new Headers();
    
    if (WebApp.initData !== '') {
      headers.set('X-Telegram-Init-Data', WebApp.initData);
    } else {
      // Use Clerk token
      const token = await window.Clerk?.session?.getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    
    return fetch(url, { ...options, headers });
  };
  ```

- [ ] **Step 3: Commit Auth Bridge**
  ```bash
  git add src/App.jsx src/apiClient.js
  git commit -m "feat(tma): bypass clerk auth and use telegram initData headers"
  ```

### Task 4: Backend Telegram Verification

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\backend\server.js`

- [ ] **Step 1: Install Crypto Utility**
  (No new package needed if using standard Node `crypto`, or install `tweetnacl`).
  
- [ ] **Step 2: Add Telegram Auth Middleware**
  Verify the `X-Telegram-Init-Data` signature using your Bot Token.
  ```javascript
  const crypto = require('crypto');
  
  const verifyTelegramData = (initData, botToken) => {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');
      
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  };

  // Express middleware
  const requireAuth = async (req, res, next) => {
    const tgData = req.headers['x-telegram-init-data'];
    if (tgData && verifyTelegramData(tgData, process.env.TELEGRAM_BOT_TOKEN)) {
       const parsedData = new URLSearchParams(tgData);
       req.user = JSON.parse(parsedData.get('user'));
       req.userId = `tg_${req.user.id}`;
       return next();
    }
    // Fallback to Clerk verification...
  };
  ```

- [ ] **Step 3: Commit Backend Update**
  ```bash
  git add backend/server.js
  git commit -m "feat(backend): add signature verification for telegram mini app"
  ```

### Task 5: Telegram Stars Payment Integration (XTR)

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\backend\server.js`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\components\Pricing.jsx`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\apiClient.js`

- [ ] **Step 1: Backend - Add Create Invoice Endpoint**
  Add an endpoint to generate a Telegram invoice link using the Telegram Bot API (`sendInvoice` or `createInvoiceLink`).
  ```javascript
  // backend/server.js
  app.post('/api/telegram/create-invoice', requireAuth, async (req, res) => {
    try {
      const { planId } = req.body;
      let amount = 50; // Set stars amount based on planId
      
      const payload = {
        title: "GlamAI Credits",
        description: `Purchase credits for ${planId}`,
        payload: `payment_${req.userId}_${planId}_${Date.now()}`,
        provider_token: "", // Empty for Telegram Stars
        currency: "XTR",
        prices: [{ label: "Credits", amount: amount }]
      };
      
      const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const tgData = await tgRes.json();
      res.json({ invoiceUrl: tgData.result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  ```

- [ ] **Step 2: Backend - Webhook for Successful Payment**
  Handle updates from Telegram (`pre_checkout_query` and `successful_payment`).
  ```javascript
  // backend/server.js
  app.post('/api/telegram/webhook', async (req, res) => {
    const update = req.body;
    
    // 1. Answer pre_checkout_query (Required within 10s)
    if (update.pre_checkout_query) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true
        })
      });
      return res.sendStatus(200);
    }
    
    // 2. Handle successful_payment
    if (update.message && update.message.successful_payment) {
      const payload = update.message.successful_payment.invoice_payload;
      const [_, userId, planId] = payload.split('_');
      
      // Grant tokens to user in database
      // await db.query('UPDATE users SET tokens = tokens + 100 WHERE id = $1', [userId]);
      
      return res.sendStatus(200);
    }
    
    res.sendStatus(200);
  });
  ```

- [ ] **Step 3: Frontend - Trigger Telegram Payment**
  Update `Pricing.jsx` to intercept the checkout process if inside Telegram and open the invoice natively.
  ```javascript
  // src/components/Pricing.jsx
  import WebApp from '@twa-dev/sdk';
  import { isTMA } from '../utils/telegram';
  import { authFetch } from '../apiClient';
  
  const handleSubscribe = async (planId) => {
    if (isTMA()) {
      // 1. Get invoice link from backend
      const res = await authFetch('/api/telegram/create-invoice', {
        method: 'POST',
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      
      // 2. Open invoice natively in Telegram
      if (data.invoiceUrl) {
        WebApp.openInvoice(data.invoiceUrl, (status) => {
          if (status === 'paid') {
            // Show success toast, refresh token balance
          }
        });
      }
      return;
    }
    
    // Fallback to existing Stripe checkout
    // ...
  };
  ```

- [ ] **Step 4: Commit Telegram Stars Payment**
  ```bash
  git add backend/server.js src/components/Pricing.jsx src/apiClient.js
  git commit -m "feat(tma): integrate telegram stars (XTR) payment flow and webhooks"
  ```