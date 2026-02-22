export type Note = string;

export interface BatteryInfo {
  capacity: number;
  status: "Charging" | "Discharging" | "Full" | "Unknown";
  icon?: string;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
}

export interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  addNote: (note: Note) => Promise<void>;
  deleteNote: (index: number) => Promise<void>;
  clearAllNotes: () => Promise<void>;
}

/**
 * Types for Dunst notifications
 */
export type NotificationUrgency = "LOW" | "NORMAL" | "CRITICAL";

export interface DunstNotificationField<T = string> {
  type: string;
  data: T;
}

export interface DunstNotification {
  body: DunstNotificationField<string>;
  message: DunstNotificationField<string>;
  summary: DunstNotificationField<string>;
  appname: DunstNotificationField<string>;
  category: DunstNotificationField<string>;
  default_action_name: DunstNotificationField<string>;
  icon_path: DunstNotificationField<string>;
  id: DunstNotificationField<number>;
  timestamp: DunstNotificationField<number>;
  timeout: DunstNotificationField<number>;
  progress: DunstNotificationField<number>;
  urgency: DunstNotificationField<NotificationUrgency>;
  stack_tag: DunstNotificationField<string>;
  urls: DunstNotificationField<string>;
}

export interface Notification {
  id: number;
  appname: string;
  summary: string;
  body: string;
  message: string;
  timestamp: number;
  urgency: NotificationUrgency;
  icon_path: string;
  category: string;
}
