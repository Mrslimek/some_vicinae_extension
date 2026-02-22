import { useState, useEffect, useCallback } from "react";
import { Color } from "@vicinae/api";
import { getBatteryInfo } from "../utils/battery";
import { getBatteryIcon, getBatteryColor } from "../utils/icons";
import type { BatteryInfo } from "../types";

const BATTERY_UPDATE_INTERVAL = 30000; // Update every 30 seconds

/**
 * Custom hook to monitor battery status
 * Returns battery information including capacity, status, and icon
 * Updates automatically every 30 seconds
 */
export function useBattery(): BatteryInfo | null {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

  const updateBatteryInfo = useCallback(async () => {
    const data = await getBatteryInfo();

    if (data) {
      setBatteryInfo({
        capacity: data.capacity,
        status: data.status,
        icon: getBatteryIcon(data.capacity, data.status),
      });
    } else {
      // If we can't read battery info, set a default unknown state
      setBatteryInfo({
        capacity: 0,
        status: "Unknown",
        icon: "❓",
      });
    }
  }, []);

  useEffect(() => {
    // Initial battery check
    updateBatteryInfo();

    // Set up periodic updates
    const interval = setInterval(() => {
      updateBatteryInfo();
    }, BATTERY_UPDATE_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [updateBatteryInfo]);

  return batteryInfo;
}

/**
 * Helper function to get a human-readable color name
 * for use with UI components
 */
export function getBatteryStatusColor(batteryInfo: BatteryInfo | null): string {
  if (!batteryInfo) return "secondaryText";

  const colorMap = {
    red: Color.Red,
    yellow: Color.Orange,
    green: Color.Green,
  };

  const colorKey = getBatteryColor(batteryInfo.capacity);
  return colorMap[colorKey as keyof typeof colorMap] || Color.SecondaryText;
}
