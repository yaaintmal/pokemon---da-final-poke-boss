# Version Control Setup

## Overview
A version badge is now displayed in the upper right corner of the game. The version is automatically read from the root `package.json` and displayed as `v{VERSION}` (e.g., `v1.0.0`).

## How to Update Version

To update the game version, simply modify the `version` field in `/package.json`:

```json
{
  "name": "wbs",
  "version": "1.2.3",  // Change this number
  ...
}
```

### Version Format
Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes (e.g., `1.0.0` → `2.0.0`)
- **MINOR**: New features (e.g., `1.0.0` → `1.1.0`)
- **PATCH**: Bug fixes (e.g., `1.0.0` → `1.0.1`)

Examples:
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature added
- `2.0.0` - Major overhaul

## Version Badge Display

The version badge appears in the upper right corner with:
- **Styling**: Arcade/DOOM themed with amber accent
- **Hover Effect**: Changes to amber background with shadow effect
- **Position**: Fixed, top-right with small padding
- **Tooltip**: Hover to see full version info

## Implementation Details

### Files Updated:
1. **`App.jsx`**: Imports and renders `VersionBadge` component
2. **`components/VersionBadge.jsx`**: New component that reads version from `import.meta.env.VITE_APP_VERSION`
3. **`vite.config.js`**: Reads `package.json` and passes version as environment variable
4. **`arcade-doom.css`**: New styles for `.version-badge`

### How It Works:
1. Vite reads `package.json` at build time
2. Version is injected as `import.meta.env.VITE_APP_VERSION`
3. `VersionBadge` component displays it
4. The badge automatically updates when you rebuild with a new version

## Testing

Build and run to see the version badge:
```bash
cd frontend && npm run build
npm run preview  # View production build locally
```

Or during development:
```bash
cd frontend && npm run dev
# Badge updates immediately when you change package.json version
```
