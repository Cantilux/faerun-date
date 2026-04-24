import test from "node:test";
import assert from "node:assert/strict";

import HarptosDate, {
    DAYS_PER_MONTH,
    DAYS_PER_TENDAY,
    FaerunDate,
    HarptosDate as NamedHarptosDate,
    MONTHS,
    TENDAYS_PER_MONTH,
    fromFaerunParts,
    fromGregorian,
    fromHarptos
} from "../src/index.js";

test("default and named exports resolve to the same class", () => {
    assert.equal(HarptosDate, NamedHarptosDate);
    assert.equal(HarptosDate, FaerunDate);
    assert.equal(DAYS_PER_MONTH, 30);
    assert.equal(DAYS_PER_TENDAY, 10);
    assert.equal(TENDAYS_PER_MONTH, 3);
    assert.deepEqual(MONTHS.slice(0, 3), ["Hammer", "Alturiak", "Ches"]);
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
    assert.equal(date.getDate(), 5);
    assert.equal(date.getWeekOfYear(), 13);
    assert.equal(date.getWeekday(), "5th day of the tenday");
    assert.equal(date.getMonthIndex(), 4);
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

test("toFaerunParts returns normalized parts", () => {
    const date = new HarptosDate({ year: 1492, month: "Mirtul", day: 5 });

    assert.deepEqual(date.toFaerunParts(), {
        kind: "month-day",
        year: 1492,
        harptosYear: 1492,
        month: "Mirtul",
        monthIndex: 4,
        day: 5,
        date: 5,
        festival: null,
        season: "Spring",
        dayOfYear: 127,
        tenday: 13,
        dayOfTenday: 5,
        leapYear: true
    });
});

test("fromFaerunParts is an alias of fromHarptos", () => {
    const date = fromFaerunParts({ year: 1492, month: "Mirtul", day: 5 });

    assert.equal(date.toString(), "5 Mirtul 1492 DR");
});

test("addDays crosses festivals and year boundaries", () => {
    const hammer = fromHarptos({ year: 1497, month: "Hammer", day: 30 });
    const midwinter = hammer.addDays(1);
    const alturiak = hammer.addDays(2);
    const previousYear = fromHarptos({ year: 1497, month: "Hammer", day: 1 }).addDays(-1);

    assert.equal(midwinter.toString(), "Midwinter 1497 DR");
    assert.equal(alturiak.toString(), "1 Alturiak 1497 DR");
    assert.equal(previousYear.toString(), "30 Nightal 1496 DR");
});

test("addTendays advances by ten-day blocks", () => {
    const date = fromHarptos({ year: 1497, month: "Hammer", day: 1 }).addTendays(1);

    assert.equal(date.toString(), "11 Hammer 1497 DR");
});

test("addMonths preserves month-day and rejects festival inputs", () => {
    const mirtul = fromHarptos({ year: 1492, month: "Mirtul", day: 5 }).addMonths(1);

    assert.equal(mirtul.toString(), "5 Kythorn 1492 DR");
    assert.throws(
        () => fromHarptos({ year: 1497, festival: "Greengrass" }).addMonths(1),
        /month dates/
    );
});

test("addYears preserves canonical dates and validates Shieldmeet", () => {
    const monthDate = fromHarptos({ year: 1492, month: "Mirtul", day: 5 }).addYears(1);
    const shieldmeet = fromHarptos({ year: 1496, festival: "Shieldmeet" }).addYears(4);

    assert.equal(monthDate.toString(), "5 Mirtul 1493 DR");
    assert.equal(shieldmeet.toString(), "Shieldmeet 1500 DR");
    assert.throws(
        () => fromHarptos({ year: 1496, festival: "Shieldmeet" }).addYears(1),
        /does not occur/
    );
});

test("compare orders Harptos dates by year then ordinal day", () => {
    const earlier = fromHarptos({ year: 1497, month: "Hammer", day: 1 });
    const later = fromHarptos({ year: 1497, month: "Hammer", day: 2 });
    const nextYear = fromHarptos({ year: 1498, month: "Hammer", day: 1 });

    assert.equal(HarptosDate.compare(earlier, later) < 0, true);
    assert.equal(HarptosDate.compare(nextYear, later) > 0, true);
    assert.equal(HarptosDate.compare(earlier, earlier), 0);
});
