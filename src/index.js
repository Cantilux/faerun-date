import {
    DAYS_PER_MONTH,
    DAYS_PER_TENDAY,
    FESTIVAL_BY_NAME,
    FESTIVAL_SPECS,
    MONTH_INDEX,
    MONTH_SEASONS,
    MONTHS,
    ORDINAL_SUFFIXES,
    TENDAYS_PER_MONTH
} from "./harptos-constants.js";

function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

function getOrdinal(value) {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) {
        return `${value}th`;
    }

    return `${value}${ORDINAL_SUFFIXES[value % 10] ?? "th"}`;
}

function normalizeMonthName(month) {
    if (typeof month !== "string") {
        return null;
    }

    return MONTHS.find(name => name.toLowerCase() === month.toLowerCase()) ?? null;
}

function normalizeFestivalName(festival) {
    if (typeof festival !== "string") {
        return null;
    }

    return FESTIVAL_SPECS.find(spec => spec.name.toLowerCase() === festival.toLowerCase())?.name ?? null;
}

function parseGregorianString(value) {
    const isoDateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (isoDateOnlyMatch) {
        const [, year, month, day] = isoDateOnlyMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : null;
}

function isLeapYear(year) {
    return year % 4 === 0;
}

function getGregorianDayOfYear(date) {
    const year = date.getFullYear();
    const startOfYear = Date.UTC(year, 0, 1);
    const currentDay = Date.UTC(year, date.getMonth(), date.getDate());
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor((currentDay - startOfYear) / millisecondsPerDay) + 1;
    const maxDayOfYear = isLeapYear(year) ? 366 : 365;

    if (dayOfYear < 1 || dayOfYear > maxDayOfYear) {
        throw new RangeError(`Computed Gregorian day of year out of range: ${dayOfYear}`);
    }

    return dayOfYear;
}

function getHarptosYearLength(year) {
    return isLeapYear(year) ? 366 : 365;
}

function getHarptosEntries(leapYear) {
    const entries = [];

    for (const month of MONTHS) {
        for (let day = 1; day <= DAYS_PER_MONTH; day += 1) {
            entries.push({
                kind: "month-day",
                month,
                day,
                festival: null,
                season: MONTH_SEASONS[month]
            });
        }

        for (const festival of FESTIVAL_SPECS) {
            if (festival.afterMonth !== month) {
                continue;
            }

            if (festival.leapYearOnly && !leapYear) {
                continue;
            }

            entries.push({
                kind: "festival",
                month: null,
                day: null,
                festival: festival.name,
                season: festival.season
            });
        }
    }

    return entries.map((entry, index) => {
        if (entry.kind === "festival") {
            return {
                ...entry,
                dayOfYear: index + 1,
                tenday: null,
                dayOfTenday: null
            };
        }

        const monthIndex = MONTH_INDEX[entry.month];
        return {
            ...entry,
            dayOfYear: index + 1,
            tenday: monthIndex * TENDAYS_PER_MONTH + Math.floor((entry.day - 1) / DAYS_PER_TENDAY) + 1,
            dayOfTenday: ((entry.day - 1) % DAYS_PER_TENDAY) + 1
        };
    });
}

function getHarptosYear(options = {}, fallbackYear = null) {
    if (typeof options.drYear === "number") {
        return options.drYear;
    }

    if (typeof options.faerunYear === "number") {
        return options.faerunYear;
    }

    if (typeof options.yearOffset === "number" && typeof fallbackYear === "number") {
        return fallbackYear + options.yearOffset;
    }

    return typeof fallbackYear === "number" ? fallbackYear : null;
}

function createStateFromEntry(entry, harptosYear, source) {
    const leapYear = typeof harptosYear === "number" && isLeapYear(harptosYear);
    return {
        ...entry,
        harptosYear,
        source,
        leapYear
    };
}

function createStateFromDayOfYear(dayOfYear, harptosYear, source) {
    const leapYear = typeof harptosYear === "number" && isLeapYear(harptosYear);
    const entries = getHarptosEntries(leapYear);
    const entry = entries[dayOfYear - 1];

    if (!entry) {
        throw new RangeError(`Invalid dayOfYear: ${dayOfYear}.`);
    }

    return createStateFromEntry(entry, harptosYear, source);
}

function createStateFromGregorian(input, options = {}) {
    const date = input instanceof Date ? new Date(input.getTime()) : parseGregorianString(input);
    if (!isValidDate(date)) {
        throw new TypeError("Expected a valid Gregorian Date or date string.");
    }

    const harptosYear = getHarptosYear(options, date.getFullYear());
    const leapYear = isLeapYear(harptosYear ?? date.getFullYear());
    const entries = getHarptosEntries(leapYear);
    const dayOfYear = getGregorianDayOfYear(date);
    const entry = entries[dayOfYear - 1];

    if (!entry) {
        throw new RangeError(
            `Gregorian day ${dayOfYear} does not exist in Harptos year ${harptosYear}.`
        );
    }

    return createStateFromEntry(entry, harptosYear, {
        type: "gregorian",
        date
    });
}

function createStateFromHarptos(input, options = {}) {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError("Expected a Harptos date object.");
    }

    const harptosYear = getHarptosYear(options, input.year ?? null);

    if (input.dayOfYear != null) {
        return createStateFromDayOfYear(input.dayOfYear, harptosYear, {
            type: "harptos",
            input
        });
    }

    const festivalName = normalizeFestivalName(input.festival);
    if (festivalName) {
        const leapYear = typeof harptosYear === "number" && isLeapYear(harptosYear);
        const entries = getHarptosEntries(leapYear);
        const entry = entries.find(candidate => candidate.festival === festivalName);

        if (!entry) {
            throw new RangeError(`${festivalName} does not occur in ${harptosYear}.`);
        }

        return createStateFromEntry(entry, harptosYear, {
            type: "harptos",
            input
        });
    }

    const monthName = normalizeMonthName(input.month);
    const day = Number(input.day);
    if (!monthName || !Number.isInteger(day) || day < 1 || day > DAYS_PER_MONTH) {
        throw new TypeError("Expected { month, day } for a Harptos month-day, or { festival }.");
    }

    const leapYear = typeof harptosYear === "number" && isLeapYear(harptosYear);
    const entries = getHarptosEntries(leapYear);
    const entry = entries.find(candidate => candidate.month === monthName && candidate.day === day);

    return createStateFromEntry(entry, harptosYear, {
        type: "harptos",
        input
    });
}

function createState(input, options = {}) {
    if (isValidDate(input) || typeof input === "string") {
        return createStateFromGregorian(input, options);
    }

    return createStateFromHarptos(input, options);
}

function normalizeMonthShift(monthIndex, amount) {
    const shifted = monthIndex + amount;
    const normalizedMonthIndex = ((shifted % MONTHS.length) + MONTHS.length) % MONTHS.length;
    const yearOffset = (shifted - normalizedMonthIndex) / MONTHS.length;

    return {
        monthIndex: normalizedMonthIndex,
        yearOffset
    };
}

function shiftDayOfYear(harptosYear, dayOfYear, amount) {
    if (typeof harptosYear !== "number") {
        throw new TypeError("This operation requires a Harptos year.");
    }

    let targetYear = harptosYear;
    let targetDay = dayOfYear + amount;

    while (targetDay < 1) {
        targetYear -= 1;
        targetDay += getHarptosYearLength(targetYear);
    }

    while (targetDay > getHarptosYearLength(targetYear)) {
        targetDay -= getHarptosYearLength(targetYear);
        targetYear += 1;
    }

    return { year: targetYear, dayOfYear: targetDay };
}

function coerceHarptosDate(value) {
    return value instanceof HarptosDate ? value : new HarptosDate(value);
}

class HarptosDate {
    static MONTHS = MONTHS;

    static FESTIVALS = FESTIVAL_SPECS.map(({ name }) => name);

    static DAYS_PER_MONTH = DAYS_PER_MONTH;

    static DAYS_PER_TENDAY = DAYS_PER_TENDAY;

    constructor(input, options = {}) {
        const state = createState(input, options);
        Object.assign(this, state);
    }

    static isLeapYear(year) {
        return isLeapYear(year);
    }

    static fromGregorian(input, options = {}) {
        return new HarptosDate(input, options);
    }

    static fromHarptos(input, options = {}) {
        return new HarptosDate(input, options);
    }

    static fromFaerunParts(input, options = {}) {
        return HarptosDate.fromHarptos(input, options);
    }

    static parse(input, options = {}) {
        return HarptosDate.fromGregorian(input, options);
    }

    static compare(left, right) {
        const first = coerceHarptosDate(left);
        const second = coerceHarptosDate(right);

        if (typeof first.harptosYear === "number" && typeof second.harptosYear === "number") {
            if (first.harptosYear !== second.harptosYear) {
                return first.harptosYear - second.harptosYear;
            }

            return first.dayOfYear - second.dayOfYear;
        }

        if (first.harptosYear == null && second.harptosYear == null) {
            return first.dayOfYear - second.dayOfYear;
        }

        throw new RangeError("Cannot compare Harptos dates when only one side has a year.");
    }

    static toString(value) {
        return value.toString();
    }

    isFestival() {
        return this.kind === "festival";
    }

    getFestival() {
        return this.festival;
    }

    getMonth() {
        return this.month;
    }

    getMonthIndex() {
        return this.month == null ? null : MONTH_INDEX[this.month];
    }

    getDate() {
        return this.day;
    }

    getDay() {
        return this.day;
    }

    getDayOfYear() {
        return this.dayOfYear;
    }

    getSeason() {
        return this.season;
    }

    getFaerunYear() {
        return this.harptosYear;
    }

    getHarptosYear() {
        return this.harptosYear;
    }

    getTenday() {
        return this.tenday;
    }

    getWeekOfYear() {
        return this.getTenday();
    }

    getDayOfTenday() {
        return this.dayOfTenday;
    }

    getWeekday() {
        if (this.dayOfTenday == null) {
            return null;
        }

        return `${getOrdinal(this.dayOfTenday)} day of the tenday`;
    }

    addDays(amount) {
        if (!Number.isInteger(amount)) {
            throw new TypeError("addDays expects an integer number of days.");
        }

        const shifted = shiftDayOfYear(this.harptosYear, this.dayOfYear, amount);
        return HarptosDate.fromHarptos(shifted);
    }

    addTendays(amount) {
        if (!Number.isInteger(amount)) {
            throw new TypeError("addTendays expects an integer number of tendays.");
        }

        return this.addDays(amount * DAYS_PER_TENDAY);
    }

    addMonths(amount) {
        if (!Number.isInteger(amount)) {
            throw new TypeError("addMonths expects an integer number of months.");
        }

        if (typeof this.harptosYear !== "number") {
            throw new TypeError("addMonths requires a Harptos year.");
        }

        if (this.isFestival()) {
            throw new TypeError("addMonths is only supported for month dates.");
        }

        const shifted = normalizeMonthShift(this.getMonthIndex(), amount);
        return HarptosDate.fromHarptos({
            year: this.harptosYear + shifted.yearOffset,
            month: MONTHS[shifted.monthIndex],
            day: this.day
        });
    }

    addYears(amount) {
        if (!Number.isInteger(amount)) {
            throw new TypeError("addYears expects an integer number of years.");
        }

        if (typeof this.harptosYear !== "number") {
            throw new TypeError("addYears requires a Harptos year.");
        }

        const targetYear = this.harptosYear + amount;
        if (this.isFestival()) {
            if (this.festival === "Shieldmeet" && !isLeapYear(targetYear)) {
                throw new RangeError(`Shieldmeet does not occur in ${targetYear}.`);
            }

            return HarptosDate.fromHarptos({
                year: targetYear,
                festival: this.festival
            });
        }

        return HarptosDate.fromHarptos({
            year: targetYear,
            month: this.month,
            day: this.day
        });
    }

    toFaerunParts() {
        return {
            kind: this.kind,
            year: this.harptosYear,
            harptosYear: this.harptosYear,
            month: this.month,
            monthIndex: this.getMonthIndex(),
            day: this.day,
            date: this.day,
            festival: this.festival,
            season: this.season,
            dayOfYear: this.dayOfYear,
            tenday: this.tenday,
            dayOfTenday: this.dayOfTenday,
            leapYear: this.leapYear
        };
    }

    toObject() {
        return this.toFaerunParts();
    }

    getFaerunDateString() {
        return this.toString();
    }

    toString() {
        const yearPart = this.harptosYear == null ? "" : ` ${this.harptosYear} DR`;
        if (this.isFestival()) {
            return `${this.festival}${yearPart}`;
        }

        return `${this.day} ${this.month}${yearPart}`;
    }

    toLocaleString() {
        if (this.isFestival()) {
            return `${this.toString()} - ${this.season} festival`;
        }

        return `${this.toString()} - ${this.season} - Tenday ${this.tenday}, Day ${this.dayOfTenday}`;
    }
}

const FaerunDate = HarptosDate;

function fromGregorian(input, options = {}) {
    return HarptosDate.fromGregorian(input, options);
}

function fromHarptos(input, options = {}) {
    return HarptosDate.fromHarptos(input, options);
}

function fromFaerunParts(input, options = {}) {
    return HarptosDate.fromFaerunParts(input, options);
}

export {
    DAYS_PER_MONTH,
    DAYS_PER_TENDAY,
    FESTIVAL_SPECS as FESTIVALS,
    FaerunDate,
    HarptosDate,
    MONTHS,
    TENDAYS_PER_MONTH,
    fromFaerunParts,
    fromGregorian,
    fromHarptos
};

export default HarptosDate;
