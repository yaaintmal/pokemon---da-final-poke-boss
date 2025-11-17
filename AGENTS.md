# AGENTS.md

## Build/Lint/Test Commands
- **Frontend**: `cd frontend && npm run dev` (dev server), `npm run build` (production build)
- **Backend**: `cd server && npm start` (runs server with --env-file)
- **CLI**: `cd playground && node index.js` (run the Pokemon CLI game)
- **Test Commands**: Frontend `cd frontend && npm test` (all tests), `npm run test:single <file>` (single test file)

## Code Style Guidelines
- **Imports**: Use relative paths; group React imports first, then third-party, then local utilities.
- **Formatting**: 2-space indentation; consistent JSX with proper closing tags; unique keys in lists.
- **Types**: No TypeScript; use JSDoc for function params/returns if needed for clarity.
- **Naming**: camelCase for variables/functions, PascalCase for components; descriptive names.
- **Error Handling**: Try/catch for async ops; console.warn/error for logging; graceful fallbacks.
- **Async**: Prefer async/await; handle promise rejections; avoid nested promises.
- **Components**: Functional with hooks (useState, useEffect); avoid class components.
- **State Management**: Use React Context for global state; local state for component-specific data.
- **Styling**: Tailwind CSS classes or inline styles; maintain arcade/MK theme with amber accents.
- **Environment**: Use .env files; access via import.meta.env (frontend) or process.env (backend).
- **Testing**: Jest for unit tests; @testing-library/react for components; mock APIs/external deps.
- **File Structure**: Group by feature (components/, game/, util/); keep files small and focused.
- **Commits**: Use descriptive messages; follow conventional commits if applicable.

No Cursor or Copilot rules found.