const MONTHS = [
    "Hammer",
    "Alturiak",
    "Ches",
    "Tarsakh",
    "Mirtul",
    "Kythorn",
    "Flamerule",
    "Eleasis",
    "Eleint",
    "Marpenoth",
    "Uktar",
    "Nightal"
];

const FESTIVAL_SPECS = [
    { name: "Midwinter", afterMonth: "Hammer", season: "Winter" },
    { name: "Greengrass", afterMonth: "Tarsakh", season: "Spring" },
    { name: "Midsummer", afterMonth: "Flamerule", season: "Summer" },
    { name: "Shieldmeet", afterMonth: "Flamerule", season: "Summer", leapYearOnly: true },
    { name: "Highharvestide", afterMonth: "Eleint", season: "Autumn" },
    { name: "Feast of the Moon", afterMonth: "Uktar", season: "Winter" }
];

const MONTH_SEASONS = {
    Hammer: "Winter",
    Alturiak: "Winter",
    Ches: "Spring",
    Tarsakh: "Spring",
    Mirtul: "Spring",
    Kythorn: "Summer",
    Flamerule: "Summer",
    Eleasis: "Summer",
    Eleint: "Autumn",
    Marpenoth: "Autumn",
    Uktar: "Autumn",
    Nightal: "Winter"
};

const ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];

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

function isLeapYear(year) {
    return year % 4 === 0;
}

function getHarptosEntries(leapYear) {
    const entries = [];

    for (const month of MONTHS) {
        for (let day = 1; day <= 30; day += 1) {
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

        const monthIndex = MONTHS.indexOf(entry.month);
        return {
            ...entry,
            dayOfYear: index + 1,
            tenday: monthIndex * 3 + Math.floor((entry.day - 1) / 10) + 1,
            dayOfTenday: ((entry.day - 1) % 10) + 1
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

    return {
        ...entry,
        harptosYear,
        source: {
            type: "gregorian",
            date
        },
        leapYear
    };
}

function createStateFromHarptos(input, options = {}) {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError("Expected a Harptos date object.");
    }

    const harptosYear = getHarptosYear(options, input.year ?? null);
    const leapYear = typeof harptosYear === "number" && isLeapYear(harptosYear);
    const entries = getHarptosEntries(leapYear);

    if (input.dayOfYear != null) {
        const entry = entries[input.dayOfYear - 1];
        if (!entry) {
            throw new RangeError(`Invalid dayOfYear: ${input.dayOfYear}.`);
        }

        return {
            ...entry,
            harptosYear,
            source: {
                type: "harptos",
                input
            },
            leapYear
        };
    }

    const festivalName = normalizeFestivalName(input.festival);
    if (festivalName) {
        const entry = entries.find(candidate => candidate.festival === festivalName);
        if (!entry) {
            throw new RangeError(`${festivalName} does not occur in ${harptosYear}.`);
        }

        return {
            ...entry,
            harptosYear,
            source: {
                type: "harptos",
                input
            },
            leapYear
        };
    }

    const monthName = normalizeMonthName(input.month);
    const day = Number(input.day);
    if (!monthName || !Number.isInteger(day) || day < 1 || day > 30) {
        throw new TypeError("Expected { month, day } for a Harptos month-day, or { festival }.");
    }

    const entry = entries.find(candidate => candidate.month === monthName && candidate.day === day);
    return {
        ...entry,
        harptosYear,
        source: {
            type: "harptos",
            input
        },
        leapYear
    };
}

function createState(input, options = {}) {
    if (isValidDate(input) || typeof input === "string") {
        return createStateFromGregorian(input, options);
    }

    return createStateFromHarptos(input, options);
}

class HarptosDate {
    static MONTHS = MONTHS;

    static FESTIVALS = FESTIVAL_SPECS.map(({ name }) => name);

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

    static parse(input, options = {}) {
        return HarptosDate.fromGregorian(input, options);
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

    toObject() {
        return {
            kind: this.kind,
            month: this.month,
            day: this.day,
            festival: this.festival,
            season: this.season,
            dayOfYear: this.dayOfYear,
            tenday: this.tenday,
            dayOfTenday: this.dayOfTenday,
            harptosYear: this.harptosYear,
            leapYear: this.leapYear
        };
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

export {
    MONTHS,
    FESTIVAL_SPECS as FESTIVALS,
    HarptosDate,
    FaerunDate,
    fromGregorian,
    fromHarptos
};

export default HarptosDate;
