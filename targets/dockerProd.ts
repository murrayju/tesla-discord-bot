// @flow
import {
  buildLog,
  dockerContainerRun,
  dockerImages,
  dockerComposeTeardown,
  getDockerRepo,
  onKillSignal,
  run,
} from 'build-strap';
import fs from 'fs-extra';

import docker, { getBuildImage, getBuildTag } from './docker';

// Run the production docker image
export default async function dockerProd(
  build: boolean = process.argv.includes('--build-docker'),
) {
  await fs.ensureFile('./latest.build.tag');
  const tag = await getBuildTag();
  if (
    build ||
    !(await dockerImages(getDockerRepo())).find((m: any) => m.tag === tag)
  ) {
    buildLog('Image does not exist, running docker build...');
    await run(docker);
  }

  let cleaning: Promise<void> | null = null;
  const cleanupAndExit = async () => {
    if (!cleaning) {
      cleaning = (async () => {
        buildLog('Process exiting... cleaning up...');
        await dockerComposeTeardown();
        process.exit();
      })();
    }
    return cleaning;
  };

  onKillSignal(cleanupAndExit);

  try {
    // Run the tests in the builder container
    await dockerContainerRun({
      runArgs: ['--rm', '-it'],
      image: await getBuildImage(tag),
    });
  } finally {
    // cleanup
    await cleanupAndExit();
  }
}
