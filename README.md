# Based Budgeting

A minimalist, offline-first Progressive Web App (PWA) for personal budgeting that automatically redistributes your remaining budget across weeks.

## Overview

Based Budgeting takes a unique approach to monthly budgeting: instead of setting a fixed weekly budget, it **dynamically adjusts** your weekly spending allowance based on what you've already spent. Underspend one week? That money rolls forward to future weeks. Overspend? Your remaining weeks adjust accordingly.

The app is designed around getting paid on the **last workday of each month** and automatically accounts for US federal holidays when calculating paydays.

## Features

- **Smart Weekly Budgets** - Automatically redistributes remaining money across future weeks
- **Payday Detection** - Detects payday (last workday of month, accounting for holidays) and triggers setup flow
- **Savings Categories** - Allocate percentages of each paycheck to different savings goals
- **Monthly Payment Tracking** - Track bills, subscriptions, and loan payments with paid/unpaid status
- **Loan Balance Tracking** - Monitor loan balances with automatic deduction when linked payments are made
- **Expense Categorization** - Log expenses by category with weekly breakdowns
- **Savings Purchases** - Buy items from savings without affecting your weekly budget
- **Extra Income** - Add windfall income that increases your spendable budget
- **Emergency Buffer** - Keep a configurable reserve amount untouched
- **PDF Export** - Generate comprehensive budget reports
- **Dark/Light Theme** - Toggle between themes with persistence
- **Offline Support** - Full functionality without internet via Service Worker
- **Installable PWA** - Install on mobile or desktop like a native app

## How It Works

### The Budget Cycle

1. **Payday Setup**: On the last workday of each month, enter your paycheck amount and current checking balance
2. **Automatic Savings**: Configured percentages are automatically added to your savings categories
3. **Weekly Division**: Your spendable amount (checking - unpaid bills - buffer) is divided across weeks until next payday
4. **Dynamic Redistribution**: As you spend, remaining money is redistributed equally among remaining weeks
5. **Repeat**: On next payday, the cycle resets

### Budget Calculation

```
Spendable = Checking Balance - Unpaid Bills - Emergency Buffer + Extra Income

Weekly Budget (current & future weeks) = Remaining Spendable / Remaining Weeks
```

Past weeks retain their original budget allocation for historical accuracy, while current and future weeks share the remaining funds equally.

### Week Structure

- Weeks run **Monday through Sunday**
- The budget period spans from payday to the day before next payday
- Partial weeks at the start/end of the period are handled correctly

## Tech Stack

- **Zero Dependencies** - Pure vanilla JavaScript, HTML5, and CSS3
- **Single File Architecture** - Entire app in one HTML file (~2,500 lines)
- **LocalStorage** - All data persisted locally in the browser
- **Service Worker** - Offline caching for PWA functionality
- **jsPDF** - PDF generation (loaded from CDN)

### Why No Framework?

This app deliberately avoids React, Vue, or other frameworks to:
- Minimize bundle size and load time
- Eliminate build steps and dependencies
- Ensure long-term maintainability
- Demonstrate that complex apps don't require complex tooling

## Installation

### Use Online
Simply open `index.html` in a browser or host it on any static file server.

### Install as PWA
1. Open the app in Chrome, Edge, or Safari
2. Click "Install" or "Add to Home Screen" when prompted
3. The app will work offline and appear in your app drawer

### Self-Host
```bash
# Clone the repository
git clone https://github.com/Enrichment2/based-budgeting.git
cd based-budgeting

# Serve with any static server
python -m http.server 8000
# or
npx serve .
```

## Project Structure

```
based-budgeting/
├── index.html      # Main application (HTML + CSS + JavaScript)
├── manifest.json   # PWA manifest for installability
├── sw.js           # Service Worker for offline support
├── icon-192.png    # App icon (192x192)
├── icon-512.png    # App icon (512x512)
├── tests.html      # Browser-based unit tests
├── tests.js        # Node.js unit tests
└── README.md       # This file
```

## App Views

### Dashboard
- Current week's remaining budget with progress bar
- Monthly overview (checking, unpaid bills, buffer, spendable)
- Monthly payment toggles (mark as paid/unpaid)
- Loan balances summary
- Quick add expense/income buttons

### Expenses
- Weekly breakdown with budget vs. spent
- Expense list grouped by week
- Extra income tracking
- "Buy from Savings" option

### Savings
- Category balances with percentage allocations
- Add funds to any category
- Withdraw for purchases (doesn't affect weekly budget)

### Settings
- Theme toggle (dark/light)
- Manage savings categories
- Manage monthly payments
- Manage expense categories
- Manage loans
- Adjust emergency buffer
- Export to PDF
- Reset all data

## Data Storage

All data is stored in `localStorage` under the key `basedBudgetV2`:

```javascript
{
  initialized: boolean,
  paycheck: number,
  checking: number,
  paycheckDate: string (ISO),
  nextPayday: string (ISO),
  savingsCategories: [{ name, percentage, balance }],
  monthlyPayments: [{ name, amount, paid, linkedLoan }],
  loans: [{ name, balance, linkedPayment }],
  expenses: [{ name, amount, category, date, fromSavings }],
  extraIncome: [{ name, amount, date }],
  expenseCategories: string[],
  emergencyBuffer: number,
  paydayHandled: boolean
}
```

## US Federal Holidays

The app recognizes these holidays when calculating the last workday:

- New Year's Day (January 1)
- Martin Luther King Jr. Day (3rd Monday of January)
- Presidents' Day (3rd Monday of February)
- Memorial Day (Last Monday of May)
- Juneteenth (June 19)
- Independence Day (July 4)
- Labor Day (1st Monday of September)
- Columbus Day (2nd Monday of October)
- Veterans Day (November 11)
- Thanksgiving (4th Thursday of November)
- Christmas Day (December 25)

## Running Tests

### Browser Tests
Open `tests.html` in any browser to run the unit test suite interactively.

### Node.js Tests
```bash
node tests.js
```

Tests cover:
- Holiday calculations
- Workday detection
- Last workday of month calculation
- Next payday calculation
- Week boundary calculations
- Currency formatting
- Edge cases (leap years, year boundaries, etc.)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Maintain the single-file architecture for the core app
- No external dependencies (except jsPDF for PDF export)
- Test holiday and date calculations thoroughly
- Ensure offline functionality works
- Support both dark and light themes

## License

GPLv3 License - You're free to use, modify, and distribute this code, but any derivative works must also be open-sourced under GPLv3. See the LICENSE file for full terms.

## Acknowledgments

- Built with vanilla JavaScript to prove frameworks aren't always necessary
- Inspired by envelope budgeting and zero-based budgeting principles
- Holiday calculations based on US federal holiday rules

---

**Note**: This app assumes a monthly pay cycle on the last workday. If you're paid bi-weekly or on different dates, you may need to manually adjust the next payday date during setup.
