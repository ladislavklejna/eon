/**
 * Modul pro práci s českými státními svátky
 *
 * České státní svátky a dny pracovního volna:
 * - Pevné svátky (každý rok stejné datum)
 * - Pohyblivé svátky (Velký pátek, Velikonoční pondělí)
 */

/**
 * Výpočet data Velikonoc pro daný rok (Easter Sunday)
 * Používá Meeus/Jones/Butcher algoritmus
 * @param {number} year - Rok
 * @returns {Date} - Datum Velikonoční neděle
 */
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Seznam pevných českých státních svátků
 * Formát: 'MM-DD' (měsíc-den)
 */
const FIXED_HOLIDAYS = {
  '01-01': 'Nový rok, Den obnovy samostatného českého státu',
  '05-01': 'Svátek práce',
  '05-08': 'Den vítězství',
  '07-05': 'Den slovanských věrozvěstů Cyrila a Metoděje',
  '07-06': 'Den upálení mistra Jana Husa',
  '09-28': 'Den české státnosti',
  '10-28': 'Den vzniku samostatného československého státu',
  '11-17': 'Den boje za svobodu a demokracii',
  '12-24': 'Štědrý den',
  '12-25': '1. svátek vánoční',
  '12-26': '2. svátek vánoční',
};

/**
 * Zkontroluje, jestli je dané datum českým státním svátkem
 * @param {Date} date - Datum k ověření
 * @returns {Object} - { isHoliday: boolean, name: string }
 */
export function isCzechHoliday(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  // Kontrola pevných svátků
  if (FIXED_HOLIDAYS[dateKey]) {
    return {
      isHoliday: true,
      name: FIXED_HOLIDAYS[dateKey],
      type: 'fixed'
    };
  }

  // Výpočet pohyblivých svátků (Velikonoce)
  const easter = calculateEaster(year);

  // Velký pátek (2 dny před Velikonoční nedělí)
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  // Velikonoční pondělí (1 den po Velikonoční neděli)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  // Porovnání dat (ignorovat čas)
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  goodFriday.setHours(0, 0, 0, 0);
  easterMonday.setHours(0, 0, 0, 0);

  if (checkDate.getTime() === goodFriday.getTime()) {
    return {
      isHoliday: true,
      name: 'Velký pátek',
      type: 'movable',
      easterYear: year
    };
  }

  if (checkDate.getTime() === easterMonday.getTime()) {
    return {
      isHoliday: true,
      name: 'Velikonoční pondělí',
      type: 'movable',
      easterYear: year
    };
  }

  return {
    isHoliday: false,
    name: null,
    type: null
  };
}

/**
 * Zkontroluje, jestli je dané datum víkend NEBO svátek
 * @param {Date} date - Datum k ověření
 * @returns {boolean} - true pokud je víkend nebo svátek
 */
export function isWeekendOrHoliday(date) {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Neděle nebo sobota
  const holidayCheck = isCzechHoliday(date);

  return isWeekend || holidayCheck.isHoliday;
}

/**
 * Získá všechny české svátky pro daný rok
 * @param {number} year - Rok
 * @returns {Array} - Pole objektů se svátky
 */
export function getAllHolidaysForYear(year) {
  const holidays = [];

  // Přidat pevné svátky
  Object.keys(FIXED_HOLIDAYS).forEach(dateKey => {
    const [month, day] = dateKey.split('-');
    holidays.push({
      date: new Date(year, parseInt(month) - 1, parseInt(day)),
      name: FIXED_HOLIDAYS[dateKey],
      type: 'fixed'
    });
  });

  // Přidat pohyblivé svátky
  const easter = calculateEaster(year);

  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.push({
    date: goodFriday,
    name: 'Velký pátek',
    type: 'movable'
  });

  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays.push({
    date: easterMonday,
    name: 'Velikonoční pondělí',
    type: 'movable'
  });

  // Seřadit podle data
  holidays.sort((a, b) => a.date - b.date);

  return holidays;
}

export default {
  isCzechHoliday,
  isWeekendOrHoliday,
  getAllHolidaysForYear,
  calculateEaster
};
