# DCS Web Client

A React + TypeScript + Vite application that powers the Distributed Computing Systems (DCS) learning assistant. The app showcases assignment walkthroughs, code snippets, and an in-browser AI chat helper backed by the DCS Code Assistant.

This guide explains how to clone, install, and run the project locally on Android using the Termux environment.

## Prerequisites

- Android device with the latest [Termux](https://f-droid.org/packages/com.termux/) installed (use the F-Droid release, not the Play Store version).
- Stable internet connection (initial install pulls ~200 MB of packages).
- Optional: Bluetooth keyboard or external display for a more comfortable coding setup.

## Quick Start on Termux

```bash
# 1. Update packages
pkg update && pkg upgrade

# 2. Install required tooling
pkg install git nodejs-lts openssl-tool

# 3. Enable corepack so we can use pnpm
corepack enable
corepack prepare pnpm@latest --activate

# 4. Clone the repository
git clone https://github.com/PrashantPatil10178/DCS.git
cd DCS

# 5. Install dependencies
pnpm install

# 6. Keep Termux awake while building (optional)
termux-wake-lock

# 7. Build the production bundle
pnpm run build

# 8. Serve the static dist/ folder on port 80 (requires root on most devices)
pnpm dlx serve dist --listen tcp://0.0.0.0:80
# or install globally once: pnpm add -g serve
# then run: serve dist --listen tcp://0.0.0.0:80

# 9. Open the app in a mobile browser
# Visit http://127.0.0.1/ or use your device IP if testing from another device
```

The static server stays active until you stop it with `Ctrl+C`. Run `termux-wake-unlock` when you're done to release the wake lock.

## Production Preview on Termux

```bash
# Build optimized assets
pnpm run build

# Preview the production build (uses the same port defaults)
pnpm run preview --host 0.0.0.0 --port 80

# Serve the static dist/ folder with the `serve` CLI (recommended for lightweight hosting)
pnpm dlx serve dist --listen tcp://0.0.0.0:80
# or install globally once: pnpm add -g serve
# then run: serve dist --listen tcp://0.0.0.0:80
```

`preview` serves the output from `dist/` and is useful when you want to test a production-like bundle without deploying elsewhere.

## Environment Notes

- **Port conflicts:** If 4173 is taken, pick any other available port and append `--port <number>` to the `dev` or `preview` command.
- **Agent endpoint:** When `VITE_AGENT_ENDPOINT` is unset, the chat falls back to the hosted DCS Code Assistant. Provide a different value if you self-host your own agent instance.
- **Persistence:** Termux keeps the repository inside your home directory. To free up storage, delete `node_modules/` and `dist/` when you are done (`rm -rf node_modules dist`).
- **Privileged ports:** Binding to port 80 usually requires root. On Termux use `tsu`/`sudo` or choose a higher port (e.g., 4173) if you do not have elevated privileges.

## Termux Toolkit Picks

- `pkg install termux-api` (plus the Termux:API app) unlocks clipboard, notifications, and other device features from the terminal.
- `pkg install tmux` lets you detach sessions so builds keep running even if Termux gets backgrounded.
- `pkg install htop ripgrep fd` provides lightweight process monitoring and fast file/code search.
- `pkg install openssh` enables remote SSH access from a laptop while the dev server runs on your phone.

## Troubleshooting

- **SSL issues while installing:** Run `pkg install tur-repo && pkg install ca-certificates` if you encounter certificate problems when cloning or installing packages.
- **Command not found: pnpm:** Ensure `corepack` is enabled (Step 3). You may need to restart the Termux session after activating corepack.
- **Slow install:** Use `pnpm install --frozen-lockfile` to stick to the lockfile and avoid network churn.

For deeper customization, refer to the standard Vite + React documentation and adjust scripts inside `package.json` as needed.
