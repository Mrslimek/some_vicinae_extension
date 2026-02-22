import { Detail, Icon, Color } from "@vicinae/api";
import { memo } from "react";

interface MetadataPanelProps {
  selectedTab: "notifications" | "notes";
  notesCount: number;
  notificationsCount: number;
}

/**
 * Static metadata panel component
 * Shows time when extension opens, battery info, and system details
 * No live updates to prevent scroll position resets in the Detail component
 */
export const MetadataPanel = memo(function MetadataPanel({
  selectedTab,
  notesCount,
  notificationsCount,
}: MetadataPanelProps) {
  // Static values - captured when component first renders
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Detail.Metadata>
      {/* Time and Date - Static, captured at extension open */}
      <Detail.Metadata.Label title="Time" text={time} icon={Icon.Clock} />
      <Detail.Metadata.Label title="Date" text={date} icon={Icon.Calendar} />
      <Detail.Metadata.Separator />

      {/* Battery - Static, check dunstctl history for notifications */}
      {/* Statistics */}
      <Detail.Metadata.TagList title="Statistics">
        <Detail.Metadata.TagList.Item
          text={`${notesCount} notes`}
          color={selectedTab === "notes" ? Color.Blue : Color.SecondaryText}
        />
        <Detail.Metadata.TagList.Item
          text={`${notificationsCount} notifications`}
          color={
            selectedTab === "notifications" ? Color.Blue : Color.SecondaryText
          }
        />
      </Detail.Metadata.TagList>
    </Detail.Metadata>
  );
});
