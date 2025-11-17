import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from root package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
const appVersion = packageJson.version;

export default {
  server: {
    port: 3003,
    proxy: {
      '/api': 'http://localhost:3006'
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  }
}

