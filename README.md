# Playwright Automation Skeleton

A reusable Playwright-based automation framework skeleton for QA teams. Use this as a starting point to build your own project-specific automation.

---

## Project Structure

```
├── Actions/
│   ├── ActionHelper.js      # Core action dispatcher (click, type, verify, etc.)
│   ├── HeaderMaker.js       # HTTP header builder for API tests
│   └── Hooks.js             # beforeEach/afterEach hooks (login, cleanup)
├── Data/
│   └── Download/            # Downloaded files during tests (auto-cleaned)
├── Helper/
│   └── Login.js             # Login helper (customize for your app)
├── pageObjects/
│   └── LoginObjects.js      # Login page locators (customize for your app)
├── tests/
│   └── smoketests.spec.js   # Example smoke test (login verification)
├── Utils/
│   ├── actions.js           # ActionTypes & AssertionType enums
│   ├── clearDirectory.mjs   # Pre-run cleanup utility
│   ├── DownloadHandler.js   # File download helper
│   ├── Mocker.js            # Random data generators (int, word, datetime)
│   ├── Screenshot.js        # Screenshot capture utility
│   ├── testData.js          # Shared test data store
│   └── WebActions.js        # Low-level Playwright wrappers (click, type, verify)
├── config.js                # Environment config (URLs, credentials via env vars)
├── playwright.config.js     # Playwright settings (reporters, retries, browser)
└── package.json
```

---

## Getting Started

### 1. Clone / Use Template

```bash
# If this is a GitHub template repo, click "Use this template" on GitHub
# Or clone directly:
git clone <repo-url> my-project-automation
cd my-project-automation
```

### 2. Install Dependencies

```bash
npm install
npx playwright install chromium --with-deps
```

### 3. Configure Your App

Edit `config.js` — set your app's URL and test credentials, or use environment variables:

```bash
# Option A: Environment variables
set BASE_URL=https://your-app.example.com
set TEST_USERNAME=your_user
set TEST_PASSWORD=your_password

# Option B: Create a .env file (already gitignored)
```

### 4. Update Login Flow

1. **`pageObjects/LoginObjects.js`** — Update locators to match your app's login page
2. **`Helper/Login.js`** — Adjust the login steps if your app's flow differs

### 5. Run Tests

```bash
npm run smoke:run        # Run smoke tests (clears artifacts first)
npm run regression:run   # Run regression tests
npm run test:all:run     # Run everything
```

---

## Adding Your Own Tests

### 1. Create Page Objects

Add locators for your pages in `pageObjects/`:

```javascript
// pageObjects/DashboardPageObjects.js
export const dashboardLocators = {
    header: "//h1[contains(text(), 'Dashboard')]",
    searchInput: "//input[@id='search']",
    resultsTable: "//table[@class='results']",
};
```

### 2. Create Helper Classes (optional)

Add reusable workflows in `Helper/`:

```javascript
// Helper/Dashboard.js
import ActionsHelper from "../Actions/ActionHelper.js";
import { ActionTypes } from "../Utils/actions.js";
import { dashboardLocators } from "../pageObjects/DashboardPageObjects.js";

export default class Dashboard {
  static async search(page, query) {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.SETTEXT, dashboardLocators.searchInput, query);
    await actionHelper.actionMethod(ActionTypes.PRESS, dashboardLocators.searchInput, "Enter");
  }
}
```

### 3. Create Test Files

Add tests in `tests/` using tags:

```javascript
// tests/dashboard.spec.js
import test from "../Actions/Hooks.js";
import "../Actions/Hooks.js";
import ActionsHelper from "../Actions/ActionHelper.js";
import { AssertionType } from "../Utils/actions.js";
import { dashboardLocators } from "../pageObjects/DashboardPageObjects.js";

test.describe("Dashboard Tests", { tag: ["@smoke"] }, () => {
  test("Verify dashboard loads after login", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(AssertionType.DISPLAYED, dashboardLocators.header);
  });
});
```

---

## Available Actions & Assertions

### Action Types

| Action | Description |
|--------|-------------|
| `CLICK` | Click an element |
| `SETTEXT` | Type text into an input |
| `PRESS` | Press a keyboard key |
| `SETDROPDOWN` | Select dropdown option by label |
| `SETDROPDOWNVIAVALUE` | Select dropdown option by value |
| `UPLOADFILE` | Upload a file |
| `HOVER` | Hover over an element |
| `CHECK` / `UNCHECK` | Toggle checkbox |
| `GETTEXT` | Get element text (returns value) |
| `NAVIGATETOURL` | Navigate to a URL |

### Assertion Types

| Assertion | Description |
|-----------|-------------|
| `DISPLAYED` | Element is visible |
| `NOTDISPLAYED` | Element is not visible |
| `EQUALCHECK` | Text equals expected value |
| `CONTAINTEXT` | Text contains expected value |
| `ENABLED` / `DISABLED` | Element enabled state |
| `CHECKED` | Checkbox is checked |

---

## Test Tags

Use tags to organize test suites:

- `@smoke` — Critical path tests, run on every build
- `@regression` — Full regression suite

---

## Tips

- **Hooks.js** handles login before each test automatically
- **Screenshots** are captured on failure (see `Screenshots/` folder)
- **Environment variables** override `config.js` defaults
- Keep page objects and tests in separate files for maintainability
- Use `Mocker` utility for random test data generation
