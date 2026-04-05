import {
  Detail,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Color,
} from "@vicinae/api";
import { useState, useEffect, useMemo } from "react";
import { parseFastfetchData } from "../utils/fastfetch";

/**
 * Get battery color based on capacity
 */
function getBatteryColor(capacity: number): Color {
  if (capacity <= 15) return Color.Red;
  if (capacity <= 30) return Color.Orange;
  return Color.Green;
}

/**
 * Get memory color based on usage percentage
 */
function getMemoryColor(percent: number): Color {
  if (percent >= 90) return Color.Red;
  if (percent >= 70) return Color.Orange;
  return Color.Green;
}

/**
 * Get disk color based on usage percentage
 */
function getDiskColor(percent: number): Color {
  if (percent >= 90) return Color.Red;
  if (percent >= 70) return Color.Orange;
  return Color.Green;
}

/**
 * Main dashboard component with all system information
 * Uses fastfetch to gather system information
 */
export function Dashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof parseFastfetchData>>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await parseFastfetchData();
      setData(result);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    const result = await parseFastfetchData();
    setData(result);
    setIsLoading(false);
    showToast({ title: "Data refreshed" });
  };

  // Generate markdown with all information
  const markdown = useMemo(() => {
    if (isLoading) {
      return "# Loading...\n\n_Gathering system information..._";
    }

    if (!data) {
      return "# Error\n\n_Failed to fetch system information._";
    }

    let markdown = "# System Information\n\n---\n\n";

    // System Info
    if (data.os || data.kernel || data.architecture) {
      markdown += "## System\n\n";
      if (data.os) markdown += `OS: ${data.os}\n\n`;
      if (data.kernel) markdown += `Kernel: ${data.kernel}\n\n`;
      if (data.kernelVersion) markdown += `Kernel Version: ${data.kernelVersion}\n\n`;
      if (data.architecture) markdown += `Architecture: ${data.architecture}\n\n`;
      markdown += "---\n\n";
    }

    // Hardware
    if (data.cpu || (data.gpu && data.gpu.length > 0) || data.memory) {
      markdown += "## Hardware\n\n";
      if (data.cpu) {
        markdown += `CPU: ${data.cpu.name}\n\n`;
        markdown += `Cores: ${data.cpu.cores}\n\n`;
        if (data.cpu.frequency) markdown += `Frequency: ${data.cpu.frequency}\n\n`;
      }
      if (data.gpu && data.gpu.length > 0) {
        markdown += `GPU: ${data.gpu[0]}\n\n`;
        if (data.gpu.length > 1) markdown += `GPU 2: ${data.gpu[1]}\n\n`;
      }
      if (data.memory) {
        markdown += `Memory: ${data.memory.used} / ${data.memory.total} (${data.memory.percent}%)\n\n`;
      }
      markdown += "---\n\n";
    }

    // Display
    if (data.display) {
      markdown += "## Display\n\n";
      markdown += `Name: ${data.display.name}\n\n`;
      markdown += `Resolution: ${data.display.resolution}\n\n`;
      if (data.display.refreshRate > 0) markdown += `Refresh Rate: ${data.display.refreshRate} Hz\n\n`;
      markdown += "---\n\n";
    }

    // Storage
    if (data.disk && data.disk.length > 0) {
      markdown += "## Storage\n\n";
      data.disk.forEach((disk) => {
        markdown += `${disk.name}: ${disk.used} / ${disk.total} (${disk.percent}%)\n\n`;
      });
      markdown += "---\n\n";
    }

    // Software
    if (data.shell || data.terminal || data.packages || data.wm) {
      markdown += "## Software\n\n";
      if (data.shell) {
        markdown += `Shell: ${data.shell}`;
        if (data.shellVersion) markdown += ` ${data.shellVersion}`;
        markdown += "\n\n";
      }
      if (data.terminal) {
        markdown += `Terminal: ${data.terminal}`;
        if (data.terminalVersion) markdown += ` ${data.terminalVersion}`;
        markdown += "\n\n";
      }
      if (data.terminalFont) markdown += `Terminal Font: ${data.terminalFont}\n\n`;
      if (data.packages) markdown += `Packages: ${data.packages}\n\n`;
      if (data.wm) {
        markdown += `WM: ${data.wm}`;
        if (data.wmVersion) markdown += ` ${data.wmVersion}`;
        if (data.wmProtocol) markdown += ` (${data.wmProtocol})`;
        markdown += "\n\n";
      }
      markdown += "---\n\n";
    }

    // Appearance
    if (data.theme || data.icons || data.font || data.cursor) {
      markdown += "## Appearance\n\n";
      if (data.theme) markdown += `Theme: ${data.theme}\n\n`;
      if (data.icons) markdown += `Icons: ${data.icons}\n\n`;
      if (data.font) markdown += `Font: ${data.font}\n\n`;
      if (data.cursor) markdown += `Cursor: ${data.cursor}\n\n`;
      markdown += "---\n\n";
    }

    // Network
    if (data.localIp) {
      markdown += "## Network\n\n";
      markdown += `Local IP: ${data.localIp}\n\n`;
      markdown += "---\n\n";
    }

    // Locale
    if (data.locale) {
      markdown += "## Locale\n\n";
      markdown += `Locale: ${data.locale}\n\n`;
    }

    return markdown;
  }, [data, isLoading]);

  // Generate metadata for right panel (most important info)
  const metadata = useMemo(() => {
    return (
      <Detail.Metadata>
        {/* Time and Date */}
        <Detail.Metadata.Label
          title="Time"
          text={currentTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
          icon={Icon.Clock}
        />
        <Detail.Metadata.Label
          title="Date"
          text={currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          icon={Icon.Calendar}
        />
        <Detail.Metadata.Separator />

        {/* Battery */}
        {!isLoading && data && data.battery && (
          <>
            <Detail.Metadata.Label
              title="Battery"
              text={`${data.battery.capacity}%`}
              icon={Icon.Battery}
            />
            <Detail.Metadata.TagList title="Status">
              <Detail.Metadata.TagList.Item
                text={data.battery.status}
                color={getBatteryColor(data.battery.capacity)}
              />
            </Detail.Metadata.TagList>
            <Detail.Metadata.Separator />
          </>
        )}

        {/* System */}
        {!isLoading && data && (
          <>
            <Detail.Metadata.Label title="OS" text={data.os || "Unknown"} />
            {data.cpu && (
              <Detail.Metadata.Label title="CPU" text={data.cpu.name} />
            )}
            {data.wm && (
              <Detail.Metadata.Label title="Compositor" text={data.wm} />
            )}
            <Detail.Metadata.Label title="Host" text={data.host || "Unknown"} />
            <Detail.Metadata.Label title="Uptime" text={data.uptime || "Unknown"} />
            <Detail.Metadata.Separator />
          </>
        )}

        {/* Resources */}
        {!isLoading && data && data.memory && (
          <>
            <Detail.Metadata.Label
              title="Memory"
              text={`${data.memory.used} / ${data.memory.total}`}
              icon={Icon.Memory}
            />
            <Detail.Metadata.TagList title="Usage">
              <Detail.Metadata.TagList.Item
                text={`${data.memory.percent}%`}
                color={getMemoryColor(data.memory.percent)}
              />
            </Detail.Metadata.TagList>
            <Detail.Metadata.Separator />
          </>
        )}

        {/* Storage */}
        {!isLoading && data && data.disk && data.disk.length > 0 && (
          <>
            <Detail.Metadata.Label
              title="Storage"
              text={data.disk[0].name}
              icon={Icon.HardDrive}
            />
            <Detail.Metadata.Label
              title="Usage"
              text={`${data.disk[0].used} / ${data.disk[0].total}`}
            />
            <Detail.Metadata.TagList title="Used">
              <Detail.Metadata.TagList.Item
                text={`${data.disk[0].percent}%`}
                color={getDiskColor(data.disk[0].percent)}
              />
            </Detail.Metadata.TagList>
          </>
        )}
      </Detail.Metadata>
    );
  }, [data, isLoading, currentTime]);

  return (
    <Detail
      markdown={markdown}
      metadata={metadata}
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={handleRefresh}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    />
  );
}
