# 📅 faerun-date
[![Release](https://github.com/Cantilux/faerun-date/actions/workflows/release.yml/badge.svg)](https://github.com/Cantilux/faerun-date/actions/workflows/release.yml)

Convert real-world dates into the **Forgotten Realms** (Faerûn) calendar format.  
Inspired by Dungeons & Dragons and the Harptos calendar.

`faerun-date` is a JavaScript library that transforms standard dates into the calendar system of Faerûn.  
It includes months, 10-day weeks (tendays), seasonal cycles, and Faerûnian holidays like Greengrass and Midsummer.

> ⚠️ Note: This is a **simplified model** of the Harptos calendar. All months are fixed at 30 days, holidays are added to the count, and leap years are every 4 years (Shieldmeet). Day names are placeholders, not canonical.

---

## ✨ Features

- 📅 Converts real-world dates to Faerûn calendar dates
- 🗓️ Supports Faerûn-specific months and festivals
- 🌱 Seasonal calculation (Spring, Summer, Autumn, Winter)
- 📆 Week number support (Faerûn “tendays”)
- 🕊️ Leap years with *Shieldmeet* (every 4 years, simplified)

---

## 📦 Installation

```bash
npm install faerun-date
# or
bun add faerun-date
```

---

## 🧙 Usage

```js
import FaerunDate from 'faerun-date';

const date = new Date(1492, 4, 5); // 5 Mirtul 1492 (months are 0-based)
const faeDate = new FaerunDate(date, { faerunYear: 1492 });

console.log(faeDate.toLocaleString());
// Example: "Far, 05 Mirtul 1492 DR – Season: Spring – Week 19"

console.log(faeDate.getWeekOfYear());
// 19
```

---

## 📚 API

### `new FaerunDate(date, options?)`

Creates a new Faerûn date from a real-world `Date`.  
Options: `{ faerunYear?: number }`

---

### `toLocaleString()`
Returns a human-readable string:

```
Far, 05 Mirtul 1492 DR – Season: Spring – Week 19
```

---

### `getWeekday()`
Returns the name of the current day in the 10-day week cycle:  
`Sul`, `Far`, `Tar`, `Sar`, `Rai`, `Zor`, `Kyth`, `Hamar`, `Ith`, `Alt`.

> Note: These labels are **not canon**; they represent tendays.

---

### `getMonth()`
Returns the Faerûnian month name.

---

### `getSeason()`
Returns the season:  
`Winter`, `Spring`, `Summer`, or `Autumn`.

---

### `getFaerunYear()`
Returns the current year in Dale Reckoning (DR), if provided via options.  
Otherwise returns `null`.

---

### `getFestival()`
Returns the name of the festival (`Greengrass`, `Midwinter`, etc.)  
if the date matches one, otherwise `null`.

---

### `getWeekOfYear()`
Returns the week (tenday) number of the year.

---

### `getFaerunDateString()`
Returns a calendar-style string:  
- `[Festival] Greengrass` if the date is a festival  
- `05 Mirtul` otherwise

---

### `static isLeapYear(year)`
Returns `true` if divisible by 4.

---

### `static parse(dateString, options?)`
Constructs a `FaerunDate` from a date string.

---

### `static toString(faerunDate)`
Shortcut to `.toLocaleString()`.

---

## 🧰 CLI Tool: Compare Weeks

This package includes a CLI tool to compare **Gregorian weeks** with **Faerûn tendays**.

```bash
npx faerun-compare-weeks --year 1489 --weeks 10
```

Example output:

```
Gregorian Week → Faerûn Tenday Correspondence for year 1489
Week 01 → Tenday 01 (Mon Jan 01 1489)
Week 02 → Tenday 02 (Mon Jan 08 1489)
...
```

### Options
- `--year <YYYY>` – Starting Gregorian year (default: current)
- `--weeks <N>` – Number of weeks to display (default: 20)

> Note: Gregorian weeks in the CLI are calculated with a simplified formula (`new Date(year, 0, (week-1)*7+1)`); not ISO‑8601.

---

## ⚠️ Limitations

- All months are fixed at 30 days (simplification).  
- Leap years are every 4 years (Shieldmeet).  
- Day names are placeholders, not canon.  
- Faerûn year (DR) must be passed manually in `options`.  
- Some lore-specific details of Harptos are not modeled.

---

## 📜 License

Released under the [MIT License](./LICENSE).  
© 2025 Cantilux
