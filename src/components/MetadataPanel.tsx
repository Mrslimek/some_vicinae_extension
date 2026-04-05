import { Detail, Icon, Color } from "@vicinae/api";
import { memo } from "react";
import { useBattery } from "../hooks/useBattery";

interface MetadataPanelProps {
  notesCount: number;
}

/**
 * Static metadata panel component
 * Shows time when extension opens, battery info, and system details
 * No live updates to prevent scroll position resets in the Detail component
 */
export const MetadataPanel = memo(function MetadataPanel({
  notesCount,
}: MetadataPanelProps) {
  // Get battery information
  const batteryInfo = useBattery();

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

  // Get battery color
  const getBatteryColor = (capacity: number): Color => {
    if (capacity <= 15) return Color.Red;
    if (capacity <= 30) return Color.Orange;
    return Color.Green;
  };

  return (
    <Detail.Metadata>
      {/* Time and Date - Static, captured at extension open */}
      <Detail.Metadata.Label title="Time" text={time} icon={Icon.Clock} />
      <Detail.Metadata.Label title="Date" text={date} icon={Icon.Calendar} />
      <Detail.Metadata.Separator />

      {/* Battery Information */}
      {batteryInfo && (
        <>
          <Detail.Metadata.Label
            title="Battery"
            text={`${batteryInfo.capacity}%`}
            icon={Icon.Battery}
          />
          {batteryInfo.status !== "Unknown" && (
            <Detail.Metadata.TagList title="Status">
              <Detail.Metadata.TagList.Item
                text={`${batteryInfo.icon} ${batteryInfo.status}`}
                color={getBatteryColor(batteryInfo.capacity)}
              />
            </Detail.Metadata.TagList>
          )}
          <Detail.Metadata.Separator />
        </>
      )}

      {/* Statistics */}
      <Detail.Metadata.TagList title="Statistics">
        <Detail.Metadata.TagList.Item
          text={`${notesCount} notes`}
          color={Color.Blue}
        />
      </Detail.Metadata.TagList>
    </Detail.Metadata>
  );
});
