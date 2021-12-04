import { run, setPkg } from 'build-strap';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

setPkg(require('../package.json'));

const resolveFn = async (path: string) => import(`./${path}.ts`);
const defaultAction = 'tsc';
const passthroughArgv = false;

const { argv } = process;
const module =
  argv.length > 2
    ? await resolveFn(argv[2])
    : typeof defaultAction === 'string'
    ? await resolveFn(defaultAction)
    : defaultAction;
const args = Array.isArray(passthroughArgv)
  ? passthroughArgv.includes(argv[2] || defaultAction)
    ? argv.slice(3)
    : []
  : passthroughArgv
  ? argv.slice(3)
  : [];

run(module, ...args).catch((err: Error) => {
  console.error((err && err.stack) || err);
  process.exit(1);
});
