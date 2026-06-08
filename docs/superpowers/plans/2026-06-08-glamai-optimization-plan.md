# GlamAI Optimization and Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve critical security vulnerabilities, fix mobile UI blockers, and professionalize localization copy to improve conversions.

**Architecture:** Full-stack React + Express application, optimizing frontend delivery and securing backend dependencies.

**Tech Stack:** React 19, Express 5, NPM, Vite.

---

### Task 1: Security and Dependency Patching

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\functions\package.json`
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\backend\package.json`

- [ ] **Step 1: Verify failing tests/dependencies**
  Run `npm audit` in the `functions` directory to see the vulnerabilities.
  ```bash
  cd C:\Users\juma9\Pictures\ai-hairstyle-changer\functions
  npm audit
  ```

- [ ] **Step 2: Update vulnerable dependencies**
  Update `multer` and `uuid` to secure versions to resolve DoS and buffer bounds vulnerabilities.
  ```bash
  cd C:\Users\juma9\Pictures\ai-hairstyle-changer\functions
  npm install multer@2.1.1 uuid@11.1.1
  npm audit fix
  ```

- [ ] **Step 3: Commit security fixes**
  ```bash
  git add functions/package.json functions/package-lock.json
  git commit -m "fix(security): patch multer and uuid vulnerabilities in functions"
  ```

### Task 2: CSP Headers and Auth Keys (Performance & Security)

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\vercel.json`

- [ ] **Step 1: Update Content Security Policy**
  Add `worker-src blob: 'self';` to the headers configuration in `vercel.json` to unblock background Web Workers.
  ```json
  // In vercel.json headers section for "source": "/(.*)"
  // Update Content-Security-Policy to include: worker-src 'self' blob:;
  ```

- [ ] **Step 2: Remove Development Keys Flag**
  Log an operational reminder to check Vercel environment variables for Clerk production keys.
  ```bash
  echo "Verify CLERK_SECRET_KEY and VITE_CLERK_PUBLISHABLE_KEY are production keys in Vercel environment."
  ```

- [ ] **Step 3: Commit infrastructure fixes**
  ```bash
  git add vercel.json
  git commit -m "fix(infra): update CSP to allow web workers and prepare for production clerk"
  ```

### Task 3: Fix Fatal Scanner Error

**Files:**
- Locate and Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\App.jsx` (Scanner Section)

- [ ] **Step 1: Locate the Regex Syntax Error**
  Find the invalid regex `/{0}/g` causing the crash on the `/scanner` page.
  ```bash
  grep -r "\/{0}\/g" C:\Users\juma9\Pictures\ai-hairstyle-changer\src
  ```

- [ ] **Step 2: Fix Regex Syntax Error in Scanner**
  Correct the regex logic. If trying to replace a literal `{0}`, use string replacement or escape the braces `\/\{0\}\/g`.
  ```javascript
  // Change: const regex = new RegExp('{0}', 'g');
  // Or: const str = text.replace(/{0}/g, value);
  ```

- [ ] **Step 3: Commit scanner fix**
  ```bash
  git add src/App.jsx
  git commit -m "fix(scanner): correct invalid regex causing page crash"
  ```

### Task 4: UI/UX Mobile Refactoring and Performance

**Files:**
- Modify: `C:\Users\juma9\Pictures\ai-hairstyle-changer\src\App.jsx`

- [ ] **Step 1: Implement Horizontal Scroll for Style Cards**
  Update CSS classes for the style grids (hair, makeup, nails) to use a horizontal carousel on mobile (e.g., tailwind classes: `flex overflow-x-auto snap-x`) to reduce vertical scrolling.
  ```javascript
  // Replace long vertical grid classes with horizontal scroll wrappers for mobile.
  ```

- [ ] **Step 2: Replace GIFs with WebM/MP4**
  Update the Showcase section in `App.jsx` to use `<video>` tags instead of `<img>` tags for transformations.
  ```javascript
  // Change: <img src="transformation_1.gif" alt="Romantic Curls" />
  // To: <video autoPlay loop muted playsInline><source src="transformation_1.webm" type="video/webm" /></video>
  ```

- [ ] **Step 3: Commit UX fixes**
  ```bash
  git add src/App.jsx
  git commit -m "refactor(ui): optimize mobile scroll and replace heavy GIFs with video"
  ```

### Task 5: Localization and Copywriting

**Files:**
- Locate and Modify: Translations files (likely in `src/locales/` or hardcoded in components).

- [ ] **Step 1: Fix Critical Translation Errors**
  Replace incorrect literal translations across the codebase:
  - RU: "Гвозди" -> "Маникюр", "Составить" -> "Макияж".
  - ES: "Clavos" -> "Uñas", "Constituir" -> "Maquillaje".
  - FR: "Clous" -> "Ongles", "Se maquiller" -> "Maquillage".
  - DE: "Bilden" -> "Make-up".

- [ ] **Step 2: Add Missing English Keys for Makeup**
  Fix the missing translation keys (`AUDIT.MAKEUP.COMMUNITYFEED`, `audit.makeup.communityPresetsTitle`) appearing on the `/makeup` page.

- [ ] **Step 3: Update English Hero Copy to be Sales-Oriented**
  Update the main Call to Actions:
  - Main button: "Try free right now" -> "Get Your Free Look ✨"
  - Upload button: "Take Photo" -> "Open Camera 📸"
  - AI Generation button: "AI Hair Rendering" -> "Apply My New Style ✨"

- [ ] **Step 4: Commit translation fixes**
  ```bash
  git commit -am "fix(i18n): correct critical translation errors and improve English copy"
  ```
