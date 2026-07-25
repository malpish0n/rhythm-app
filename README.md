# Rhythm

A local-first activity and habit tracker for Mac and iOS. Log activities on a traditional calendar, see a GitHub-style contribution heatmap as a secondary view, track streaks, and schedule recurring plans ("every Tuesday", "every 2 weeks") ahead of time — all with no account, no backend, and no sync. Everything is stored in a local SQLite database.

Built with Electron + React + TypeScript + Tailwind CSS + Framer Motion on desktop, and Capacitor for iOS.

## Requirements

- Node.js 18+ and npm
- macOS (for building/running the iOS target via Xcode)
- Xcode, only if you want to run the iOS app

## Running the desktop app (Mac)

```bash
npm install
npm run dev
```

This starts `electron-vite` in dev mode (hot-reloading renderer + auto-rebuilding main/preload) and launches the Electron window automatically.

### Building a distributable Mac app

```bash
npm run build:mac
```

Output goes to `dist/`. (`npm run build:win` / `npm run build:linux` are also available if you ever build on those platforms.)

## Running on iOS (Capacitor)

The iOS app reuses the same renderer code, backed by `@capacitor-community/sqlite` instead of Electron's `better-sqlite3`.

```bash
npm run cap:sync   # builds the mobile renderer bundle and syncs it into the ios/ Xcode project
npm run cap:open   # opens the project in Xcode
```

From Xcode, pick a simulator or a connected device and hit Run. On a physical device you'll need your own Apple ID configured as a signing team in Xcode (Signing & Capabilities tab).

## Type checking

```bash
npm run typecheck
```

Runs `tsc --noEmit` across both the Electron main process and the renderer.

## Project structure

```
src/
  shared/        # types, SQL/schema, and pure business logic shared by Electron + Capacitor
  main/          # Electron main process: SQLite connection, migrations, IPC handlers
  preload/       # contextBridge-exposed API surface
  renderer/src/  # React app (components, hooks, state, themes)
ios/             # Capacitor-generated Xcode project (committed)
```

Data lives entirely on-device:
- Desktop: SQLite file under Electron's `userData` directory.
- iOS: SQLite file managed by the Capacitor SQLite plugin's sandboxed storage.

There is no server, no account system, and no cross-device sync — each device keeps its own local copy of your data.
