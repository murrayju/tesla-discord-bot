import { spawn } from 'build-strap';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function dev() {
  await spawn(
    'node',
    [
      '--loader',
      'ts-node/esm',
      './src/index.ts',
      '--',
      ...process.argv.slice(3),
    ],
    {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    },
  );
}
