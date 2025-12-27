import { EthDateTime } from "ethiopian-calendar-date-converter";

export const convertToEthiopian = (gregorianDate) => {
  const date = new Date(gregorianDate);
  const ethiopian = EthDateTime.fromGregorian(date);

  return {
    year: ethiopian.year,
    month: ethiopian.month,
    day: ethiopian.day,
    monthName: getEthiopianMonthName(ethiopian.month),
    dayName: getEthiopianDayName(date.getDay()),
    formatted: formatEthiopianDate(ethiopian),
  };
};

export const getEthiopianMonthName = (monthNumber) => {
  const months = [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜ",
  ];
  return months[monthNumber - 1] || "የማይታወቅ ወር";
};

export const getEthiopianDayName = (dayIndex) => {
  const days = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
  return days[dayIndex] || "የማይታወቅ ቀን";
};

export const formatEthiopianDate = (ethiopian) => {
  // Format: መስከረም ፲፬, ፲፱፻፲፮
  const ethiopianNumerals = convertToEthiopianNumerals(ethiopian.day);
  return `${getEthiopianMonthName(
    ethiopian.month
  )} ${ethiopianNumerals}, ${convertToEthiopianNumerals(ethiopian.year)}`;
};

export const convertToEthiopianNumerals = (number) => {
  const ethiopianDigits = ["፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱", "፲"];
  const tens = ["፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺", "፻"];

  if (number <= 10) return ethiopianDigits[number - 1] || number;
  if (number < 100) {
    const tensDigit = Math.floor(number / 10);
    const onesDigit = number % 10;
    return (
      tens[tensDigit - 1] +
      (onesDigit > 0 ? ethiopianDigits[onesDigit - 1] : "")
    );
  }

  return number.toString(); // Simplified for larger numbers
};

export const getEthiopianHoliday = (date) => {
  const ethiopian = EthDateTime.fromGregorian(date);
  const holidays = {
    "09-11": { name: "እንቁጣጣሽ (አዲስ ዓመት)", emoji: "🎉", isHoliday: true },
    "09-17": { name: "መስቀል (መስቀል)", emoji: "✝️", isHoliday: true },
    "10-02": { name: "ገና (ገና)", emoji: "🎄", isHoliday: true },
    "04-23": { name: "ጥምቀት (ጥምቀት)", emoji: "💧", isHoliday: true },
    "08-15": { name: "ፋሲካ (ፋሲካ)", emoji: "🐑", isHoliday: true },
    "05-28": { name: "ደርግ የወደቀበት ቀን", emoji: "🇪🇹", isHoliday: true },
    "03-02": { name: "አድዋ ድል", emoji: "⚔️", isHoliday: true },
  };

  const key = `${ethiopian.month.toString().padStart(2, "0")}-${ethiopian.day
    .toString()
    .padStart(2, "0")}`;
  return holidays[key] || null;
};

export const isEthiopianHolidayToday = () => {
  return getEthiopianHoliday(new Date()) !== null;
};
