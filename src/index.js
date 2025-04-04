// FaerunDate is a utility class to convert real-world dates into the Faerûn calendar format
// from the Forgotten Realms setting in Dungeons & Dragons. It includes support for months, seasons,
// holidays, weekdays, and event management.
class FaerunDate {
    static MONTH_NAMES = [
        "Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn",
        "Flamerule", "Eleasis", "Eleint", "Marpenoth", "Uktar", "Nightal"
    ];

    static FESTIVALS = [
        { name: "Midwinter", day: 1, month: 2 },
        { name: "Greengrass", day: 1, month: 4 },
        { name: "Midsummer", day: 1, month: 7 },
        { name: "Highharvestide", day: 27, month: 9 },
        { name: "Feast of the Moon", day: 1, month: 11 },
        { name: "Shieldmeet", day: 2, month: 7, leapYearOnly: true }
    ];

    static SEASONS = [
        { name: "Deepwinter", months: [1, 2] },
        { name: "Spring", months: [3, 4, 5] },
        { name: "Summer", months: [6, 7, 8] },
        { name: "Autumn", months: [9, 10] },
        { name: "Winter", months: [11, 12] }
    ];

    static WEEKDAYS = [
        "Sul", "Far", "Tar", "Sar", "Rai", "Zor", "Kyth", "Hamar", "Ith", "Alt"
    ];

    constructor(date, options = {}) {
        const inputDate = date instanceof Date ? date : new Date();
        const day = inputDate.getDate();
        const month = inputDate.getMonth() + 1;
        const year = inputDate.getFullYear();

        this.realDate = { day, month, year };
        this.faerunMonth = FaerunDate.MONTH_NAMES[month - 1];
        this.customFaerunYear = options.faerunYear;
    }

    static isLeapYear(year) {
        return year % 4 === 0;
    }

    getFestival() {
        const { day, month, year } = this.realDate;
        const leap = FaerunDate.isLeapYear(year);
        return FaerunDate.FESTIVALS.find(f => f.day === day && f.month === month && (!f.leapYearOnly || leap))?.name ?? null;
    }

    getSeason() {
        const m = this.realDate.month;
        return FaerunDate.SEASONS.find(season => season.months.includes(m))?.name ?? "Unknown";
    }

    getWeekday() {
        const { day, month } = this.realDate;
        const dayOfYear = (month - 1) * 30 + day;
        return FaerunDate.WEEKDAYS[dayOfYear % 10];
    }

    getFaerunDateString() {
        const festival = this.getFestival();
        return festival ? `[Festival] ${festival}` : `${this.realDate.day} ${this.faerunMonth}`;
    }

    getFaerunYear() {
        return this.customFaerunYear ?? null;
    }

    toLocaleString() {
        const weekday = this.getWeekday();
        const festival = this.getFestival();
        const yearPart = this.getFaerunYear() ? ` ${this.getFaerunYear()} DR` : "";
        return festival
            ? `${festival} – Season: ${this.getSeason()}`
            : `${weekday}, ${this.realDate.day} ${this.faerunMonth}${yearPart} – Season: ${this.getSeason()}`;
    }

    static parse(dateString, options = {}) {
        const date = new Date(dateString);
        return new FaerunDate(date, options);
    }
}

export default FaerunDate;
