# faerun-date
[![Release](https://github.com/Cantilux/faerun-date/actions/workflows/release.yml/badge.svg)](https://github.com/Cantilux/faerun-date/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/faerun-date.svg)](https://www.npmjs.com/package/faerun-date)
[![GitHub Package](https://img.shields.io/badge/GitHub%20Packages-@cantilux%2Ffaerun--date-24292e)](https://github.com/Cantilux/faerun-date/pkgs/npm/faerun-date)

Canonical JavaScript utilities for the **Calendar of Harptos**, the calendar used across most of Faerun in the Forgotten Realms.

This package models Harptos as:

- 12 months of 30 days
- 5 intercalary festivals: `Midwinter`, `Greengrass`, `Midsummer`, `Highharvestide`, `Feast of the Moon`
- `Shieldmeet` after `Midsummer` every four years
- 3 tendays per month

Unlike the previous implementation, festivals are treated as standalone days between months, not as regular month dates.

The core calendar metadata now lives in a dedicated module, and the public API exposes more Date-like helpers for moving around the Harptos calendar.

## Installation

```bash
npm install faerun-date
```

This refactor makes the package ESM-only. CommonJS `require()` is no longer supported on this branch and should be treated as a breaking change for the next release.

## Usage

```js
import { HarptosDate, fromGregorian, fromHarptos } from "faerun-date";

const gregorian = fromGregorian(new Date(2025, 1, 1), { drYear: 1497 });
console.log(gregorian.toString());
// "1 Alturiak 1497 DR"

const festival = fromGregorian(new Date(2025, 0, 31), { drYear: 1497 });
console.log(festival.toString());
// "Midwinter 1497 DR"

const harptos = fromHarptos({ year: 1496, festival: "Shieldmeet" });
console.log(harptos.toLocaleString());
// "Shieldmeet 1496 DR - Summer festival"

const direct = new HarptosDate({ year: 1492, month: "Mirtul", day: 5 });
console.log(direct.toLocaleString());
// "5 Mirtul 1492 DR - Spring - Tenday 13, Day 5"

const ordinal = new HarptosDate("2026-04-24", { drYear: 1498 });
console.log(ordinal.toString());
// "23 Tarsakh 1498 DR"
```

## API

### `new HarptosDate(input, options?)`

Accepts either:

- a Gregorian `Date`
- a Gregorian date string such as `2026-04-24`
- a Harptos object such as `{ year, month, day }`
- a Harptos festival object such as `{ year, festival: "Greengrass" }`
- a Harptos ordinal object such as `{ year, dayOfYear: 122 }`

`options`:

- `drYear`: explicit Harptos year to use when converting from Gregorian
- `faerunYear`: legacy alias for `drYear`
- `yearOffset`: offset added to the Gregorian year when `drYear` is omitted

### `HarptosDate.fromGregorian(input, options?)`

Converts a Gregorian date to the equivalent ordinal day in Harptos for that year length.

### `HarptosDate.fromHarptos(input, options?)`

Creates a canonical Harptos date from month/day, festival, or `dayOfYear`.

### `isFestival()`

Returns `true` when the date is one of the intercalary festivals.

### `getFestival()`

Returns the festival name or `null`.

### `getMonth()`

Returns the Harptos month name or `null` for festivals.

### `getDay()`

Returns the day of the month or `null` for festivals.

### `getDate()`

Date-style alias of `getDay()`.

### `getMonthIndex()`

Returns the zero-based month index or `null` for festivals.

### `getDayOfYear()`

Returns the ordinal day in the Harptos year, including festivals.

### `getTenday()`

Returns the tenday number for month dates. Festivals return `null` because they are outside the tenday structure.

### `getDayOfTenday()`

Returns the day number within the current tenday for month dates. Festivals return `null`.

### `getWeekOfYear()`

Legacy alias of `getTenday()`.

### `getWeekday()`

Legacy helper that returns a descriptive label such as `5th day of the tenday`. Harptos does not assign formal weekday names to individual days.

### `getSeason()`

Returns `Winter`, `Spring`, `Summer`, or `Autumn`.

### `addDays(amount)`

Returns a new `HarptosDate` shifted by the given number of days. This operation requires a Harptos year.

### `addTendays(amount)`

Returns a new `HarptosDate` shifted by `amount * 10` days.

### `addMonths(amount)`

Returns a new `HarptosDate` shifted by calendar months while preserving the day-of-month. This is only supported for month dates, not festivals.

### `addYears(amount)`

Returns a new `HarptosDate` shifted by Harptos years. `Shieldmeet` throws when the target year is not leap.

### `toFaerunParts()`

Returns normalized calendar parts, including `year`, `monthIndex`, `dayOfYear`, `tenday`, and festival metadata.

### `HarptosDate.fromFaerunParts(input, options?)`

Alias of `fromHarptos`, useful when working with normalized parts objects.

### `HarptosDate.compare(a, b)`

Compares two Harptos dates by year and ordinal day.

### `toString()`

Canonical string form:

- month date: `5 Mirtul 1492 DR`
- festival: `Shieldmeet 1496 DR`

### `toLocaleString()`

Extended display form:

- month date: `5 Mirtul 1492 DR - Spring - Tenday 13, Day 5`
- festival: `Shieldmeet 1496 DR - Summer festival`

### `toObject()`

Returns a plain object with the canonical normalized fields.

## CLI

The package ships with a small CLI:

```bash
npx faerun-compare-weeks --year 2025 --weeks 12 --dr-year 1497
```

Options:

- `--year <YYYY>`: Gregorian year to inspect
- `--weeks <N>`: number of Gregorian weeks to print
- `--dr-year <YYYY>`: Harptos year label to print

## Development

```bash
npm test
```

## License

[MIT](./LICENSE)
