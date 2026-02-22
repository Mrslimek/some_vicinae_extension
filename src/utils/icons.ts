import { Icon } from "@vicinae/api";

/**
 * Consistent flat material icons mapping
 * Provides a single source of truth for icons across the application
 */
export const AppIcons = {
  // Navigation and Actions
  Add: Icon.Plus,
  Save: Icon.Check,
  Delete: Icon.Trash,
  Edit: Icon.Pencil,
  List: Icon.CheckList,
  Search: Icon.MagnifyingGlass,
  Close: Icon.Xmark,
  More: Icon.Ellipsis,

  // System Information
  Time: Icon.Clock,
  Date: Icon.Calendar,
  Battery: Icon.Battery,
  Wifi: Icon.Wifi,
  Settings: Icon.Cog,

  // User and Device
  User: Icon.Person,
  UserCircle: Icon.PersonCircle,
  Device: Icon.Desktop,
  Desktop: Icon.Desktop,
  Host: Icon.ComputerChip,
  Network: Icon.Network,
  Globe: Icon.Globe01,

  // Status
  Success: Icon.Checkmark,
  Error: Icon.Xmark,
  Warning: Icon.Exclamationmark,
  Info: Icon.Info01,

  // UI Elements
  Star: Icon.Star,
  Heart: Icon.Heart,
  Bookmark: Icon.Bookmark,
  Copy: Icon.CopyClipboard,
  Download: Icon.Download,
  Upload: Icon.Upload,
  Refresh: Icon.ArrowClockwise,

  // Notes and Text
  Note: Icon.NewDocument,
  Text: Icon.Text,
  Paragraph: Icon.Paragraph,
  Quote: Icon.QuoteBlock,
  Highlight: Icon.Highlight,

  // Misc
  Eye: Icon.Eye,
  EyeOff: Icon.EyeDisabled,
  Lock: Icon.Lock,
  Unlock: Icon.LockUnlocked,
} as const;

/**
 * Get battery icon based on capacity and status
 */
export function getBatteryIcon(capacity: number, status: string): string {
  if (status === "Charging") return "⚡";
  if (capacity >= 90) return "🔋";
  if (capacity >= 70) return "🔋";
  if (capacity >= 50) return "🔋";
  if (capacity >= 30) return "🪫";
  if (capacity >= 15) return "🪫";
  return "🔴";
}

/**
 * Get color for battery level
 */
export function getBatteryColor(capacity: number): "red" | "yellow" | "green" {
  if (capacity <= 15) return "red";
  if (capacity <= 30) return "yellow";
  return "green";
}
