import { useState, useEffect } from "react";

interface TimeData {
  time: string;
  date: string;
  now: Date;
}

/**
 * Custom hook to manage time and date updates
 * Updates every second and returns formatted time/date strings
 */
export function useTime(): TimeData {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setNow(new Date()), 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  // Format time in 24-hour format (e.g., "14:30")
  const time = now.toLocaleTimeString("en-GB", {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Format date with full weekday and month name (e.g., "Monday, 15 January")
  const date = now.toLocaleDateString("en-US", {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return {
    time,
    date,
    now,
  };
}
