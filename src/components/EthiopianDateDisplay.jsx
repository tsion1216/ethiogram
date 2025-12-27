"use client";

import { useState, useEffect } from "react";
import {
  convertToEthiopian,
  getEthiopianHoliday,
  formatEthiopianDate,
} from "@/lib/ethiopianCalendar";
import { FiCalendar, FiGift } from "react-icons/fi";

const EthiopianDateDisplay = () => {
  const [ethiopianDate, setEthiopianDate] = useState(null);
  const [holiday, setHoliday] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setEthiopianDate(convertToEthiopian(now));
      setHoliday(getEthiopianHoliday(now));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatEthiopianTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "ከሰዓት" : "ጥዋት";
    const ethHours = hours % 12 || 12;

    return `${ethHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (!ethiopianDate) return null;

  return (
    <div
      className={`p-3 rounded-xl ${
        holiday
          ? "bg-gradient-to-r from-ethio-red/20 to-ethio-yellow/20 border border-ethio-red/30"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              holiday ? "bg-ethio-red/20" : "bg-ethio-blue/20"
            }`}
          >
            <FiCalendar
              className={`w-5 h-5 ${
                holiday ? "text-ethio-red" : "text-ethio-blue"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-800">
                {ethiopianDate.monthName} {ethiopianDate.day},{" "}
                {ethiopianDate.year}
              </p>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                {formatEthiopianTime(currentTime)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {ethiopianDate.dayName} •{" "}
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {holiday && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-ethio-red to-ethio-yellow text-white px-3 py-1.5 rounded-full">
            <FiGift className="w-4 h-4" />
            <span className="text-sm font-medium">
              {holiday.emoji} {holiday.name}
            </span>
          </div>
        )}
      </div>

      {/* Ethiopian Numerals Display */}
      <div className="mt-2 pt-2 border-t border-gray-200/50">
        <div className="flex items-center justify-center space-x-6 text-center">
          <div>
            <p className="text-xs text-gray-500">ዓመት</p>
            <p className="text-xl font-bold text-ethio-green">
              {ethiopianDate.year}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ወር</p>
            <p className="text-xl font-bold text-ethio-blue">
              {ethiopianDate.monthName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ቀን</p>
            <p className="text-xl font-bold text-ethio-red">
              {ethiopianDate.day}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ቀን</p>
            <p className="text-xl font-bold text-gray-800">
              {ethiopianDate.dayName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EthiopianDateDisplay;
