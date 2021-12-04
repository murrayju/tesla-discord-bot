import { spawn } from 'build-strap';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function tsc() {
  await spawn('tsc', [], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
  });
}
