import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface FastfetchModule {
  type: string;
  result: any;
}

interface BatteryInfo {
  capacity: number;
  status: string;
  manufacturer?: string;
  modelName?: string;
}

interface CPUInfo {
  name: string;
  cores: number;
  frequency: string;
}

interface MemoryInfo {
  total: string;
  used: string;
  percent: number;
}

interface DisplayInfo {
  name: string;
  resolution: string;
  refreshRate: number;
}

interface DiskInfo {
  name: string;
  used: string;
  total: string;
  percent: number;
}

export interface ParsedFastfetchData {
  // Common info
  os: string;
  architecture: string;
  kernel: string;
  kernelVersion: string;
  uptime: string;
  host: string;
  hostVendor: string;
  battery?: BatteryInfo;
  localIp?: string;
  locale?: string;

  // System info
  cpu?: CPUInfo;
  gpu?: string[];
  memory?: MemoryInfo;
  display?: DisplayInfo;
  disk?: DiskInfo[];
  shell?: string;
  shellVersion?: string;
  terminal?: string;
  terminalVersion?: string;
  terminalFont?: string;
  packages?: string;
  wm?: string;
  wmVersion?: string;
  wmProtocol?: string;
  theme?: string;
  icons?: string;
  font?: string;
  cursor?: string;
}

/**
 * Executes fastfetch command and returns parsed data
 * Uses --format json to get structured output
 */
export async function getFastfetchData(): Promise<FastfetchModule[] | null> {
  try {
    const { stdout } = await execAsync("fastfetch --format json");
    const data = JSON.parse(stdout);
    return data;
  } catch (error) {
    console.error("Error executing fastfetch:", error);
    return null;
  }
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(1) + " GB";
}

/**
 * Format uptime milliseconds to human readable time
 * fastfetch returns uptime in milliseconds (seconds * 1000)
 */
function formatUptime(milliseconds: number): string {
  // Convert milliseconds to seconds (fastfetch stores uptime as milliseconds)
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Extract battery information from fastfetch result
 */
function extractBatteryInfo(result: any): BatteryInfo | null {
  if (!result) return null;

  if (Array.isArray(result)) {
    if (result.length === 0) return null;
    const battery = result[0];
    if (battery.capacity !== undefined) {
      return {
        capacity: Math.round(battery.capacity),
        status: battery.status || "Unknown",
        manufacturer: battery.manufacturer,
        modelName: battery.modelName,
      };
    }
    return null;
  }

  if (typeof result === "object" && result.capacity !== undefined) {
    return {
      capacity: Math.round(result.capacity),
      status: result.status || "Unknown",
      manufacturer: result.manufacturer,
      modelName: result.modelName,
    };
  }

  return null;
}

/**
 * Extract CPU information
 */
function extractCPUInfo(result: any): CPUInfo | null {
  if (!result || typeof result !== "object") return null;

  const name = result.cpu || result.name;
  if (!name) return null;

  const cores = result.cores?.physical || result.cores?.logical || 0;
  const maxFreq = result.frequency?.max || result.frequency;
  const freqStr = maxFreq ? `${(maxFreq / 1000).toFixed(1)} GHz` : "";

  return { name, cores, frequency: freqStr };
}

/**
 * Extract memory information
 */
function extractMemoryInfo(result: any): MemoryInfo | null {
  if (!result || typeof result !== "object") return null;

  const total = result.total;
  const used = result.used;

  if (total === undefined || used === undefined) return null;

  const percent = Math.round((used / total) * 100);

  return {
    total: formatBytes(total),
    used: formatBytes(used),
    percent,
  };
}

/**
 * Extract display information
 */
function extractDisplayInfo(result: any): DisplayInfo | null {
  if (!result) return null;

  const displays = Array.isArray(result) ? result : [result];
  if (displays.length === 0) return null;

  const display = displays[0];
  const name = display.name || "Unknown";
  const output = display.output;
  const resolution = output ? `${output.width}x${output.height}` : "Unknown";
  const refreshRate = output?.refreshRate || 0;

  return { name, resolution, refreshRate };
}

/**
 * Extract disk information
 */
function extractDiskInfo(result: any): DiskInfo[] | null {
  if (!result) return null;

  const disks = Array.isArray(result) ? result : [result];
  if (disks.length === 0) return null;

  return disks.map((disk: any) => {
    const name = disk.mountpoint || disk.name || "Unknown";
    const total = disk.bytes?.total;
    const used = disk.bytes?.used;

    const totalStr = total ? formatBytes(total) : "Unknown";
    const usedStr = used ? formatBytes(used) : "Unknown";
    const percent = total && used ? Math.round((used / total) * 100) : 0;

    return {
      name,
      used: usedStr,
      total: totalStr,
      percent,
    };
  }).filter((disk: DiskInfo) => disk.name !== "/var/cache/pacman/pkg" && disk.name !== "/var/log");
}

/**
 * Parse fastfetch JSON data into structured format
 */
export async function parseFastfetchData(): Promise<ParsedFastfetchData | null> {
  const data = await getFastfetchData();

  if (!data || !Array.isArray(data)) {
    return null;
  }

  const parsed: ParsedFastfetchData = {
    os: "",
    architecture: "",
    kernel: "",
    kernelVersion: "",
    uptime: "",
    host: "",
    hostVendor: "",
  };

  for (const module of data) {
    if (!module.type || module.type === "Separator" || module.type === "Title") {
      continue;
    }

    const result = module.result;
    if (!result) continue;

    switch (module.type) {
      case "OS":
        parsed.os = result.prettyName || result.name || "";
        break;

      case "Kernel":
        parsed.kernel = result.name || "";
        parsed.kernelVersion = result.release || "";
        parsed.architecture = result.architecture || "";
        break;

      case "Uptime":
        parsed.uptime = result.uptime ? formatUptime(result.uptime) : "";
        break;

      case "Host":
        parsed.host = result.name || result.product || "";
        parsed.hostVendor = result.vendor || "";
        break;

      case "Battery":
        parsed.battery = extractBatteryInfo(result);
        break;

      case "CPU":
        parsed.cpu = extractCPUInfo(result);
        break;

      case "GPU":
        if (Array.isArray(result)) {
          parsed.gpu = result.map((gpu: any) => gpu.name).filter(Boolean);
        } else if (result.name) {
          parsed.gpu = [result.name];
        }
        break;

      case "Memory":
        parsed.memory = extractMemoryInfo(result);
        break;

      case "Display":
        parsed.display = extractDisplayInfo(result);
        break;

      case "Disk":
        parsed.disk = extractDiskInfo(result);
        break;

      case "Shell":
        parsed.shell = result.prettyName || result.exeName || "";
        parsed.shellVersion = result.version || "";
        break;

      case "Terminal":
        parsed.terminal = result.prettyName || result.processName || "";
        parsed.terminalVersion = result.version || "";
        break;

      case "TerminalFont":
        if (result.font?.pretty) {
          parsed.terminalFont = result.font.pretty;
        }
        break;

      case "Packages":
        if (result.all) {
          parsed.packages = `${result.all} packages`;
        } else if (result.pacman) {
          parsed.packages = `${result.pacman} (pacman)`;
        }
        break;

      case "WM":
        parsed.wm = result.prettyName || result.processName || "";
        parsed.wmVersion = result.version || "";
        parsed.wmProtocol = result.protocolName || "";
        break;

      case "Theme":
        if (result.theme1 || result.theme2) {
          parsed.theme = [result.theme1, result.theme2].filter(Boolean).join(" | ");
        }
        break;

      case "Icons":
        if (result.icons1 || result.icons2) {
          parsed.icons = [result.icons1, result.icons2].filter(Boolean).join(" | ");
        }
        break;

      case "Font":
        if (result.display) {
          parsed.font = result.display;
        }
        break;

      case "Cursor":
        if (result.theme) {
          parsed.cursor = result.theme;
        }
        break;

      case "LocalIp":
        if (Array.isArray(result) && result.length > 0) {
          parsed.localIp = result[0].ipv4 || "";
        }
        break;

      case "Locale":
        parsed.locale = result;
        break;
    }
  }

  return parsed;
}
