import {
  Form,
  ActionPanel,
  Action,
  useNavigation,
  showToast,
} from "@vicinae/api";
import type { Note } from "../types";
import { AppIcons } from "../utils/icons";

interface AddNoteFormProps {
  currentNotes: Note[];
  onSave: (newNotes: Note[]) => Promise<void>;
}

/**
 * Form component for adding new notes to the dashboard
 * Provides a text area for note entry and handles the save operation
 */
export function AddNoteForm({ currentNotes, onSave }: AddNoteFormProps) {
  const { pop } = useNavigation();

  const handleSubmit = async (values: any) => {
    const trimmedNote = values.noteText?.trim() || "";
    if (trimmedNote) {
      await onSave([trimmedNote, ...currentNotes]);
      showToast({ title: "Note added" });
      pop();
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Note"
            icon={AppIcons.Save}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea id="noteText" title="Content" />
    </Form>
  );
}
