import { List, ActionPanel, Action, showToast } from "@vicinae/api";
import { useState } from "react";
import type { Note } from "../types";
import { AppIcons } from "../utils/icons";

interface NotesManagerProps {
  notes: Note[];
  onSave: (newNotes: Note[]) => Promise<void>;
}

/**
 * Component for managing and deleting notes
 * Displays a searchable list of notes with delete actions
 */
export function NotesManager({ notes, onSave }: NotesManagerProps) {
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);

  const handleDelete = async (indexToDelete: number) => {
    const newNotes = localNotes.filter((_, index) => index !== indexToDelete);
    setLocalNotes(newNotes);
    await onSave(newNotes);
    showToast({ title: "Deleted" });
  };

  return (
    <List searchBarPlaceholder="Search notes to delete...">
      {localNotes.length === 0 ? (
        <List.EmptyView title="No notes found" icon={AppIcons.Info} />
      ) : (
        localNotes.map((note, index) => (
          <List.Item
            key={index}
            title={note}
            icon={AppIcons.Note}
            actions={
              <ActionPanel>
                <Action
                  title="Delete Note"
                  icon={AppIcons.Delete}
                  style={Action.Style.Destructive}
                  onAction={() => handleDelete(index)}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
