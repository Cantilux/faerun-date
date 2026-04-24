export const DAYS_PER_MONTH = 30;

export const TENDAYS_PER_MONTH = 3;

export const DAYS_PER_TENDAY = 10;

export const MONTHS = [
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

export const FESTIVAL_SPECS = [
    { name: "Midwinter", afterMonth: "Hammer", season: "Winter" },
    { name: "Greengrass", afterMonth: "Tarsakh", season: "Spring" },
    { name: "Midsummer", afterMonth: "Flamerule", season: "Summer" },
    { name: "Shieldmeet", afterMonth: "Flamerule", season: "Summer", leapYearOnly: true },
    { name: "Highharvestide", afterMonth: "Eleint", season: "Autumn" },
    { name: "Feast of the Moon", afterMonth: "Uktar", season: "Winter" }
];

export const MONTH_SEASONS = {
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

export const MONTH_INDEX = Object.fromEntries(
    MONTHS.map((month, index) => [month, index])
);

export const FESTIVAL_BY_NAME = Object.fromEntries(
    FESTIVAL_SPECS.map(spec => [spec.name, spec])
);

export const ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];
