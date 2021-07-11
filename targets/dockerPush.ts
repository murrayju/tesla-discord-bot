import {
  dockerLogin,
  dockerPush,
  getDockerDigest,
  getDockerTags,
} from 'build-strap';
import fs from 'fs-extra';

// Push docker image to docker repo
export default async function doDockerPush() {
  await dockerLogin();
  const file = './latest.build.id';
  await fs.ensureFile(file);
  const buildId = (await fs.readFile(file)).toString();
  await dockerPush(
    (
      await getDockerTags(buildId)
    ).filter((t: string) => t.match(/^(?:latest.*|[0-9]+(?:\.[0-9]+)*)$/)),
  );
  await fs.writeFile('./latest.build.digest', await getDockerDigest(buildId));
}
