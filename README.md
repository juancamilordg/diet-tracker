# Nutrition Tracker

A full-stack diet tracking app that uses AI to analyze your meals from photos. Log food through a Telegram bot or the web app, track your calories, macros, and micronutrients, and share it with your household.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [Tech Stack & Why Each Choice](#tech-stack--why-each-choice)
- [Project Structure](#project-structure)
- [The Backend](#the-backend)
  - [Database Design](#database-design)
  - [API Layer](#api-layer)
  - [AI Meal Analysis](#ai-meal-analysis)
  - [Telegram Bot](#telegram-bot)
- [The Frontend](#the-frontend)
  - [Pages & Navigation](#pages--navigation)
  - [Dashboard Components](#dashboard-components)
  - [Theme System](#theme-system)
- [Multi-User System](#multi-user-system)
- [Deployment](#deployment)
  - [Local Development (Docker Compose)](#local-development-docker-compose)
  - [Production (Railway)](#production-railway)
- [Environment Variables](#environment-variables)
- [Key Design Decisions](#key-design-decisions)

---

## How It Works

```
                    +------------------+
                    |   Telegram Bot   |
                    |  (send a photo)  |
                    +--------+---------+
                             |
                             v
+-------------+     +-------+--------+     +----------------+
|   Web App   | --> |  FastAPI Server | --> | Claude AI (API)|
| (React SPA) |     |                |     | Analyzes meals |
+-------------+     +-------+--------+     +----------------+
                             |
                    +--------+---------+
                    |     SQLite DB    |
                    | (meals, users,   |
                    |  goals, water)   |
                    +------------------+
```

**The typical flow:**

1. You take a photo of your meal and send it to the Telegram bot
2. The bot downloads the photo and sends it to Claude AI for analysis
3. Claude identifies the food and estimates calories, protein, carbs, fat, fiber, and sodium
4. The bot shows you the estimate and asks you to confirm
5. You pick a meal category (breakfast/lunch/dinner/snack) and it's saved
6. Open the web dashboard to see your daily totals, weekly trends, and progress toward your goals

You can also log meals manually through the web app, edit existing entries, set personalized nutrition targets with a TDEE calculator, and browse previous days.

---

## Architecture Overview

This is a **monolithic** app — everything runs in a single process. Here's why that matters:

```
Single Docker Container
├── FastAPI (web framework)
│   ├── REST API endpoints (/api/*)
│   └── Static file server (React app)
├── Telegram Bot (polling loop)
├── SQLite Database (file on disk)
└── Photo Storage (files on disk)
```

**What "monolithic" means:** Instead of having separate servers for the API, the bot, the database, and the frontend, everything runs together in one process. This is simpler to deploy, debug, and reason about. For a household app with 2-3 users, this is the right choice — microservices would add complexity for zero benefit.

**What "polling" means for the Telegram bot:** There are two ways a Telegram bot can receive messages:
- **Webhooks:** Telegram sends messages to your server (requires a public URL with HTTPS)
- **Polling:** Your server asks Telegram "any new messages?" every few seconds

We use polling because it's simpler and works everywhere, even behind firewalls. The tradeoff is a slight delay (up to 10 seconds) before the bot processes a message.

---

## Tech Stack & Why Each Choice

### Backend

| Technology | What It Does | Why We Chose It |
|---|---|---|
| **Python 3.12** | Programming language | Excellent AI/ML library ecosystem, great for prototyping |
| **FastAPI** | Web framework (handles HTTP requests) | Async by default, auto-generates API docs, type-safe |
| **SQLite** | Database (stores all data) | Zero setup, single file, perfect for small apps |
| **aiosqlite** | Async SQLite wrapper | Lets SQLite work with FastAPI's async architecture |
| **python-telegram-bot** | Telegram Bot API wrapper | Most mature Python library for Telegram bots |
| **Anthropic SDK** | Claude AI client | Official SDK for calling Claude's API |
| **uvicorn** | ASGI server (runs FastAPI) | Fast, production-ready Python web server |

### Frontend

| Technology | What It Does | Why We Chose It |
|---|---|---|
| **React 19** | UI framework | Component-based, huge ecosystem, great for SPAs |
| **TypeScript** | Typed JavaScript | Catches bugs before they reach production |
| **Tailwind CSS** | Utility-first CSS framework | Rapid styling without writing custom CSS files |
| **Recharts** | Chart library | Simple React-native charts, good for dashboards |
| **Vite** | Build tool & dev server | Extremely fast hot-reload during development |
| **React Router** | Client-side routing | Navigate between pages without full page reloads |

### Infrastructure

| Technology | What It Does | Why We Chose It |
|---|---|---|
| **Docker** | Containerization | "Works on my machine" → works everywhere |
| **Docker Compose** | Multi-container orchestration | Run backend + frontend locally with one command |
| **Railway** | Cloud hosting platform | Simple deployment from GitHub, free tier available |
| **Nginx** | Web server (local only) | Serves frontend + proxies API in local Docker setup |

### Key Concepts Explained

**What is an API?** An API (Application Programming Interface) is a set of URLs that your frontend calls to get or send data. For example, `GET /api/dashboard` returns the dashboard data as JSON. The frontend doesn't talk to the database directly — it always goes through the API.

**What is async/await?** When your code needs to wait for something slow (database query, API call, file download), `async/await` lets other code run during that wait time. Without it, the entire server would freeze while waiting for one user's request to complete.

**What is a SPA?** A Single Page Application loads once, then navigates between "pages" by swapping content in the browser — no full page reloads. The URL changes but the browser never actually loads a new HTML page. React Router handles this.

**What is Docker?** Docker packages your app and all its dependencies into a "container" — a lightweight, isolated environment. Think of it like a tiny virtual computer that has exactly what your app needs. This means the app runs the same way on your laptop, your friend's laptop, or a cloud server.

---

## Project Structure

```
Diet Tracker/
├── Dockerfile                    # Combined build (frontend + backend) for production
├── docker-compose.yml            # Local dev: separate API + Web containers
├── .env                          # Your secrets (not in git!)
├── .env.example                  # Template showing what secrets are needed
│
├── backend/
│   ├── Dockerfile                # Backend-only container (for local dev)
│   ├── requirements.txt          # Python dependencies
│   ├── main.py                   # App entry point: FastAPI + bot startup
│   ├── config.py                 # Environment variable loading
│   │
│   ├── ai/                       # AI meal analysis
│   │   ├── analyzer.py           # Photo & text analysis via Claude
│   │   └── prompts.py            # System prompt + tool definition
│   │
│   ├── api/                      # REST API layer
│   │   ├── deps.py               # Shared dependencies (user ID extraction)
│   │   ├── schemas.py            # Request/response data shapes (Pydantic)
│   │   └── routes/
│   │       ├── dashboard.py      # GET /api/dashboard
│   │       ├── meals.py          # CRUD /api/meals + photo upload
│   │       ├── goals.py          # GET/PUT /api/goals
│   │       ├── water.py          # Water logging
│   │       ├── stats.py          # Weekly statistics
│   │       ├── users.py          # User management
│   │       └── photos.py         # Telegram photo proxy
│   │
│   ├── bot/                      # Telegram bot
│   │   ├── setup.py              # Bot initialization & handler registration
│   │   ├── keyboards.py          # Inline button layouts
│   │   ├── formatters.py         # Message text formatting
│   │   └── handlers/
│   │       ├── start.py          # /start and /help commands
│   │       ├── meal_photo.py     # Photo + /log conversation flow
│   │       └── reports.py        # /today summary command
│   │
│   ├── db/                       # Database layer
│   │   ├── connection.py         # Connection management + migrations
│   │   ├── schema.sql            # Table definitions
│   │   ├── meals.py              # Meal CRUD queries
│   │   ├── goals.py              # Goals queries
│   │   ├── water.py              # Water log queries
│   │   ├── summaries.py          # Aggregation queries (dashboard data)
│   │   └── users.py              # User queries
│   │
│   └── data/                     # Runtime data (not in git)
│       ├── diet_tracker.db       # SQLite database file
│       └── photos/               # Uploaded meal photos
│
└── frontend/
    ├── Dockerfile                # Frontend-only container (for local dev)
    ├── nginx.conf                # Nginx config (proxies /api to backend)
    ├── index.html                # HTML entry point
    ├── package.json              # Node.js dependencies
    ├── vite.config.ts            # Vite build configuration
    ├── tailwind.config.ts        # Tailwind theme & custom colors
    ├── tsconfig.json             # TypeScript configuration
    │
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Router + layout
        ├── UserContext.tsx        # Multi-user state management
        │
        ├── api/
        │   └── client.ts         # All API calls + user header injection
        │
        ├── pages/
        │   ├── Dashboard.tsx     # Main dashboard with date navigation
        │   ├── LogHistory.tsx    # Meal history feed
        │   ├── MealEdit.tsx      # Add/edit meal form
        │   └── Settings.tsx      # Goals, TDEE calculator, theme toggle
        │
        ├── components/
        │   ├── dashboard/
        │   │   ├── CalorieHero.tsx        # Big calorie number + progress bar
        │   │   ├── MacroRing.tsx          # Circular progress for one macro
        │   │   ├── MacroSection.tsx       # All three macro rings together
        │   │   ├── WeeklyChart.tsx        # 7-day bar chart
        │   │   ├── MicronutrientBars.tsx  # Fiber + sodium progress bars
        │   │   ├── TelegramCard.tsx       # Last logged meal card
        │   │   ├── CalendarPicker.tsx     # Date picker dropdown
        │   │   └── HydrationCard.tsx      # Water intake display
        │   │
        │   ├── feed/
        │   │   ├── MealCard.tsx           # Single meal in the log feed
        │   │   ├── DateDivider.tsx        # Date separator between days
        │   │   └── DailyMacroHeader.tsx   # Daily totals header
        │   │
        │   ├── meal-form/
        │   │   ├── MealAnalysis.tsx       # Main add/edit form with AI analysis
        │   │   ├── PhotoUpload.tsx        # Photo file picker
        │   │   └── NutrientInput.tsx      # Styled number input for macros
        │   │
        │   ├── settings/
        │   │   ├── TDEECalculator.tsx     # Body stats → calorie target modal
        │   │   ├── TDEECard.tsx           # Current TDEE display
        │   │   ├── MacroSliders.tsx       # Drag sliders for macro targets
        │   │   └── TelegramStatus.tsx     # Bot connection indicator
        │   │
        │   └── layout/
        │       ├── TopAppBar.tsx          # Header with user picker
        │       ├── BottomNav.tsx          # Tab bar (Dash/Add/Log/Goals)
        │       └── PageLayout.tsx         # Page wrapper
        │
        └── styles/
            └── globals.css               # Theme variables + light mode overrides
```

---

## The Backend

### Database Design

The database has 5 main tables. Here's what each stores and why:

```
┌─────────┐       ┌──────────┐       ┌───────────┐
│  users   │──┐    │  meals   │       │   goals   │
├─────────┤  │    ├──────────┤       ├───────────┤
│ id      │  ├───>│ user_id  │       │ user_id   │◄──┐
│ telegram│  │    │ calories │       │ cal_target│   │
│ _id     │  │    │ protein  │       │ protein_t │   │
│ display │  │    │ carbs    │       │ carbs_t   │   │
│ _name   │  │    │ fat      │       │ fat_t     │   │
└─────────┘  │    │ fiber    │       │ tdee_stats│   │
             │    │ sodium   │       └───────────┘   │
             │    │ photo    │                        │
             │    │ ai_resp  │       ┌───────────┐   │
             │    └──────────┘       │ water_log │   │
             │                       ├───────────┤   │
             ├──────────────────────>│ user_id   │   │
             │                       │ amount_ml │   │
             │                       │ logged_at │   │
             └───────────────────────┴───────────┘───┘
                    All tables link back to users via user_id
```

#### users
Stores who uses the app. When someone messages the Telegram bot for the first time, a row is auto-created with their Telegram ID and first name.

| Column | Type | Purpose |
|---|---|---|
| id | INTEGER (auto) | Unique identifier |
| telegram_id | INTEGER (unique) | Links to their Telegram account |
| display_name | TEXT | Shown in the web app user picker |
| created_at | TEXT | When they first used the app |

#### meals
The core table — every food entry lives here. One row = one meal or snack.

| Column | Type | Purpose |
|---|---|---|
| id | INTEGER (auto) | Unique identifier |
| user_id | INTEGER (FK) | Who logged this meal |
| logged_at | TEXT | When the meal was eaten |
| meal_category | TEXT | breakfast, lunch, dinner, or snack |
| description | TEXT | "Salmon Poke Bowl with Mango" |
| calories | REAL | Total kcal (estimated by AI or manual) |
| protein_g | REAL | Grams of protein |
| carbs_g | REAL | Grams of carbohydrates |
| fat_g | REAL | Grams of fat |
| fiber_g | REAL | Grams of dietary fiber |
| sodium_mg | REAL | Milligrams of sodium |
| photo_file_id | TEXT | Telegram's file ID (for bot-uploaded photos) |
| photo_url | TEXT | URL for web-uploaded photos |
| input_method | TEXT | How it was logged: photo, text, or manual |
| ai_raw_response | TEXT | Full Claude API response (for debugging) |
| notes | TEXT | Optional user notes |

**Why two photo fields?** Telegram stores photos on their servers and gives you a `file_id` to retrieve them later. Web uploads are stored on our server and accessed via a URL. The dashboard checks both fields and displays whichever exists.

#### goals
Each user has one row with their personal nutrition targets. If a user doesn't have goals yet, default values are used and a row is auto-created on first access.

| Column | Type | Purpose |
|---|---|---|
| user_id | INTEGER (unique) | One goals row per user |
| daily_calories_target | INTEGER | e.g., 2400 kcal |
| protein_target_g | REAL | e.g., 150g |
| carbs_target_g | REAL | e.g., 250g |
| fat_target_g | REAL | e.g., 75g |
| fiber_target_g | REAL | e.g., 30g |
| water_target_ml | INTEGER | e.g., 3500ml |
| weight_kg, height_cm, age, sex, activity_level | Various | Inputs for TDEE calculation |

#### water_log
Simple log of water intake. Each glass/bottle is a separate entry.

| Column | Type | Purpose |
|---|---|---|
| user_id | INTEGER (FK) | Who drank this |
| amount_ml | INTEGER | How much (e.g., 250ml) |
| logged_at | TEXT | When |

#### How data flows through the database layer

```
API Request
    │
    ▼
api/routes/dashboard.py          ◄── Receives HTTP request
    │
    ▼
db/summaries.py                  ◄── Runs SQL aggregation queries
    │                                  (SUM calories, GROUP BY date, etc.)
    ▼
db/connection.py → get_db()      ◄── Opens async SQLite connection
    │
    ▼
data/diet_tracker.db             ◄── The actual file on disk
```

Every database function follows the same pattern:
1. Open a connection with `async with get_db() as db:`
2. Execute a SQL query with `await db.execute(query, params)`
3. Fetch results with `await cursor.fetchone()` or `fetchall()`
4. Convert the row to a Python dictionary with `dict(row)`

---

### API Layer

The API is organized into route files, each handling a specific resource. Every route that needs to know "which user is making this request" uses a **dependency injection** function.

#### How user identification works

```
Browser sends request:
  GET /api/dashboard
  Headers: { "X-User-ID": "2" }
         │
         ▼
FastAPI dependency: get_current_user_id()
  → Reads X-User-ID header
  → Returns 2
         │
         ▼
Route handler: dashboard(user_id=2)
  → Queries database WHERE user_id = 2
  → Returns only that user's data
```

**Why a header instead of login/password?** This is a household app for 2-3 trusted people on the same network. Full authentication (passwords, sessions, tokens) would add complexity without real benefit. The `X-User-ID` header is set by the frontend based on which user profile is selected.

#### Complete API reference

| Method | Path | What It Does | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Health check (is the server running?) | No |
| `GET` | `/api/dashboard?date=YYYY-MM-DD` | Full dashboard data for a date | User ID |
| `GET` | `/api/meals?limit=50&offset=0` | List meals (paginated) | User ID |
| `GET` | `/api/meals/:id` | Get single meal | No |
| `POST` | `/api/meals` | Create a meal | User ID |
| `PUT` | `/api/meals/:id` | Update a meal | No |
| `DELETE` | `/api/meals/:id` | Delete a meal | No |
| `POST` | `/api/meals/analyze` | AI-analyze a photo or text | No |
| `POST` | `/api/meals/upload-photo` | Upload a meal photo | No |
| `GET` | `/api/meals/photos/:filename` | Serve an uploaded photo | No |
| `GET` | `/api/goals` | Get user's nutrition targets | User ID |
| `PUT` | `/api/goals` | Update nutrition targets | User ID |
| `GET` | `/api/water/today` | Today's water intake | User ID |
| `POST` | `/api/water` | Log water intake | User ID |
| `GET` | `/api/stats/weekly` | Last 7 days of daily totals | User ID |
| `GET` | `/api/users` | List all users | No |
| `POST` | `/api/users` | Create a new user | No |
| `GET` | `/api/photos/:file_id` | Proxy a Telegram photo | No |

#### What is a "proxy" for Telegram photos?

When you send a photo to the Telegram bot, Telegram stores the file on their servers. They give us a `file_id` — a long string that identifies the photo. To display it on the web, we can't just give the browser the file_id — it needs a URL.

The `/api/photos/:file_id` endpoint acts as a **proxy**: the browser asks our server for the photo, our server fetches it from Telegram's API, and streams it back to the browser. The browser never talks to Telegram directly.

```
Browser                    Our Server                 Telegram API
  │                            │                           │
  │ GET /api/photos/AgAC...   │                           │
  │ ─────────────────────────>│                           │
  │                            │ Get file URL for AgAC... │
  │                            │ ─────────────────────────>│
  │                            │    Here's the URL         │
  │                            │ <─────────────────────────│
  │                            │ Download the actual image │
  │                            │ ─────────────────────────>│
  │                            │    Image bytes            │
  │    Image bytes             │ <─────────────────────────│
  │ <──────────────────────────│                           │
```

---

### AI Meal Analysis

This is the core feature — turn a photo of food into nutrition data.

#### How it works

```
Photo (bytes)
    │
    ▼
Convert to base64 string            ◄── Encode image for API transport
    │
    ▼
Send to Claude API with:
  - System prompt (be a nutrition analyst)
  - The image
  - A "tool" called log_nutrition     ◄── Forces structured output
    │
    ▼
Claude responds:
  "I see salmon, rice, mango..."
  + calls log_nutrition({
      meal_name: "Salmon Poke Bowl",
      calories: 650,
      protein_g: 35,
      carbs_g: 75,
      fat_g: 20,
      fiber_g: 4,
      sodium_mg: 800
    })
    │
    ▼
Extract the tool call arguments       ◄── This is our structured data
    │
    ▼
Return to the bot or web app
```

#### What is "tool use" in Claude?

Normally, Claude returns free-form text. But we need **structured data** (specific numbers in specific fields). "Tool use" is a feature where you tell Claude "here's a function you can call" and Claude responds by "calling" it with the right arguments.

We define a tool called `log_nutrition` with a schema:
```json
{
  "name": "log_nutrition",
  "input_schema": {
    "properties": {
      "meal_name": { "type": "string" },
      "calories": { "type": "number" },
      "protein_g": { "type": "number" },
      ...
    }
  }
}
```

Claude sees this and knows it should respond with these exact fields filled in. This is more reliable than asking Claude to output JSON — the tool schema acts as a contract.

#### The system prompt

The prompt tells Claude to:
- Be accurate but conservative (better to slightly overestimate than underestimate)
- Account for hidden calories (cooking oils, sauces, dressings)
- Assume standard adult servings when portion size is unclear
- Always provide an estimate, even when uncertain

---

### Telegram Bot

The bot uses a **ConversationHandler** — a state machine that remembers where each user is in a multi-step flow.

#### Conversation flow for logging a meal

```
          ┌─────────────────────┐
          │  User sends photo   │
          │  or /log <text>     │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Download + Analyze │
          │  with Claude AI     │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Show estimate      │
          │  [Save] [Edit] [X]  │ ◄── CONFIRM state
          └──┬─────┬────────┬───┘
             │     │        │
         Save │  Edit │   Cancel │
             │     │        │
             │     │   ┌────▼────┐
             │     │   │ "Meal   │
             │     │   │ not     │
             │     │   │ saved"  │
             │     │   └─────────┘
             │     │
     ┌───────▼─────▼────────┐
     │  Pick a category:    │
     │  [Breakfast] [Lunch] │ ◄── CATEGORY state
     │  [Dinner]   [Snack]  │
     └──────────┬───────────┘
                │
     ┌──────────▼──────────┐
     │  Save to database   │
     │  "Meal saved! 650   │
     │   kcal"              │
     └─────────────────────┘
```

**What is a ConversationHandler?** It's a way to handle multi-step interactions. Without it, each button press would be an independent event with no memory. The ConversationHandler tracks:
- Which user is in a conversation
- What step (state) they're on
- Pending data between steps (stored in `context.user_data`)

#### Available commands

| Command | What It Does |
|---|---|
| `/start` | Welcome message + auto-register your Telegram account |
| `/help` | Show all available commands |
| `/today` | Show today's calories and macros vs your targets |
| `/log <text>` | Log a meal by describing it in text |
| Send a photo | Log a meal by photo (AI analyzes it) |
| `/cancel` | Cancel the current logging flow |

---

## The Frontend

### Pages & Navigation

The app has 4 pages accessed via a bottom tab bar:

```
┌─────────────────────────────────────┐
│  ┌─ NUTRITION TRACKER ──── [👤] ─┐  │ ◄── Top bar with user picker
│  │                               │  │
│  │                               │  │
│  │        Page Content           │  │ ◄── Changes based on tab
│  │                               │  │
│  │                               │  │
│  ├───────────────────────────────┤  │
│  │  📊    ➕    📜    ⚙️        │  │ ◄── Bottom navigation
│  │ Dash   Add   Log  Goals      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

1. **Dashboard** (`/dash`) — Today's snapshot: calories, macros, weekly chart, last meal
2. **Add Meal** (`/add`) — Photo upload + AI analysis + manual editing
3. **Log History** (`/log`) — Scrollable feed of all logged meals
4. **Goals/Settings** (`/goals`) — TDEE calculator, macro targets, theme toggle

### Dashboard Components

The dashboard is built from independent, reusable components:

```
┌─────────────────────────────────────────────────────┐
│                 ◄  Today  ►  📅                      │ ◄── Date navigation
├───────────────────────────────────┬─────────────────┤
│                                   │  Last Logged    │
│   1,847                           │  Salmon Poke    │
│   / 2,400 kcal                    │  Bowl           │ ◄── TelegramCard
│                                   │  [photo]        │
│   ████████████████░░░░  77%       │  P:35 F:20 C:75 │
│              CalorieHero          │                 │
├───────────┬───────────┬───────────┴─────────────────┤
│ PROTEIN   │ CARBS     │ FAT                         │
│   112     │   185     │  52                         │
│  /150g    │  /250g    │ /75g                        │ ◄── MacroRings
│   (75%)   │  (74%)    │ (69%)                       │
│   ◠       │   ◠       │  ◠                          │
├───────────┴───────────┴─────────────────────────────┤
│  Weekly Lab Adherence                               │
│  ▓▓  ▓▓  ▓▓  ░░  ▓▓  ▓▓  ░░                       │ ◄── WeeklyChart
│  SU  MO  TU  WE  TH  FR  SA                        │
├─────────────────────────────────────────────────────┤
│  Micronutrient Bio-Markers                          │
│  Fiber    ████████░░░░░  22g / 30g (73%)            │ ◄── MicronutrientBars
│  Sodium   ██████████████ 2100mg / 2300mg (91%)      │
└─────────────────────────────────────────────────────┘
```

**Over-target indicators:** When you exceed a target (e.g., eating more calories than your goal), the relevant component turns red. This works for calories, all macros, and sodium. The percentage shows the actual value (e.g., "127%"), and the progress bar fills to 100% in red. For sodium specifically, going over the FDA's 2300mg recommendation shows a warning.

### Theme System

The app supports dark and light modes using CSS custom properties (variables).

**How theming works:**

```css
/* Default (dark mode) — defined in tailwind.config.ts */
--color-primary: #caff6f;        /* Bright lime green */
--color-surface: #0c1424;        /* Very dark blue */
--color-on-surface: #dee5ff;     /* Light text on dark backgrounds */

/* Light mode overrides — defined in globals.css */
html:not(.dark) {
  --color-primary: #456500;      /* Dark green */
  --color-surface: #f5f7f9;      /* Light gray */
  --color-on-surface: #2c2f31;   /* Dark text on light backgrounds */
}
```

All components use these variables via Tailwind classes like `text-primary`, `bg-surface`, `text-on-surface`. When the theme switches, every component updates automatically because the underlying CSS variables change.

The theme preference is stored in `localStorage` and a script in `index.html` applies it before React loads to prevent a flash of the wrong theme.

---

## Multi-User System

The app supports multiple users without authentication. Here's how:

```
Telegram Bot                           Web App
┌─────────┐                    ┌────────────────────┐
│ Partner  │──sends photo──>   │  ┌──────────────┐  │
│ sends    │                   │  │ 👤 Juan ▼    │  │
│ /start   │                   │  │  Juan Camilo │  │
│          │                   │  │  Eleni       │  │
│ Auto-    │                   │  └──────────────┘  │
│ register │                   │  Click to switch   │
└─────────┘                    └────────────────────┘
     │                                   │
     ▼                                   ▼
  users table                    X-User-ID header
  ┌────┬────────────┬──────┐    sent with every
  │ id │ display    │ tg_id│    API request
  │  2 │ Juan Camilo│ 5791 │
  │  3 │ Eleni      │ 8520 │
  └────┴────────────┴──────┘
```

**Telegram side:** When someone messages the bot for the first time, `get_or_create_by_telegram_id()` checks if their Telegram ID exists in the `users` table. If not, it creates a new user. All subsequent meals from that Telegram account are tagged with their user_id.

**Web side:** The top bar shows the current user's avatar. Clicking it shows a dropdown to switch between users. When you switch, the app saves the choice to `localStorage` and reloads the dashboard with the new user's data. Every API request includes an `X-User-ID` header so the backend knows which user's data to return.

**Why this approach?** For a household app, full authentication (passwords, email verification, sessions) would be overkill. Everyone trusts each other — you just need to see your own data vs. your partner's data. The X-User-ID header is simple and works perfectly for this use case.

---

## Deployment

### Local Development (Docker Compose)

```
docker-compose.yml creates:

┌──────────────────────────────────────────────┐
│                Docker Network                 │
│                                               │
│  ┌─────────────┐         ┌─────────────────┐ │
│  │  api         │         │  web             │ │
│  │  (FastAPI)   │◄────────│  (Nginx)         │ │
│  │  Port 8000   │  proxy  │  Port 80→3000    │ │
│  └──────┬───────┘         └─────────────────┘ │
│         │                                      │
│    ┌────▼─────┐                                │
│    │ ./data/  │ ◄── Volume mount (persists     │
│    │  .db     │      data between restarts)    │
│    └──────────┘                                │
└──────────────────────────────────────────────┘
```

**How Docker Compose networking works:** When you define services in `docker-compose.yml`, Docker creates a private network where services can reach each other by name. The `web` container's Nginx config can proxy to `http://api:8000` because `api` is a valid hostname inside this network. Your browser connects to `localhost:3000` (the web container), which proxies API calls to the API container.

**Commands:**
```bash
# Start everything
docker compose up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up --build -d
```

### Production (Railway)

In production, the app runs as a **single service** instead of two:

```
┌─────────────────────────────────────────┐
│          Railway Container               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  FastAPI (Python)                  │  │
│  │  ├── /api/* → API routes           │  │
│  │  └── /* → Serve React static files │  │
│  └──────────────┬─────────────────────┘  │
│                 │                         │
│  ┌──────────────▼──────────────────────┐ │
│  │  Railway Volume (/app/data)         │ │
│  │  ├── diet_tracker.db                │ │
│  │  └── photos/                        │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Why combine into one service?** On Railway, each service gets its own URL and there's no shared internal network like Docker Compose provides. Running two services would require the frontend to know the backend's URL and deal with CORS (cross-origin) restrictions. One service avoids all of this.

**The combined Dockerfile** does a multi-stage build:
1. **Stage 1:** Build the React app with Node.js → outputs static files to `dist/`
2. **Stage 2:** Copy those static files into the Python container → FastAPI serves them

**What is a multi-stage build?** Docker lets you use multiple `FROM` instructions in one Dockerfile. Each creates a "stage." You can copy files between stages. This means the final image only has Python + the pre-built frontend files — Node.js and all the build tools are thrown away, keeping the image small.

---

## Environment Variables

Create a `.env` file in the project root with these values:

```bash
# Required — the app won't function without these
TELEGRAM_BOT_TOKEN=your_bot_token_here    # Get from @BotFather on Telegram
ANTHROPIC_API_KEY=sk-ant-your_key_here    # Get from console.anthropic.com

# Optional — have sensible defaults
DATABASE_PATH=data/diet_tracker.db        # Where SQLite stores data
API_HOST=0.0.0.0                          # Listen on all interfaces
API_PORT=8000                             # Or set PORT for Railway
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**How to get a Telegram Bot Token:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. BotFather gives you a token like `1234567890:ABCdefGhIjKlMnOpQrStUvWxYz`

**How to get an Anthropic API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add billing
3. Go to API Keys and create one

---

## Key Design Decisions

### Why SQLite instead of Postgres?

SQLite is a **file-based database** — the entire database is one `.db` file. No separate server process, no connection management, no setup. For a 2-3 user household app, it handles everything perfectly. We'd switch to Postgres when:
- We need multiple servers writing to the same database
- We need advanced features like full-text search or JSON operators
- We need managed backups and replication

### Why not use Supabase/Firebase from the start?

Keeping the database local (SQLite file) means:
- Zero external dependencies (works offline, no third-party accounts needed)
- No latency for database queries (it's reading a local file)
- Complete data ownership (your data never leaves your server)
- Simpler debugging (you can open the .db file with any SQLite tool)

### Why store the AI's raw response?

The `ai_raw_response` column in the meals table stores Claude's complete response. This lets us:
- Debug incorrect estimates later
- Re-process meals if we improve the analysis prompt
- Understand why specific estimates were made

### Why polling instead of webhooks for the Telegram bot?

Webhooks require a publicly accessible HTTPS URL, which means you need a domain and SSL certificate before the bot works. Polling works immediately, anywhere — even from your laptop behind a NAT. The small latency tradeoff (a few seconds) doesn't matter for a food tracking bot.

### Why Tailwind CSS?

Traditional CSS requires naming every class and managing separate stylesheet files. Tailwind lets you style directly in the component:

```html
<!-- Traditional CSS: separate file needed -->
<div class="card-header">...</div>

<!-- Tailwind: style inline, no separate file -->
<div class="bg-surface-container p-6 rounded-xl">...</div>
```

For a small team building rapidly, Tailwind is faster because you never leave the component file. The tradeoff is longer class strings, but the components are small enough that readability isn't an issue.

### Why no authentication?

This is a trust-based household app. Adding login/passwords would mean:
- Everyone needs to remember a password
- Session management and token refresh logic
- Password reset flows
- 10x more code for zero benefit in a trusted environment

The `X-User-ID` header approach is intentionally simple. If this app ever served untrusted users, we'd add proper auth.

### Why the over-target red indicators?

Nutrition tracking isn't just about eating enough — eating too much of certain nutrients matters too:
- **Calories over target** → weight gain
- **Sodium over 2300mg** → FDA recommended limit, health risk
- **Carbs/fat over target** → may indicate unbalanced diet

The red color and percentage overflow (e.g., "127%") give immediate visual feedback without being preachy about it.
