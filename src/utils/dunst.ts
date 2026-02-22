import { exec } from "child_process";
import { promisify } from "util";
import type { DunstNotification, Notification } from "../types";

const execAsync = promisify(exec);

/**
 * Fetch notification history from dunst using dunstctl
 * Returns array of parsed notifications
 */
export async function getDunstNotifications(): Promise<Notification[]> {
  try {
    const { stdout } = await execAsync("dunstctl history");

    if (!stdout) {
      return [];
    }

    // Parse the JSON output
    const parsed = JSON.parse(stdout);

    // Extract the notification array from the complex structure
    // Structure: { data: [[notifications...]] }
    const notificationsData = parsed?.data?.[0];

    if (!Array.isArray(notificationsData)) {
      return [];
    }

    // Transform each notification into a simpler format
    const notifications: Notification[] = notificationsData
      .map((dunstNotif: DunstNotification) => {
        // Extract data from the complex { type, data } structure
        return {
          id: dunstNotif.id?.data ?? 0,
          appname: dunstNotif.appname?.data ?? "",
          summary: dunstNotif.summary?.data ?? "",
          body: dunstNotif.body?.data ?? "",
          message: dunstNotif.message?.data ?? "",
          timestamp: dunstNotif.timestamp?.data ?? 0,
          urgency: dunstNotif.urgency?.data ?? "NORMAL",
          icon_path: dunstNotif.icon_path?.data ?? "",
          category: dunstNotif.category?.data ?? "",
        };
      })
      // Filter out empty notifications, Satty notifications (case-insensitive), and sort by timestamp (newest first)
      .filter(
        (notif) =>
          (notif.summary || notif.body) &&
          !notif.appname.toLowerCase().includes("satty"),
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    return notifications;
  } catch (error) {
    console.error("Failed to fetch dunst notifications:", error);
    return [];
  }
}

/**
 * Format timestamp into human-readable time
 */
export function formatNotificationTime(timestamp: number): string {
  // Dunst timestamps appear to be in microseconds since boot
  // Convert to a more readable format if possible, or show relative time
  const now = Date.now() * 1000; // Convert to microseconds
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1_000_000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return "Older";
  }
}

/**
 * Get urgency color for notifications
 */
export function getNotificationUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "CRITICAL":
      return "red";
    case "NORMAL":
      return "blue";
    case "LOW":
      return "gray";
    default:
      return "gray";
  }
}

/**
 * Get icon for notification based on app name
 */
export function getNotificationIcon(
  appname: string,
  icon_path: string,
): string {
  if (icon_path) return icon_path;

  // Fallback icons based on app name
  const appLower = appname.toLowerCase();

  if (appLower.includes("telegram")) return "💬";
  if (appLower.includes("discord")) return "🎮";
  if (appLower.includes("spotify")) return "🎵";
  if (appLower.includes("mail") || appLower.includes("thunderbird"))
    return "📧";
  if (
    appLower.includes("firefox") ||
    appLower.includes("chrome") ||
    appLower.includes("browser")
  )
    return "🌐";
  if (appLower.includes("vscode") || appLower.includes("code")) return "💻";
  if (appLower.includes("slack")) return "💼";
  if (appLower.includes("git")) return "📦";

  return "📢";
}
