"use client";

// Simple Ethiopian calendar without external library
export const getSimpleEthiopianDate = () => {
  const now = new Date();

  // Simple conversion (approximation)
  const gregYear = now.getFullYear();
  const gregMonth = now.getMonth() + 1;
  const gregDay = now.getDate();
  const dayOfWeek = now.getDay();

  // Approximate Ethiopian date (Gregorian - 7/8 years)
  let ethYear = gregYear - 8;
  let ethMonth = gregMonth + 4; // Ethiopian year starts in September
  let ethDay = gregDay;

  // Adjust if month > 13
  if (ethMonth > 13) {
    ethMonth -= 13;
    ethYear += 1;
  }

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthName: getEthiopianMonthName(ethMonth),
    dayName: getEthiopianDayName(dayOfWeek),
    formatted: `${getEthiopianMonthName(ethMonth)} ${ethDay}, ${ethYear}`,
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

export const getEthiopianHoliday = () => {
  // Simple holiday check (just for demo)
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  if (month === 9 && day === 11) {
    return { name: "እንቁጣጣሽ (አዲስ ዓመት)", emoji: "🎉", isHoliday: true };
  }
  if (month === 1 && day === 7) {
    return { name: "ገና (ገና)", emoji: "🎄", isHoliday: true };
  }

  return null;
};
