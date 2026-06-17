# ClearSpend — Going from Website to App (PWA + App Store roadmap)

This folder is your existing ClearSpend website, upgraded into a
**Progressive Web App (PWA)**. Same look, same orange-and-black design,
same code — with a few small additions that let people install it on
their phone like a real app.

---

## 1. What changed from the website version

Three new files were added, and `index.html` got a few new lines in the
`<head>`:

```
clearspend-pwa/
  index.html           <- same as before, plus PWA tags + service worker registration
  manifest.json         <- NEW: tells the phone "this is an installable app"
  service-worker.js     <- NEW: makes the app work offline + load instantly
  icons/                <- NEW: app icons for the home screen
    icon-192.png
    icon-512.png
    icon-apple-touch.png
    favicon-32.png
  css/
    style.css            (unchanged)
  js/
    state.js, home.js, purchase.js, cards.js,
    calendar.js, goals.js, calculator.js,
    review.js, app.js    (all unchanged)
```

Nothing about how the app *works* changed — same income tracking, same
calendar, same calculator. This is purely about making it installable.

---

## 2. What is a PWA, and why this instead of a "real" app right away?

A PWA is a website that's been set up so phones treat it like an app:
it gets an icon on the home screen, opens full-screen (no browser address
bar), and can work without an internet connection. Apple, Google, and
every major company use this same technology for parts of their own products.

**Why start here instead of building a native iOS/Android app:**
- It deploys in minutes, not weeks — perfect for your 10-day testing goal
- Anyone can install it immediately by visiting a link — no app store
  approval process, no waiting
- It's the same code you already have — no rewrite, no new programming
  language to learn
- It's not a dead end — this same code can later be wrapped into a real
  App Store / Google Play app using a tool called **Capacitor** (covered
  in section 5 below), so nothing you build now is wasted

---

## 3. How to deploy this so people can install it (do this first)

PWAs require **HTTPS** to work (a secure connection) — installing won't
work on a plain `http://` link. The good news: free hosts like GitHub
Pages and Netlify give you HTTPS automatically.

### Using GitHub Pages (recommended since you're already using GitHub)
1. Upload this **entire folder's contents** to your GitHub repo —
   `index.html`, `manifest.json`, `service-worker.js`, and the `css/`,
   `js/`, and `icons/` folders, all at the top level of the repo
2. Go to your repo's **Settings → Pages**
3. Under "Source," choose the `main` branch, `/ (root)` folder, then
   click **Save**
4. After a minute or two, you'll get a URL like
   `https://yourusername.github.io/your-repo-name/`
5. Open that link — that's the URL you'll share with testers

### Using Netlify Drop (even faster, no GitHub needed)
1. Go to **https://app.netlify.com/drop**
2. Drag this entire folder onto the page
3. You'll get a live HTTPS link immediately

---

## 4. How people install it on their phone

Once you have the live link, share it with your testers along with these
instructions:

**On iPhone (Safari):**
1. Open the link in Safari (must be Safari, not Chrome, for this to work on iOS)
2. Tap the Share icon (square with an arrow) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — the ClearSpend icon now appears on their home screen

**On Android (Chrome):**
1. Open the link in Chrome
2. Chrome will often show a banner automatically: **"Add ClearSpend to
   Home screen"** — tap it
3. If no banner appears, tap the **⋮** (three dots) menu → **"Add to Home
   screen"** or **"Install app"**

Once installed, tapping the icon opens ClearSpend full-screen, just like
any other app — no browser bar, no typing in a URL.

**Important:** because the app stores data using the browser's storage
on each person's own device (see the original README's "How data is
saved" section), everyone who installs it gets their own private data.
This is actually ideal for testing with multiple people at once.

---

## 5. The path to a real App Store / Google Play app later

When you're ready to go further than a PWA (e.g. to get into the actual
App Store, use phone features a browser can't access, or just want it to
feel even more "native"), the standard next step is a tool called
**Capacitor** (made by the Ionic team). It takes your existing HTML/CSS/JS
code — exactly what you already have — and wraps it into a real iOS and
Android app project, which you then submit to the App Store / Google Play.

Rough steps when you're ready (this is a future step, not needed for your
10-day testing goal):

1. Install Node.js on your computer (free) — this gives you the `npm`
   command used to set up Capacitor
2. Run `npm install @capacitor/core @capacitor/cli` in your project folder
3. Run `npx cap init` and follow the prompts (app name, app ID)
4. Run `npx cap add ios` and/or `npx cap add android` — this generates
   real Xcode (iOS) and Android Studio projects that load your existing
   web app inside them
5. Open the generated project in Xcode or Android Studio to test on a
   simulator or real device, tweak native settings (app icon, splash
   screen, permissions) as needed
6. Submit to the App Store (requires the $99/year Apple Developer
   account) and/or Google Play (one-time $25 fee)

Because your code is already organized into clean, modular files (this is
exactly why we split it into `css/style.css` and the separate `js/*.js`
files earlier), this step will be much smoother than if everything were
jammed into one giant file.

**For now:** the PWA you have in this folder is the right move. Get it
in front of testers this week, gather feedback, and revisit the
Capacitor/App Store path once you know the app is something people want
to keep using.

---

## 6. Updating the app after you've deployed it

Whenever you change any file (CSS, JS, HTML) and push the update:

1. Open `service-worker.js`
2. Find this line near the top:
   ```js
   const CACHE_NAME = 'clearspend-v1';
   ```
3. Change `v1` to `v2` (then `v3` next time, etc.)
4. Save, commit, and push the change to GitHub

This step is important — without it, phones that already installed the
app will keep using old cached files and won't see your updates right
away. Bumping the version number tells the service worker to clear out
the old cache and fetch everything fresh.

---

## 7. Everything else (income math, calculator, code structure)

All of that is unchanged from before — see the original `README.md`
(included alongside this file) for the full explanation of the pay
schedule logic, the calculator redesign, and the code structure section
by section.
