import { readFile, readdir } from "fs/promises";
import { getBatteryIcon, getBatteryColor } from "./icons";

interface BatteryData {
  capacity: number;
  status: "Charging" | "Discharging" | "Full" | "Unknown";
}

/**
 * Finds the first available battery directory in /sys/class/power_supply/
 * Batteries are typically named BAT0, BAT1, etc.
 */
async function findBatteryPath(): Promise<string | null> {
  try {
    const powerSupplyPath = "/sys/class/power_supply";
    const entries = await readdir(powerSupplyPath);

    // Find directories that start with "BAT"
    const batteryDir = entries.find((entry) => entry.startsWith("BAT"));

    if (!batteryDir) {
      return null;
    }

    return `${powerSupplyPath}/${batteryDir}`;
  } catch (error) {
    console.error("Error finding battery path:", error);
    return null;
  }
}

/**
 * Reads a file and returns its trimmed content
 */
async function readFileContent(path: string): Promise<string | null> {
  try {
    const content = await readFile(path, "utf-8");
    return content.trim();
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return null;
  }
}

/**
 * Reads battery capacity from system files (sysfs)
 * This works on most Linux systems including Arch
 */
async function readFromSysfs(): Promise<BatteryData | null> {
  try {
    const batteryPath = await findBatteryPath();

    if (!batteryPath) {
      return null;
    }

    // Read capacity (0-100)
    const capacityContent = await readFileContent(`${batteryPath}/capacity`);
    const capacity = capacityContent ? parseInt(capacityContent, 10) : 0;

    // Read status
    const statusContent = await readFileContent(`${batteryPath}/status`);
    const validStatuses = ["Charging", "Discharging", "Full", "Unknown"];
    const status = validStatuses.includes(statusContent || "")
      ? (statusContent as BatteryData["status"])
      : "Unknown";

    return { capacity, status };
  } catch (error) {
    console.error("Error reading from sysfs:", error);
    return null;
  }
}

/**
 * Main function to get battery information
 * Reads from /sys/class/power_supply/BAT... files on Arch Linux
 */
export async function getBatteryInfo(): Promise<BatteryData | null> {
  return await readFromSysfs();
}
