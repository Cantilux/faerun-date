# 📅 faerun-date

Convert real-world dates into the **Forgotten Realms** (Faerûn) calendar format.  
Inspired by Dungeons & Dragons and the Harptos calendar.

faerun-date is a JavaScript library that transforms standard dates into the calendar system of Faerûn, the world of the Forgotten Realms (Dungeons & Dragons). It includes accurate mapping of months, 10-day weeks, seasonal cycles, and unique Faerûnian holidays like Greengrass and Midsummer.

> Perfect for RPG tools, worldbuilding projects, and immersive D&D experiences.

---

## ✨ Features

- 📅 Converts real-world dates to Faerûn calendar dates
- 🗓️ Supports Faerûn-specific months and festivals
- 🌱 Includes seasonal calculation (Spring, Summer, Autumn, Winter)
- 📆 Week number support: calculates the week of the year (1–53)
- 🕊️ Leap years (with Shieldmeet) fully supported

---

## 📦 Installation

### With npm

```bash
npm install faerun-date
```

### With bun

```bash
bun add faerun-date
```

## 🧙 Usage

```js
import { FaerunDate } from 'faerun-date';

const date = new Date(1492, 4, 5); // 5 Mirtul 1492 DR (month is 0-based)
const faeDate = new FaerunDate(date);

console.log(faeDate.toLocaleString());
// "Godsday, 5 Mirtul 1492 DR – Season: Spring – Week 19"

console.log(faeDate.getWeekOfYear());
// 19
```

## 📚 API

### `new FaerunDate(date)`

Creates a new Faerûn date from a real-world `Date` object or a structured object with `day`, `month`, and `year`.

---

### `toLocaleString()`

Returns a human-readable string representing the Faerûn date.

**Example:**

```text
Godsday, 5 Mirtul 1492 DR – Season: Spring – Week 19
```

---

### `getWeekday()`

Returns the name of the day of the week  
(e.g. `Godsday`, `Earthday`, `Kythorn`, etc.)

---

### `getMonth()`

Returns the name of the month

---

### `getSeason()`

Returns the current season:  
`Winter`, `Spring`, `Summer`, or `Autumn`.

---

### `getFaerunYear()`

Returns the current year in Dale Reckoning (DR).

---

### `getFestival()`

Returns the name of the festival (e.g. `Greengrass`, `Midwinter`)  
if the date matches one. Returns `null` otherwise.

---

### `getWeekOfYear()`

Returns the week number in the Faerûn calendar year.

- Week 1 starts on 1 Hammer
- Festivals are included in the day/week count
- Leap years (with *Shieldmeet*) are supported

## 🧰 CLI Tool: Compare Weeks

This package includes a CLI tool to compare **Gregorian calendar weeks** with **Faerûn tendays**.

Useful for Dungeon Masters who want to align real-world weeks with in-game Faerûn time.

### 🔧 Usage

After installing the package (or using `bun link` / `npm link`):

```bash
npx faerun-compare-weeks
# or with custom options:
npx faerun-compare-weeks --year 1489 --weeks 30
```

You can also run it directly if you're developing locally:

```bash
bun run bin/compare-weeks.js --year 1491 --weeks 15
```

### 🧩 Options

- `--year <YYYY>` – The Gregorian year to compare (default: current year)
- `--weeks <N>` – Number of Gregorian weeks to display (default: 20)

### 📋 Output Example

```text
Gregorian Week → Faerûn Tenday Correspondence for year 1489
Week 01 → Tenday 01 (Mon Jan 01 1489)
Week 02 → Tenday 02 (Mon Jan 08 1489)
Week 03 → Tenday 03 (Mon Jan 15 1489)
...
Week 15 → Tenday 10 (Mon Apr 07 1489)
```

🧙 Ideal for planning weekly D&D sessions, synchronizing downtime, or tracking Faerûn time progression alongside real-world calendars.

## 📜 License

Released under the [MIT License](./LICENSE).  
© 2025 Cantilux
