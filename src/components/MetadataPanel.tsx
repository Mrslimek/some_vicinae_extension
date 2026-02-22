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
      <Detail.Metadata.Label
        title="Check Notifications"
        text="Press Cmd+R"
        icon={Icon.Bell}
      />
      <Detail.Metadata.Label
        title="Refresh"
        text="Updates notifications"
        icon={Icon.ArrowClockwise}
      />
      <Detail.Metadata.Separator />

      {/* System Info */}
      <Detail.Metadata.Label
        title="User"
        text={process.env.USER || "vick"}
        icon={Icon.Person}
      />
      <Detail.Metadata.Label title="Host" text="hyprland" icon={Icon.Desktop} />
      <Detail.Metadata.Label title="OS" text="Arch Linux" icon={Icon.Globe01} />
      <Detail.Metadata.Separator />

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

      {/* Current View Indicator */}
      <Detail.Metadata.Separator />
      <Detail.Metadata.Label
        title="View"
        text={selectedTab === "notes" ? "📝 Notes" : "🔔 Notifications"}
        icon={selectedTab === "notes" ? Icon.NewDocument : Icon.Bell}
      />
    </Detail.Metadata>
  );
});
