# 📅 faerun-date

Convert real-world dates into the **Forgotten Realms** (Faerûn) calendar format.  
Inspired by Dungeons & Dragons and the Harptos calendar.

> Perfect for RPG tools, worldbuilding projects, and immersive D&D experiences.

---

## ✨ Features

- Maps standard JavaScript `Date` objects to the Faerûn calendar
- Handles months, weekdays (10-day tendays), and seasons
- Recognizes special Faerûnian holidays (e.g. Greengrass, Midwinter)
- Supports leap years and parsing from date strings

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
import FaerunDate from 'faerun-date'

// Use current date without specifying a Faerûn year
const today = new FaerunDate()
console.log(today.toLocaleString())
// → "Far, 4 Alturiak – Season: Deepwinter"

// Use a specific real-world date and assign a Faerûn year
const greengrass = new FaerunDate(new Date(2025, 3, 1), { faerunYear: 1493 })
console.log(greengrass.toLocaleString())
// → "Sar, 1 Mirtul 1493 DR – Season: Spring"
```

## 📚 API

### `new FaerunDate(date?: Date, options?: { faerunYear?: number })`

Creates a Faerûnian date object.  
- If no `Date` is provided, the current system date is used.
- Optionally, you can pass a custom `faerunYear` (e.g. `1493`).

---

### `getFaerunDateString(): string`

Returns the Faerûnian date in readable format.  
- If it's a holiday, returns `[Festival] <name>`  
- Otherwise, returns `<day> <month>`

---

### `getWeekday(): string`

Returns the name of the day in the **10-day tenday cycle** of Faerûn.

---

### `getSeason(): string`

Returns the season based on the month:  
- `"Spring"`, `"Summer"`, `"Autumn"`, `"Winter"` or `"Deepwinter"`

---

### `getFestival(): string | null`

Returns the name of the festival for that day, if it exists.  
Returns `null` otherwise.

---

### `getFaerunYear(): number | null`

Returns the custom Faerûn year passed in the constructor, or `null` if none was provided.

---

### `toLocaleString(): string`

Returns a full formatted Faerûnian date string.  
Example:  
- With year → `"Zor, 1 Mirtul 1493 DR – Season: Spring"`
- Without year → `"Zor, 1 Mirtul – Season: Spring"`

---

### `FaerunDate.parse(dateString: string, options?: { faerunYear?: number }): FaerunDate`

Creates a FaerunDate instance from a string (e.g. `"2025-04-01"`), with optional `faerunYear`.

## 📜 License

Released under the [MIT License](./LICENSE).  
© 2025 Cantilux
