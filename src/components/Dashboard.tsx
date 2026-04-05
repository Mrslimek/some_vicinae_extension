import {
  Detail,
  ActionPanel,
  Action,
  Icon,
  useNavigation,
} from "@vicinae/api";
import { useMemo, useCallback } from "react";
import { useNotes } from "../hooks/useNotes";
import { AddNoteForm } from "./AddNoteForm";
import { NotesManager } from "./NotesManager";
import { MetadataPanel } from "./MetadataPanel";
import type { Note } from "../types";

/**
 * Main dashboard component for Notes
 * Uses Detail component with right-side metadata panel
 * Time and battery updates are isolated in MetadataPanel to prevent scroll resets
 */
export function Dashboard() {
  const { push } = useNavigation();

  const { notes, addNote, deleteNote, clearAllNotes } = useNotes();

  const handleSaveNotes = async (newNotes: Note[]) => {
    if (newNotes.length < notes.length) {
      const deletedIndex = notes.findIndex((note) => !newNotes.includes(note));
      if (deletedIndex !== -1) {
        await deleteNote(deletedIndex);
      }
    } else if (newNotes.length > notes.length) {
      const newNote = newNotes.find((note) => !notes.includes(note));
      if (newNote) {
        await addNote(newNote);
      }
    } else {
      if (newNotes.length === 0) {
        await clearAllNotes();
      }
    }
  };

  // Generate markdown for Notes
  const generateNotesMarkdown = useCallback((): string => {
    if (notes.length === 0) {
      return "_No notes yet. Press Enter to add one._";
    }
    return notes.map((note) => `* ${note}`).join("\n\n");
  }, [notes]);

  const markdown = useMemo(
    () => `
# 📝 Workspace Notes
---
${generateNotesMarkdown()}
`,
    [generateNotesMarkdown],
  );

  // Memoize the metadata panel to prevent it from causing Detail re-renders
  // when time/battery update
  const memoizedMetadata = useMemo(() => {
    return (
      <MetadataPanel
        notesCount={notes.length}
      />
    );
  }, [notes.length]);

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Add Note"
            icon={Icon.Plus}
            onAction={() =>
              push(
                <AddNoteForm
                  currentNotes={notes}
                  onSave={handleSaveNotes}
                />,
              )
            }
          />
          <Action
            title="Manage Notes"
            icon={Icon.CheckList}
            onAction={() =>
              push(<NotesManager notes={notes} onSave={handleSaveNotes} />)
            }
          />
        </ActionPanel>
      }
      metadata={memoizedMetadata}
    />
  );
}
