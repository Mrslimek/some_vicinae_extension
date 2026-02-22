import { useState, useEffect, useCallback } from "react";
import { LocalStorage } from "@vicinae/api";
import { Note, UseNotesReturn } from "../types";

const STORAGE_KEY = "dashboard_notes";

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from LocalStorage on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await LocalStorage.getItem<string>(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Note[];
          setNotes(parsed);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Save notes to LocalStorage
  const saveNotes = useCallback(async (newNotes: Note[]) => {
    setNotes([...newNotes]);
    try {
      await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  }, []);

  // Add a new note
  const addNote = useCallback(async (note: Note) => {
    const trimmedNote = note.trim();
    if (trimmedNote) {
      await saveNotes([trimmedNote, ...notes]);
    }
  }, [notes, saveNotes]);

  // Delete a note by index
  const deleteNote = useCallback(async (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  // Clear all notes
  const clearAllNotes = useCallback(async () => {
    await saveNotes([]);
  }, [saveNotes]);

  return {
    notes,
    isLoading,
    addNote,
    deleteNote,
    clearAllNotes,
  };
}
