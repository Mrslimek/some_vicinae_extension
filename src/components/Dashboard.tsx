import {
  Detail,
  ActionPanel,
  Action,
  Color,
  useNavigation,
  showToast,
} from "@vicinae/api";
import { useNotes } from "../hooks/useNotes";
import { useTime } from "../hooks/useTime";
import { useBattery, getBatteryStatusColor } from "../hooks/useBattery";
import { AddNoteForm } from "./AddNoteForm";
import { NotesManager } from "./NotesManager";
import { AppIcons } from "../utils/icons";
import type { Note } from "../types";

interface DashboardProps {
  notes: Note[];
  onSave: (newNotes: Note[]) => Promise<void>;
}

/**
 * Main dashboard component displaying notes, time, date, and battery status
 * Provides actions for note management (add, view, delete)
 */
export function Dashboard({ notes, onSave }: DashboardProps) {
  const { push } = useNavigation();
  const { time, date } = useTime();
  const batteryInfo = useBattery();

  // Generate markdown content from notes
  const generateMarkdown = (): string => {
    if (notes.length === 0) {
      return "_No notes yet. Press Enter to add one._";
    }
    return notes.map((note) => `* ${note}`).join("\n\n");
  };

  const fullMarkdown = `
# 📝 Workspace Notes
---
${generateMarkdown()}
  `;

  const batteryColor = getBatteryStatusColor(batteryInfo);

  return (
    <Detail
      key={notes.length}
      markdown={fullMarkdown}
      actions={
        <ActionPanel>
          <Action
            title="Add Note"
            icon={AppIcons.Add}
            onAction={() =>
              push(<AddNoteForm currentNotes={notes} onSave={onSave} />)
            }
          />

          <Action
            title="Manage / Delete Notes"
            icon={AppIcons.List}
            onAction={() =>
              push(<NotesManager notes={notes} onSave={onSave} />)
            }
          />

          <ActionPanel.Section title="Danger Zone">
            <Action
              title="Clear All"
              icon={AppIcons.Delete}
              style={Action.Style.Destructive}
              onAction={async () => {
                await onSave([]);
                showToast({ title: "All cleared" });
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Time"
            text={time}
            icon={AppIcons.Time}
          />
          <Detail.Metadata.Label
            title="Date"
            text={date}
            icon={AppIcons.Date}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="User"
            text={process.env.USER || "vick"}
            icon={AppIcons.User}
          />
          <Detail.Metadata.Label
            title="Host"
            text="hyprland"
            icon={AppIcons.Host}
          />
          <Detail.Metadata.Label
            title="OS"
            text="Arch Linux"
            icon={AppIcons.Globe}
          />
          <Detail.Metadata.Separator />
          {/* Battery Information */}
          {batteryInfo && (
            <>
              <Detail.Metadata.Label
                title="Battery"
                text={`${batteryInfo.capacity}%`}
                icon={AppIcons.Battery}
              />
              <Detail.Metadata.Label title="Status" text={batteryInfo.status} />
            </>
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Statistics">
            <Detail.Metadata.TagList.Item
              text={`${notes.length} notes`}
              color={notes.length > 0 ? Color.Blue : Color.SecondaryText}
            />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
