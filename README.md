# System Information Dashboard

A Vicinae extension that displays system information using fastfetch with organized tabs for common and system details.

## Features

- 📊 **Common Information Tab**: Date, time, battery, OS, kernel, host, uptime
- 🖥️ **System Information Tab**: CPU, GPU, memory, disk, display, software details
- 🔄 **Auto-refresh**: Get the latest system information with keyboard shortcut
- 🎨 **Clean Interface**: Organized and formatted display of system metrics

## Requirements

- `fastfetch` must be installed on your system
- Install fastfetch: `sudo pacman -S fastfetch` (Arch Linux) or equivalent for your distro

## Installation

Install the required dependencies:

```bash
npm install
```

## Development

Run the extension in development mode:

```bash
npm run dev
```

## Build

Build the production bundle:

```bash
npm run build
```

## Usage

1. Open the extension in Vicinae
2. View common information like battery, time, and system basics
3. Switch to System tab for detailed hardware and software information
4. Press `Cmd+R` to refresh the data

## Built With

- Vicinae API - Extension framework
- fastfetch - System information tool
- TypeScript - Type safety
- React - UI components
