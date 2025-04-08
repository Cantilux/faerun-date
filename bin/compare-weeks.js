#!/usr/bin/env node

// CLI: faerun-compare-weeks

// --year 2025
// --weeks 30

const args = process.argv.slice(2);
let targetYear = new Date().getFullYear();
let totalWeeks = 20;

args.forEach((arg, i) => {
    if (arg === '--year' && args[i + 1]) {
        targetYear = parseInt(args[i + 1], 10);
    }
    if (arg === '--weeks' && args[i + 1]) {
        totalWeeks = parseInt(args[i + 1], 10);
    }
});

function getGregorianWeekOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / (oneDay * 7)) + 1;
}

function getFaerunDayOfYear(date) {
    const month = date.getMonth(); // 0-based
    const day = date.getDate();
    const year = date.getFullYear();

    let days = month * 30 + day;

    const festivals = [
        { name: "Midwinter", day: 31, month: 0 },
        { name: "Greengrass", day: 30, month: 3 },
        { name: "Midsummer", day: 30, month: 6 },
        { name: "Highharvestide", day: 27, month: 8 },
        { name: "Feast of the Moon", day: 1, month: 10 }
    ];

    festivals.forEach(f => {
        const festDate = new Date(year, f.month, f.day);
        if (date >= festDate) {
            days += 1;
        }
    });

    return days;
}

function getFaerunWeekOfYear(date) {
    const dayOfYear = getFaerunDayOfYear(date);
    return Math.floor((dayOfYear - 1) / 10) + 1;
}

console.log(`Gregorian Week → Faerûn Tenday Correspondence for year ${targetYear}`);
for (let week = 1; week <= totalWeeks; week++) {
    const date = new Date(targetYear, 0, (week - 1) * 7 + 1); // Monday of that week
    const gregWeek = getGregorianWeekOfYear(date);
    const faerunWeek = getFaerunWeekOfYear(date);
    console.log(`Week ${String(gregWeek).padStart(2, '0')} → Tenday ${String(faerunWeek).padStart(2, '0')} (${date.toDateString()})`);
}
