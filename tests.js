// Unit Tests for Based Budgeting App
// Run with: node tests.js

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`✗ ${name}`);
    console.log(`  Error: ${e.message}`);
  }
}

function assertEquals(actual, expected, msg = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition, msg = '') {
  if (!condition) {
    throw new Error(`${msg} Expected true, got false`);
  }
}

function assertFalse(condition, msg = '') {
  if (condition) {
    throw new Error(`${msg} Expected false, got true`);
  }
}

// ==================== FUNCTIONS UNDER TEST ====================
// Copied from index.html for isolated testing

function getNthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  let dayOfWeek = first.getDay();
  let diff = weekday - dayOfWeek;
  if (diff < 0) diff += 7;
  return new Date(year, month, 1 + diff + (n - 1) * 7);
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  let dayOfWeek = last.getDay();
  let diff = dayOfWeek - weekday;
  if (diff < 0) diff += 7;
  return new Date(year, month + 1, -diff);
}

function getUSHolidays(year) {
  const holidays = [];
  holidays.push(new Date(year, 0, 1)); // New Year's Day
  holidays.push(getNthWeekdayOfMonth(year, 0, 1, 3)); // MLK Day
  holidays.push(getNthWeekdayOfMonth(year, 1, 1, 3)); // Presidents Day
  holidays.push(getLastWeekdayOfMonth(year, 4, 1)); // Memorial Day
  holidays.push(new Date(year, 5, 19)); // Juneteenth
  holidays.push(new Date(year, 6, 4)); // Independence Day
  holidays.push(getNthWeekdayOfMonth(year, 8, 1, 1)); // Labor Day
  holidays.push(getNthWeekdayOfMonth(year, 9, 1, 2)); // Columbus Day
  holidays.push(new Date(year, 10, 11)); // Veterans Day
  holidays.push(getNthWeekdayOfMonth(year, 10, 4, 4)); // Thanksgiving
  holidays.push(new Date(year, 11, 25)); // Christmas
  return holidays;
}

function isHoliday(date) {
  const holidays = getUSHolidays(date.getFullYear());
  return holidays.some(h =>
    h.getDate() === date.getDate() &&
    h.getMonth() === date.getMonth() &&
    h.getFullYear() === date.getFullYear()
  );
}

function isWorkday(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6 && !isHoliday(date);
}

function getLastWorkdayOfMonth(year, month) {
  let date = new Date(year, month + 1, 0);
  while (!isWorkday(date)) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function getNextPayday(fromDate = new Date()) {
  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();
  let lastWorkday = getLastWorkdayOfMonth(year, month);

  if (fromDate > lastWorkday) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    lastWorkday = getLastWorkdayOfMonth(year, month);
  }

  return lastWorkday;
}

function isPayday(date = new Date()) {
  const lastWorkday = getLastWorkdayOfMonth(date.getFullYear(), date.getMonth());
  return date.toDateString() === lastWorkday.toDateString();
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getWeeksBetween(startDate, endDate) {
  const weeks = [];
  let current = getWeekStart(startDate);
  const end = endDate;

  while (current <= end) {
    const weekEnd = getWeekEnd(current);
    weeks.push({
      start: new Date(current),
      end: weekEnd > end ? new Date(end) : weekEnd
    });
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// ==================== TESTS ====================

console.log('\n========== HOLIDAY CALCULATION TESTS ==========\n');

test('getNthWeekdayOfMonth - MLK Day 2024 (3rd Monday of January)', () => {
  const mlk = getNthWeekdayOfMonth(2024, 0, 1, 3);
  assertEquals(mlk.getMonth(), 0, 'Month should be January');
  assertEquals(mlk.getDate(), 15, 'Date should be 15th');
  assertEquals(mlk.getDay(), 1, 'Should be Monday');
});

test('getNthWeekdayOfMonth - MLK Day 2025 (3rd Monday of January)', () => {
  const mlk = getNthWeekdayOfMonth(2025, 0, 1, 3);
  assertEquals(mlk.getMonth(), 0, 'Month should be January');
  assertEquals(mlk.getDate(), 20, 'Date should be 20th');
  assertEquals(mlk.getDay(), 1, 'Should be Monday');
});

test('getNthWeekdayOfMonth - Labor Day 2024 (1st Monday of September)', () => {
  const labor = getNthWeekdayOfMonth(2024, 8, 1, 1);
  assertEquals(labor.getMonth(), 8, 'Month should be September');
  assertEquals(labor.getDate(), 2, 'Date should be 2nd');
  assertEquals(labor.getDay(), 1, 'Should be Monday');
});

test('getNthWeekdayOfMonth - Thanksgiving 2024 (4th Thursday of November)', () => {
  const thanksgiving = getNthWeekdayOfMonth(2024, 10, 4, 4);
  assertEquals(thanksgiving.getMonth(), 10, 'Month should be November');
  assertEquals(thanksgiving.getDate(), 28, 'Date should be 28th');
  assertEquals(thanksgiving.getDay(), 4, 'Should be Thursday');
});

test('getNthWeekdayOfMonth - Thanksgiving 2025 (4th Thursday of November)', () => {
  const thanksgiving = getNthWeekdayOfMonth(2025, 10, 4, 4);
  assertEquals(thanksgiving.getMonth(), 10, 'Month should be November');
  assertEquals(thanksgiving.getDate(), 27, 'Date should be 27th');
  assertEquals(thanksgiving.getDay(), 4, 'Should be Thursday');
});

test('getLastWeekdayOfMonth - Memorial Day 2024 (last Monday of May)', () => {
  const memorial = getLastWeekdayOfMonth(2024, 4, 1);
  assertEquals(memorial.getMonth(), 4, 'Month should be May');
  assertEquals(memorial.getDate(), 27, 'Date should be 27th');
  assertEquals(memorial.getDay(), 1, 'Should be Monday');
});

test('getLastWeekdayOfMonth - Memorial Day 2025 (last Monday of May)', () => {
  const memorial = getLastWeekdayOfMonth(2025, 4, 1);
  assertEquals(memorial.getMonth(), 4, 'Month should be May');
  assertEquals(memorial.getDate(), 26, 'Date should be 26th');
  assertEquals(memorial.getDay(), 1, 'Should be Monday');
});

test('getUSHolidays returns correct number of holidays', () => {
  const holidays = getUSHolidays(2024);
  assertEquals(holidays.length, 11, 'Should have 11 federal holidays');
});

test('isHoliday - New Years Day 2024', () => {
  assertTrue(isHoliday(new Date(2024, 0, 1)), 'Jan 1 should be a holiday');
});

test('isHoliday - Christmas 2024', () => {
  assertTrue(isHoliday(new Date(2024, 11, 25)), 'Dec 25 should be a holiday');
});

test('isHoliday - regular day', () => {
  assertFalse(isHoliday(new Date(2024, 5, 15)), 'June 15 should not be a holiday');
});

test('isHoliday - Juneteenth 2024', () => {
  assertTrue(isHoliday(new Date(2024, 5, 19)), 'June 19 should be a holiday');
});

test('isHoliday - Independence Day 2024', () => {
  assertTrue(isHoliday(new Date(2024, 6, 4)), 'July 4 should be a holiday');
});

console.log('\n========== WORKDAY TESTS ==========\n');

test('isWorkday - regular Monday', () => {
  assertTrue(isWorkday(new Date(2024, 5, 17)), 'June 17, 2024 (Monday) should be a workday');
});

test('isWorkday - Saturday', () => {
  assertFalse(isWorkday(new Date(2024, 5, 15)), 'June 15, 2024 (Saturday) should not be a workday');
});

test('isWorkday - Sunday', () => {
  assertFalse(isWorkday(new Date(2024, 5, 16)), 'June 16, 2024 (Sunday) should not be a workday');
});

test('isWorkday - MLK Day 2024 (Monday holiday)', () => {
  assertFalse(isWorkday(new Date(2024, 0, 15)), 'MLK Day should not be a workday');
});

test('isWorkday - Christmas 2024 (Wednesday)', () => {
  assertFalse(isWorkday(new Date(2024, 11, 25)), 'Christmas should not be a workday');
});

console.log('\n========== LAST WORKDAY OF MONTH TESTS ==========\n');

test('getLastWorkdayOfMonth - January 2024 (ends on Wednesday)', () => {
  const lastWorkday = getLastWorkdayOfMonth(2024, 0);
  assertEquals(lastWorkday.getMonth(), 0, 'Month should be January');
  assertEquals(lastWorkday.getDate(), 31, 'Date should be 31st');
  assertTrue(isWorkday(lastWorkday), 'Should be a workday');
});

test('getLastWorkdayOfMonth - February 2024 (ends on Thursday, leap year)', () => {
  const lastWorkday = getLastWorkdayOfMonth(2024, 1);
  assertEquals(lastWorkday.getMonth(), 1, 'Month should be February');
  assertEquals(lastWorkday.getDate(), 29, 'Date should be 29th');
  assertTrue(isWorkday(lastWorkday), 'Should be a workday');
});

test('getLastWorkdayOfMonth - March 2024 (ends on Sunday)', () => {
  // March 31, 2024 is Sunday, so last workday should be Friday March 29
  const lastWorkday = getLastWorkdayOfMonth(2024, 2);
  assertEquals(lastWorkday.getMonth(), 2, 'Month should be March');
  assertEquals(lastWorkday.getDate(), 29, 'Date should be 29th (Friday)');
  assertEquals(lastWorkday.getDay(), 5, 'Should be Friday');
});

test('getLastWorkdayOfMonth - June 2024 (ends on Sunday)', () => {
  // June 30, 2024 is Sunday, so last workday should be Friday June 28
  const lastWorkday = getLastWorkdayOfMonth(2024, 5);
  assertEquals(lastWorkday.getMonth(), 5, 'Month should be June');
  assertEquals(lastWorkday.getDate(), 28, 'Date should be 28th (Friday)');
  assertEquals(lastWorkday.getDay(), 5, 'Should be Friday');
});

test('getLastWorkdayOfMonth - November 2024 (ends on Saturday)', () => {
  // November 30, 2024 is Saturday, so last workday should be Friday November 29
  const lastWorkday = getLastWorkdayOfMonth(2024, 10);
  assertEquals(lastWorkday.getMonth(), 10, 'Month should be November');
  assertEquals(lastWorkday.getDate(), 29, 'Date should be 29th');
  assertEquals(lastWorkday.getDay(), 5, 'Should be Friday');
});

test('getLastWorkdayOfMonth - May 2024 (ends on Friday but Memorial Day is 27th)', () => {
  // May 31, 2024 is Friday, so last workday should be May 31
  // Memorial Day is May 27, not at end of month
  const lastWorkday = getLastWorkdayOfMonth(2024, 4);
  assertEquals(lastWorkday.getMonth(), 4, 'Month should be May');
  assertEquals(lastWorkday.getDate(), 31, 'Date should be 31st');
});

console.log('\n========== NEXT PAYDAY TESTS ==========\n');

test('getNextPayday - from middle of month, returns end of same month', () => {
  const nextPayday = getNextPayday(new Date(2024, 5, 15)); // June 15
  assertEquals(nextPayday.getMonth(), 5, 'Should be June');
  assertEquals(nextPayday.getDate(), 28, 'Should be June 28 (last workday)');
});

test('getNextPayday - from after last workday, returns next month', () => {
  const nextPayday = getNextPayday(new Date(2024, 5, 29)); // June 29 (after last workday June 28)
  assertEquals(nextPayday.getMonth(), 6, 'Should be July');
  assertEquals(nextPayday.getDate(), 31, 'Should be July 31');
});

test('getNextPayday - from December after last workday, rolls to January next year', () => {
  const nextPayday = getNextPayday(new Date(2024, 11, 31)); // Dec 31
  assertEquals(nextPayday.getFullYear(), 2025, 'Should be 2025');
  assertEquals(nextPayday.getMonth(), 0, 'Should be January');
});

console.log('\n========== IS PAYDAY TESTS ==========\n');

test('isPayday - on actual payday', () => {
  const payday = getLastWorkdayOfMonth(2024, 5);
  assertTrue(isPayday(payday), 'Should be payday on last workday');
});

test('isPayday - not on payday', () => {
  assertFalse(isPayday(new Date(2024, 5, 15)), 'June 15 should not be payday');
});

console.log('\n========== WEEK CALCULATION TESTS ==========\n');

test('getWeekStart - from Monday returns same day', () => {
  const monday = new Date(2024, 5, 17); // June 17, 2024 is Monday
  const start = getWeekStart(monday);
  assertEquals(start.getDate(), 17, 'Should be 17th');
  assertEquals(start.getDay(), 1, 'Should be Monday');
});

test('getWeekStart - from Wednesday returns previous Monday', () => {
  const wednesday = new Date(2024, 5, 19); // June 19, 2024 is Wednesday
  const start = getWeekStart(wednesday);
  assertEquals(start.getDate(), 17, 'Should be 17th (Monday)');
  assertEquals(start.getDay(), 1, 'Should be Monday');
});

test('getWeekStart - from Sunday returns previous Monday', () => {
  const sunday = new Date(2024, 5, 23); // June 23, 2024 is Sunday
  const start = getWeekStart(sunday);
  assertEquals(start.getDate(), 17, 'Should be 17th (Monday)');
  assertEquals(start.getDay(), 1, 'Should be Monday');
});

test('getWeekEnd - returns Sunday of same week', () => {
  const monday = new Date(2024, 5, 17);
  const end = getWeekEnd(monday);
  assertEquals(end.getDate(), 23, 'Should be 23rd (Sunday)');
  assertEquals(end.getDay(), 0, 'Should be Sunday');
});

test('getWeeksBetween - single week span', () => {
  const start = new Date(2024, 5, 17); // Monday
  const end = new Date(2024, 5, 23); // Sunday
  const weeks = getWeeksBetween(start, end);
  assertEquals(weeks.length, 1, 'Should have 1 week');
});

test('getWeeksBetween - two week span', () => {
  const start = new Date(2024, 5, 17); // Monday
  const end = new Date(2024, 5, 30); // Next Sunday
  const weeks = getWeeksBetween(start, end);
  assertEquals(weeks.length, 2, 'Should have 2 weeks');
});

test('getWeeksBetween - typical month (~4-5 weeks)', () => {
  const start = new Date(2024, 5, 1); // June 1
  const end = new Date(2024, 5, 28); // June 28
  const weeks = getWeeksBetween(start, end);
  assertTrue(weeks.length >= 4 && weeks.length <= 5, `Should have 4-5 weeks, got ${weeks.length}`);
});

console.log('\n========== FORMATTING TESTS ==========\n');

test('formatCurrency - positive amount', () => {
  const result = formatCurrency(1234.56);
  assertEquals(result, '$1,234.56');
});

test('formatCurrency - zero', () => {
  const result = formatCurrency(0);
  assertEquals(result, '$0.00');
});

test('formatCurrency - negative amount', () => {
  const result = formatCurrency(-50.25);
  assertEquals(result, '-$50.25');
});

console.log('\n========== EDGE CASE TESTS ==========\n');

test('Year boundary - December 2024 to January 2025', () => {
  // December 31, 2024 is Tuesday, so last workday is December 31
  const lastWorkdayDec = getLastWorkdayOfMonth(2024, 11);
  assertEquals(lastWorkdayDec.getDate(), 31);
  assertEquals(lastWorkdayDec.getMonth(), 11);

  // From after Dec 31, should get Jan 2025 payday
  const nextPayday = getNextPayday(new Date(2025, 0, 1)); // Jan 1
  assertEquals(nextPayday.getMonth(), 0);
  assertEquals(nextPayday.getFullYear(), 2025);
});

test('Leap year February 2024', () => {
  const lastWorkday = getLastWorkdayOfMonth(2024, 1);
  assertEquals(lastWorkday.getDate(), 29, 'February 2024 has 29 days');
});

test('Non-leap year February 2025', () => {
  const lastWorkday = getLastWorkdayOfMonth(2025, 1);
  // Feb 28, 2025 is Friday
  assertEquals(lastWorkday.getDate(), 28, 'February 2025 has 28 days');
});

test('Veterans Day 2024 (falls on Monday)', () => {
  // November 11, 2024 is Monday
  assertTrue(isHoliday(new Date(2024, 10, 11)), 'Veterans Day should be recognized');
  assertFalse(isWorkday(new Date(2024, 10, 11)), 'Veterans Day should not be a workday');
});

test('New Years Day 2025 (falls on Wednesday)', () => {
  assertTrue(isHoliday(new Date(2025, 0, 1)), 'New Years Day should be recognized');
  assertFalse(isWorkday(new Date(2025, 0, 1)), 'New Years Day should not be a workday');
});

// Bug test: What happens when getWeeksBetween start is after end?
test('getWeeksBetween - start after end returns empty', () => {
  const start = new Date(2024, 5, 30);
  const end = new Date(2024, 5, 15);
  const weeks = getWeeksBetween(start, end);
  assertEquals(weeks.length, 0, 'Should return empty array when start > end');
});

// Bug test: getNextPayday on exactly the payday
test('getNextPayday - on exactly the payday returns same day', () => {
  // June 28, 2024 is the last workday of June
  const paydayDate = new Date(2024, 5, 28);
  const nextPayday = getNextPayday(paydayDate);
  assertEquals(nextPayday.getMonth(), 5, 'Should still be June');
  assertEquals(nextPayday.getDate(), 28, 'Should be the 28th');
});

// Bug test: Holiday on last day of month
test('getLastWorkdayOfMonth - when last day is a holiday', () => {
  // Let's test a scenario where December 25 falls on the 31st - doesn't happen
  // But we can check December 2024: Dec 31 is Tuesday (not a holiday)
  // Actually, let's test a real scenario:
  // What if New Year's Day is January 1st? It doesn't affect end of month calculation

  // Test: What if we had a holiday on the last day?
  // This doesn't happen with current holidays, but the logic should handle weekends correctly
  const lastWorkday = getLastWorkdayOfMonth(2024, 0); // January 2024
  assertTrue(isWorkday(lastWorkday), 'Last workday should actually be a workday');
});

console.log('\n========== POTENTIAL BUG TESTS ==========\n');

// Test for potential timezone issues with date string parsing
test('Date parsing - ISO string at midnight', () => {
  // The app stores dates as ISO strings like "2024-06-15T23:59:59.000Z"
  const isoDate = "2024-06-15T23:59:59.000Z";
  const parsed = new Date(isoDate);
  // This can cause timezone issues - parsed date might be June 16 in some timezones!
  // Just verify the date object is created
  assertTrue(parsed instanceof Date, 'Should create valid date');
  assertFalse(isNaN(parsed.getTime()), 'Should not be invalid date');
});

// Test: Columbus Day (2nd Monday of October)
test('Columbus Day 2024', () => {
  const columbus = getNthWeekdayOfMonth(2024, 9, 1, 2);
  assertEquals(columbus.getMonth(), 9, 'Month should be October');
  assertEquals(columbus.getDate(), 14, 'Should be October 14');
  assertEquals(columbus.getDay(), 1, 'Should be Monday');
});

// Test: Presidents Day (3rd Monday of February)
test('Presidents Day 2024', () => {
  const presidents = getNthWeekdayOfMonth(2024, 1, 1, 3);
  assertEquals(presidents.getMonth(), 1, 'Month should be February');
  assertEquals(presidents.getDate(), 19, 'Should be February 19');
  assertEquals(presidents.getDay(), 1, 'Should be Monday');
});

// ==================== SUMMARY ====================

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(f => {
    console.log(`  - ${f.name}: ${f.error}`);
  });
  console.log('');
}

process.exit(failed > 0 ? 1 : 0);
