import { spawn } from 'build-strap';
import path from 'path';

export default async function tsc() {
  await spawn('tsc', [], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
  });
}
