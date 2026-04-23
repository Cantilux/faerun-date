import test from "node:test";
import assert from "node:assert/strict";

import HarptosDate, {
    FaerunDate,
    HarptosDate as NamedHarptosDate,
    fromGregorian,
    fromHarptos
} from "../src/index.js";

test("default and named exports resolve to the same class", () => {
    assert.equal(HarptosDate, NamedHarptosDate);
    assert.equal(HarptosDate, FaerunDate);
});

test("Gregorian ordinal mapping lands on Midwinter", () => {
    const date = fromGregorian(new Date(2025, 0, 31), { drYear: 1497 });

    assert.equal(date.isFestival(), true);
    assert.equal(date.getFestival(), "Midwinter");
    assert.equal(date.getMonth(), null);
    assert.equal(date.getDay(), null);
    assert.equal(date.getTenday(), null);
    assert.equal(date.toString(), "Midwinter 1497 DR");
});

test("Gregorian conversion uses the resolved Harptos year for leap handling", () => {
    const date = fromGregorian(new Date(2024, 7, 1), { drYear: 1497 });

    assert.equal(date.getMonth(), "Eleasis");
    assert.equal(date.getDay(), 1);
    assert.equal(date.getFestival(), null);
});

test("Gregorian ordinal mapping lands on the first day after Midwinter", () => {
    const date = fromGregorian(new Date(2025, 1, 1), { drYear: 1497 });

    assert.equal(date.isFestival(), false);
    assert.equal(date.getMonth(), "Alturiak");
    assert.equal(date.getDay(), 1);
    assert.equal(date.getTenday(), 4);
    assert.equal(date.getDayOfTenday(), 1);
});

test("Shieldmeet exists only in leap years", () => {
    const leapYearFestival = fromHarptos({ year: 1496, festival: "Shieldmeet" });
    assert.equal(leapYearFestival.getDayOfYear(), 214);
    assert.equal(leapYearFestival.toString(), "Shieldmeet 1496 DR");

    assert.throws(
        () => fromHarptos({ year: 1497, festival: "Shieldmeet" }),
        /does not occur/
    );
});

test("Eleasis 1 follows Shieldmeet in leap years", () => {
    const date = fromHarptos({ year: 1496, month: "Eleasis", day: 1 });

    assert.equal(date.getDayOfYear(), 215);
    assert.equal(date.getTenday(), 22);
    assert.equal(date.getDayOfTenday(), 1);
});

test("Shieldmeet requires a leap-year Harptos year when created from Harptos input", () => {
    assert.throws(
        () => fromHarptos({ festival: "Shieldmeet" }),
        /does not occur/
    );
});

test("Highharvestide and Feast of the Moon are intercalary festivals", () => {
    const highharvestide = fromHarptos({ year: 1497, festival: "Highharvestide" });
    const feast = fromHarptos({ year: 1497, festival: "Feast of the Moon" });

    assert.equal(highharvestide.getSeason(), "Autumn");
    assert.equal(highharvestide.getTenday(), null);
    assert.equal(feast.getSeason(), "Winter");
    assert.equal(feast.getTenday(), null);
});

test("constructor accepts structured Harptos input", () => {
    const date = new HarptosDate({ year: 1492, month: "Mirtul", day: 5 });

    assert.equal(date.toString(), "5 Mirtul 1492 DR");
    assert.equal(date.getWeekOfYear(), 13);
    assert.equal(date.getWeekday(), "5th day of the tenday");
});

test("constructor accepts ISO date strings", () => {
    const date = new HarptosDate("2026-04-24", { drYear: 1498 });

    assert.equal(date.getMonth(), "Tarsakh");
    assert.equal(date.getDay(), 23);
    assert.equal(date.toString(), "23 Tarsakh 1498 DR");
});

test("Gregorian day-of-year computation is stable for UTC timestamps", () => {
    const date = fromGregorian(new Date(2025, 2, 30, 23, 30), { drYear: 1497 });

    assert.equal(date.getDayOfYear(), 89);
    assert.equal(date.toString(), "28 Ches 1497 DR");
});

test("Gregorian leap day cannot map into a non-leap Harptos year", () => {
    assert.throws(
        () => fromGregorian(new Date(2024, 11, 31), { drYear: 1497 }),
        /does not exist/
    );
});

test("dayOfYear can be used to create canonical Harptos dates", () => {
    const date = fromHarptos({ year: 1497, dayOfYear: 122 });

    assert.equal(date.isFestival(), true);
    assert.equal(date.getFestival(), "Greengrass");
    assert.equal(date.toLocaleString(), "Greengrass 1497 DR - Spring festival");
});

test("invalid structured input throws instead of silently using today", () => {
    assert.throws(
        () => new HarptosDate({ month: "Mirtul" }),
        /Expected \{ month, day \}/
    );
});
