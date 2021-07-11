import { spawn } from 'build-strap';
import path from 'path';

export default async function dev() {
  await spawn('ts-node', ['./src/index.ts', '--', ...process.argv.slice(3)], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
  });
}
