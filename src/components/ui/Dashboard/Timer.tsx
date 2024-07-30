import React, { useEffect, useState } from "react";

const calculateTimeLeft = (endDate: Date) => {
  const difference = +endDate - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }

  return timeLeft;
};

export const TimerContainer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 14 days from now

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex row lg:hidden">
      <div className="text-center mr-10">
        <p className="text-md">Next Deposit Period</p>
      </div>
      <div className="flex justify-center items-center space-x-4 h-[1rem] mt-0">
        <div className="text-center">
          <p className="text-sm font-semibold">{timeLeft.days}</p>
          <p className="text-xs">Days</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">{timeLeft.hours}</p>
          <p className="text-xs">Hours</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">{timeLeft.minutes}</p>
          <p className="text-xs">Minutes</p>
        </div>
      </div>
    </div>
  );
};
