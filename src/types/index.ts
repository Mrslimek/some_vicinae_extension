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
