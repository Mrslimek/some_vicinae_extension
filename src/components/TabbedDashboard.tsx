import {
  Detail,
  ActionPanel,
  Action,
  Icon,
  Clipboard,
  showToast,
  Color,
  useNavigation,
} from "@vicinae/api";
import { useState, useMemo, useCallback } from "react";
import { useNotes } from "../hooks/useNotes";
import { useNotifications } from "../hooks/useNotifications";
import { formatNotificationTime, getNotificationIcon } from "../utils/dunst";
import { AddNoteForm } from "./AddNoteForm";
import { NotesManager } from "./NotesManager";
import { MetadataPanel } from "./MetadataPanel";
import type { Note } from "../types";
import type { Notification as DunstNotification } from "../types";

type TabValue = "notifications" | "notes";

/**
 * Main dashboard component with tabs for Notes and Notifications
 * Uses Detail component with right-side metadata panel
 * Time and battery updates are isolated in MetadataPanel to prevent scroll resets
 */
export function TabbedDashboardContent() {
  const { push } = useNavigation();
  const [selectedTab, setSelectedTab] = useState<TabValue>("notifications");

  const { notes, addNote, deleteNote, clearAllNotes } = useNotes();
  const {
    notifications,
    isLoading: notificationsLoading,
    refresh: refreshNotifications,
  } = useNotifications();

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

  const handleCopyNotification = useCallback(
    async (notification: DunstNotification) => {
      const text = `[${notification.appname}] ${notification.summary}\n\n${notification.body}`;
      await Clipboard.copy(text);
      showToast({ title: "Copied to clipboard" });
    },
    [],
  );

  // Generate markdown for Notes tab
  const generateNotesMarkdown = useCallback((): string => {
    if (notes.length === 0) {
      return "_No notes yet. Press Enter to add one._";
    }
    return notes.map((note) => `* ${note}`).join("\n\n");
  }, [notes]);

  const notesMarkdown = useMemo(
    () => `
# 📝 Workspace Notes
---
${generateNotesMarkdown()}
`,
    [generateNotesMarkdown],
  );

  // Generate markdown for Notifications tab
  const generateNotificationsMarkdown = useCallback((): string => {
    if (notifications.length === 0) {
      return "_No notifications found. Dunst notification history is empty or dunst is not running._";
    }
    return notifications
      .map(
        (notif) => `
### ${getNotificationIcon(notif.appname, notif.icon_path)} ${notif.summary}
**${notif.appname}** • ${formatNotificationTime(notif.timestamp)}

${notif.body}

---
`,
      )
      .join("\n");
  }, [notifications]);

  const notificationsMarkdown = useMemo(
    () => `
# 🔔 Notifications (${notifications.length})
---
${generateNotificationsMarkdown()}
`,
    [generateNotificationsMarkdown, notifications.length],
  );

  const markdown = useMemo(
    () => (selectedTab === "notes" ? notesMarkdown : notificationsMarkdown),
    [selectedTab, notesMarkdown, notificationsMarkdown],
  );

  // Memoize the metadata panel to prevent it from causing Detail re-renders
  // when time/battery update
  const memoizedMetadata = useMemo(() => {
    return (
      <MetadataPanel
        selectedTab={selectedTab}
        notesCount={notes.length}
        notificationsCount={notifications.length}
      />
    );
  }, [selectedTab, notes.length, notifications.length]);

  return (
    <Detail
      key={selectedTab}
      markdown={markdown}
      actions={
        <ActionPanel>
          {/* Tab Switching - Press Enter to toggle */}
          <Action
            title={
              selectedTab === "notes" ? "Show Notifications" : "Show Notes"
            }
            icon={selectedTab === "notes" ? Icon.Bell : Icon.NewDocument}
            onAction={() =>
              setSelectedTab(
                selectedTab === "notes" ? "notifications" : "notes",
              )
            }
          />

          {/* Notes Actions */}
          {selectedTab === "notes" && (
            <>
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
            </>
          )}

          {/* Notifications Actions */}
          {selectedTab === "notifications" && (
            <>
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={refreshNotifications}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
              {notifications.length > 0 && (
                <Action
                  title="Copy Latest"
                  icon={Icon.CopyClipboard}
                  onAction={() =>
                    handleCopyNotification(
                      notifications[0] as DunstNotification,
                    )
                  }
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
              )}
            </>
          )}
        </ActionPanel>
      }
      metadata={memoizedMetadata}
    />
  );
}

// Memoize to prevent re-renders from parent
export { TabbedDashboardContent as TabbedDashboard };
