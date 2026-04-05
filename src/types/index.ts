export interface BatteryInfo {
  capacity: number;
  status: "Charging" | "Discharging" | "Full" | "Unknown";
  icon?: string;
}

export interface FastfetchData {
  // Common Information
  os: string;
  kernel: string;
  uptime: string;
  host: string;
  battery: BatteryInfo;

  // System Information
  cpu: string;
  gpu: string;
  memory: string;
  disk: string;
  shell: string;
  terminal: string;
  packages: string;
  resolution: string;
  theme: string;
  icons: string;
  font: string;
  wm: string;
}

export interface FastfetchModule {
  type: string;
  text: string;
  key?: string;
}
