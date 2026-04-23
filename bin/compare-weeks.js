#!/usr/bin/env node

import { fromGregorian } from "../src/index.js";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const args = process.argv.slice(2);
let targetYear = new Date().getFullYear();
let totalWeeks = 20;
let drYear = null;

for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--year" && next) {
        targetYear = Number.parseInt(next, 10);
    }

    if (arg === "--weeks" && next) {
        totalWeeks = Number.parseInt(next, 10);
    }

    if (arg === "--dr-year" && next) {
        drYear = Number.parseInt(next, 10);
    }
}

console.log(`Gregorian week -> Harptos correspondence for Gregorian year ${targetYear}`);

for (let week = 1; week <= totalWeeks; week += 1) {
    const date = new Date(targetYear, 0, (week - 1) * 7 + 1);
    const harptos = fromGregorian(date, { drYear: drYear ?? targetYear });
    const gregorianLabel = formatLocalDate(date);

    if (harptos.isFestival()) {
        console.log(
            `Week ${String(week).padStart(2, "0")} -> ${harptos.getFestival()} (${gregorianLabel})`
        );
        continue;
    }

    console.log(
        `Week ${String(week).padStart(2, "0")} -> Tenday ${String(harptos.getTenday()).padStart(2, "0")}, Day ${harptos.getDayOfTenday()} (${harptos.toString()} | ${gregorianLabel})`
    );
}
