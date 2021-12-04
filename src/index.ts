import configPkg from '@murrayju/config';
import { CronJob } from 'cron';

import { checkForTeslas } from './checkForTeslas.js';

const { default: config } = configPkg;

if (process.argv.includes('--once')) {
  console.info('Single run mode...');
  checkForTeslas().then(() => process.exit());
} else {
  const cronJob = new CronJob(
    config.get('cron.interval'),
    checkForTeslas,
    null,
    true,
    undefined,
    undefined,
    true,
  );

  process.on('SIGINT', () => {
    console.log('Exiting...');
    cronJob.stop();
    process.exit(0);
  });
}
