# ClearSpend-3
# ClearSpend — Documentation & Setup Guide

ClearSpend is a personal finance tracker: income & fixed bills, credit card
tracking, a daily budget calendar, savings goals, and a credit card interest
calculator. Everything runs in the browser — there is no server and no
account system. All data is saved locally on each person's own device.

---

## 1. What's in this folder

```
clearspend/
  index.html          <- the page structure (HTML)
  css/
    style.css         <- all styling (colors, layout, fonts)
  js/
    state.js          <- data model, storage, pay-schedule math
    home.js           <- Home/Overview screen logic
    purchase.js       <- Purchase screen logic
    cards.js          <- Cards screen logic
    calendar.js       <- Calendar (Daily Tracker) screen logic
    goals.js          <- Goals screen logic
    calculator.js     <- Calculator screen logic
    review.js         <- Year Review screen logic
    app.js            <- navigation + startup (runs last)
  README.md           <- this file
```

This is the split, multi-file version of the app — convenient for
browsing on GitHub, where each file shows up separately and stays a
manageable length.

**Important: the JS files must load in this order** (this is already set
up correctly in `index.html`, but if you ever reorder the `<script>` tags,
keep this in mind):

`state.js` must load **first** — it defines `state`, `saveState()`,
`loadState()`, `fmt()`, and the pay-schedule functions that every other
file depends on. `app.js` must load **last** — it calls `loadState()`,
`setupNav()`, and `renderAll()` once the page is ready, so everything else
needs to already be defined.

The other six files (`home.js`, `purchase.js`, `cards.js`, `calendar.js`,
`goals.js`, `calculator.js`, `review.js`) can load in any order relative
to each other — they're independent of each other, just not of `state.js`.

> **A single-file version also exists** if you ever want one HTML file with
> everything inlined (e.g. to email someone, or avoid any path issues).
> If you want that version regenerated, just ask — it's the same code, just
> combined into one `index.html` with `<style>`/`<script>` blocks instead
> of `<link>`/`<script src>`.

**The code is heavily commented.** Every section has a banner comment
explaining what it does, and most functions have a comment above them
explaining their purpose, inputs, and any tricky logic. Section numbers
(1 through 12) are preserved across files so you can see how everything
relates — e.g. `state.js` contains sections 1–3, `app.js` contains
sections 4 and 12.

---

## 2. Running it locally

**Easiest way:** double-click `index.html`. As long as the `css/` and
`js/` folders are in the same folder as `index.html` (don't move
`index.html` out on its own), it opens in your browser and works
immediately — no installation needed.

**For editing (recommended):**
1. Open the folder in VS Code (File → Open Folder)
2. Install the "Live Server" extension (search in the Extensions tab,
   look for the one by Ritwick Dey)
3. Right-click `index.html` → "Open with Live Server"
4. The page auto-reloads every time you save a change

---

## 3. How data is saved

The app uses `localStorage`, a feature built into every browser. Whenever
you add, edit, or delete something, the entire app's data is saved as a
block of JSON under the key `clearspend_v3`.

This means:
- Data is saved automatically — there's no "save" button needed for your data
- Data persists between visits (closing the tab/browser is fine)
- Data is **specific to one browser on one device** — it does NOT sync
  between your phone and laptop, or between different browsers
- Data is **private** — nothing is sent anywhere, it never leaves the device
- Clearing your browser's "site data" / cookies for this page will erase it

**To reset all data:** open the browser console (press F12, click the
"Console" tab) and run:
```js
localStorage.removeItem('clearspend_v3')
```
then refresh the page.

**To back up your data:** open the console and run:
```js
copy(localStorage.getItem('clearspend_v3'))
```
This copies your data to your clipboard as text — paste it somewhere safe
(like a text file). To restore it later, run:
```js
localStorage.setItem('clearspend_v3', 'PASTE_YOUR_BACKUP_HERE')
```
then refresh.

---

## 4. Understanding the income / "available balance" math

This was the trickiest part of the app to get right, so here's the full
explanation.

### The problem
If you're paid $1,500 every two weeks (biweekly), there are 26 paychecks
in a year. 26 ÷ 12 months = **2.1667** paychecks per month on average.
$1,500 × 2.1667 ≈ **$3,250/month**.

That's correct **as a yearly average** — but in any *specific* month, you
usually get paid exactly 2 times (sometimes 3), never 2.1667 times. So in
a month where you're only paid twice, the app would show you having
~$1,750 more than you actually do.

### The fix: three "pay modes"
On the Home screen, when you set your income frequency to Weekly or
Biweekly, you'll see three options:

| Mode | What it does | Best for |
|---|---|---|
| **Average** | Old behavior: paycheck × 2.17 (biweekly) or × 4.33 (weekly), every month | Quick estimates, long-term planning |
| **Pattern** | You give ONE real pay date you know about. The app counts forward/backward every 7 or 14 days from that date to find every paycheck, and counts how many land in each month | "I get paid every other Friday" — most common case |
| **Manual** | You type in the exact dates you'll be paid, for any month | Irregular schedules, self-employment, etc. |

**Example:** June 2026 has Fridays on the 5th, 12th, 19th, and 26th. If
you're paid every other Friday starting June 12, Pattern mode would
correctly show **2 paychecks** landing in June (June 12 and June 26) —
giving you $3,000, not $3,250.

### Where this shows up
- **Available balance** (Home) — uses the actual month's income
- **Daily budget** (Home & Calendar) — `(this month's income - fixed bills) / days in month`
- **Calendar** — paydays are outlined in green (Pattern/Manual modes only)
- **Goals** — the "$ needed per month" estimate uses this same monthly income

---

## 5. Understanding the redesigned Calculator

### What changed and why
The old calculator asked for "current balance," "monthly payment," and
"days until due" — three numbers that don't map cleanly onto how people
actually think about a credit card, and entering unrealistic combinations
(like a $240 balance with a $2,400/month payment) produced confusing
results like "1 month to pay off."

### The new fields
- **Credit limit** — your card's total limit
- **Amount charged so far** — your current balance/statement balance
- **APR** — your interest rate (as a percentage, e.g. 24.99)
- **Payment due date** — an actual calendar date (not "days from now")
- **Planned monthly payment** — optional; only fill this in if you want a
  payoff projection

### What it shows you
- **Available credit left** = limit − amount charged
- **Card utilization** = (amount charged ÷ limit) × 100%, color-coded
  (green under 30%, amber 30–70%, red over 70% — this mirrors how
  utilization affects your credit score)
- **Interest per day** = amount charged × (APR ÷ 100 ÷ 365)
- **Interest by due date** = interest per day × number of days until your
  due date (calculated from today's date to the date you picked)
- **If you enter a planned monthly payment:**
  - Months to pay off (using the standard amortization formula)
  - Total interest you'd pay over that time
  - A milestone chart showing your balance at 25%/50%/75%/100% of the way through

---

## 6. Code structure reference (for making changes)

Inside the `<script>` block, the code is organized into 12 numbered
sections, each with a large comment banner:

1. **STATE & STORAGE** — the `state` object holding all data, plus
   `saveState()` / `loadState()`
2. **HELPERS** — `fmt()` for currency formatting, purchase-filtering helpers
3. **PAY SCHEDULE LOGIC** — `getPayDatesInMonth()` and `getMonthlyIncome()`,
   the core of the income fix described above
4. **NAVIGATION** — `setupNav()`, handles the top tab bar
5. **HOME SCREEN** — `renderHome()`, income form handlers, expense handlers
6. **PURCHASE SCREEN** — logging and listing purchases
7. **CARDS SCREEN** — adding/removing cards, utilization display
8. **CALENDAR SCREEN** — `renderCalendar()`, the daily budget grid
9. **GOALS SCREEN** — savings goal tracking
10. **CALCULATOR SCREEN** — `runCalc()`, the redesigned interest calculator
11. **YEAR REVIEW SCREEN** — the yearly heatmap and category breakdown
12. **INIT** — runs once when the page loads, wires everything together

### Common changes

**Change the app name / branding**
Search for "ClearSpend" — it appears in `<title>` and in `.logo`.

**Change colors**
All colors are CSS variables defined at the very top of the `<style>`
block, inside `:root { ... }`. Change `--orange` to re-theme the accent
color, `--bg`/`--bg2`/etc. for backgrounds, and so on.

**Add a new spending category**
1. In the HTML, find `<select id="p-cat">` and add a new
   `<option value="yourcategory">Your Label</option>`
2. In the JavaScript, find the `catLabels` object inside
   `renderYearReview()` and add `yourcategory: 'Your Label'` so it
   displays nicely in the Year Review breakdown

**Change the average paycheck multipliers**
Search for `4.33` and `2.17` — these appear in `getPayDatesInMonth()` and
`getMonthlyIncome()`. They're the standard weekly/biweekly averages
(52/12 and 26/12) and shouldn't normally need to change.

**Add a new screen/tab**
1. Add a new button in `.topbar` → `.nav`:
   `<button class="nav-btn" data-section="yourtab">Your Tab</button>`
2. Add a new `<div id="s-yourtab" class="screen">...</div>` inside `.page`
3. Write a `renderYourTab()` function and call it from `setupNav()` if the
   screen needs fresh data every time it's opened

---

## 7. Putting this online so others can try it

Since there's no backend and no build step, you can deploy this for free
in a couple of minutes. Two good options:

### Option A — Netlify Drop (fastest, no account needed)
1. Go to **https://app.netlify.com/drop** in your browser
2. Drag the `index.html` file (or the whole folder) onto the page
3. Netlify gives you a live URL immediately (something like
   `https://random-name-12345.netlify.app`)
4. Share that link with anyone — they can open it on any device

This link works until you close the browser tab, unless you create a free
Netlify account to make it permanent (you can do this after dropping the
file — it'll prompt you).

### Option B — GitHub Pages (free, permanent, good if you'll keep editing)
1. Create a free GitHub account at **https://github.com** if you don't
   have one
2. Create a new repository (e.g. "clearspend")
3. Upload `index.html` to it (there's an "Add file → Upload files" button
   on the repository page)
4. Go to the repository's **Settings → Pages**
5. Under "Source," choose the `main` branch and `/ (root)` folder, then
   click Save
6. After a minute or two, GitHub will show you a URL like
   `https://yourusername.github.io/clearspend/` — share that link

With GitHub Pages, every time you update `index.html` in the repository,
the live site updates automatically within a minute or two.

### A note on testing with friends
Because the app saves data in `localStorage`, **everyone who opens the
link gets their own separate, private data** — nobody can see anyone
else's numbers, and nothing is shared between users. This makes it ideal
for early testing: people can play with it freely without any privacy
concerns, and you don't need to set up accounts or a database yet.

---

## 8. Suggested next steps for development

If you want to take this further toward something you could pitch or
launch more broadly, here's a rough order of priorities:

1. **Gather feedback first** (you're already doing this!) — watch what
   confuses people, what they wish it did, what they forget to use
2. **Export/import data** — let users download their data as a file and
   load it back in, as a stepping stone before real accounts
3. **Mobile polish** — test on phones specifically; tweak the calendar
   and forms for small screens
4. **Accounts + a real backend** — once you're confident in the feature
   set, move data from `localStorage` to a real database (e.g. via
   Firebase, Supabase, or a custom backend) so people can use the app
   across multiple devices
5. **Bank account linking** (e.g. via Plaid) — this is the big one for a
   "sell to a bank/fintech" pitch, but it's also the most complex: it
   requires a secure backend, compliance work (data privacy laws), and
   a paid Plaid (or similar) account
6. **Notifications** — remind users of upcoming due dates or when they're
   close to their daily budget limit (requires a backend + push
   notification setup)

For now, steps 1–3 can all be done with just this single HTML file and a
free hosting link — no backend needed.
