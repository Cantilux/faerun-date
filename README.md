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

## Installation

```bash
npm install faerun-date
```

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
// "22 Tarsakh 1498 DR"
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
