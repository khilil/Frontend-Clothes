# k6 Load Tests — GenZ Clothes

## 📁 Folder Structure

```
tests/load/
├── config/
│   └── options.js          # Shared load profiles & thresholds
├── scenarios/
│   ├── products.load.js    # Products API (listing, detail, filter)
│   ├── auth.load.js        # Auth API (login, signup, invalid login)
│   └── cart.load.js        # Cart API (fetch, add, update, remove)
└── run-all.js              # Full suite (all scenarios together)
```

---

## ⚙️ Setup

### Step 1: Install k6

```bash
# Windows (via winget)
winget install k6

# OR download from https://k6.io/docs/getting-started/installation/
```

### Step 2: Start your servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
cd "../Cloths Backend/backend"
npm run dev
```

---

## 🚀 Run Tests

### Individual scenarios

```bash
# Products load test (medium load)
k6 run tests/load/scenarios/products.load.js

# Auth load test (light load)
k6 run tests/load/scenarios/auth.load.js

# Cart load test (medium load)
k6 run tests/load/scenarios/cart.load.js
```

### Full suite (all scenarios together)
```bash
k6 run tests/load/run-all.js
```

### With HTML report
```bash
k6 run --out json=tests/load/results.json tests/load/run-all.js
```

---

## 📊 Load Profiles

| Profile | Users | Duration |
|---|---|---|
| **Light** | 10 → 25 | ~1.5 min |
| **Medium** | 20 → 50 | ~4 min |
| **Stress** | 20 → 200 | ~5 min |

---

## ✅ Thresholds (Pass/Fail Criteria)

| Metric | Target |
|---|---|
| Response Time (p95) | < 500ms |
| Error Rate | < 1% |
| Auth Response (p95) | < 1000ms |

---

## 📝 Notes

- **Cart tests** require authentication. Set `SESSION_COOKIE` env variable with a valid login session cookie.
- Update `PRODUCT_SLUGS` in `products.load.js` with real product slugs from your database.
- Run against **local dev server** only — not production.
