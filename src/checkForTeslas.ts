import configPkg from '@murrayju/config';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';
import queryString from 'query-string';
import { sendMessage } from './sendMessage.js';

const { default: config } = configPkg;

type TeslaConfig = Record<string, Record<string, string>>;

interface Vehicle {
  VIN: string;
  AUTOPILOT: string[];
  City: string;
  Model: string;
  Price: number;
  PurchasePrice: number;
  StateProvince: string;
  TotalPrice: number;
  Year: number;
  Odometer: number;
  OdometerType: string;
}

const historyFile = config.get('data.history');
fs.ensureDirSync(path.dirname(historyFile));
const history: Record<string, Vehicle> = fs.existsSync(historyFile)
  ? fs.readJsonSync(historyFile)
  : {};

export const checkForTeslas = async () => {
  const baseQuery = config.get('tesla.baseQuery');

  await Object.entries(config.get('tesla.models') as TeslaConfig).reduce(
    async (outer, [modelName, modelParams]) => {
      await outer;
      console.info(`Searching for ${modelName}...`);
      await Object.entries(config.get('tesla.locations') as TeslaConfig).reduce(
        async (inner, [locationName, locationParams]) => {
          await inner;
          console.info(`  Looking in ${locationName}...`);
          const params = {
            ...baseQuery.query,
            ...modelParams,
            ...locationParams,
          };
          const url = queryString.stringifyUrl({
            url: config.get('tesla.baseUrl'),
            query: {
              query: JSON.stringify({
                ...baseQuery,
                query: params,
              }),
            },
          });
          try {
            const resp = await fetch(url, {
              headers: {
                Host: 'www.tesla.com',
                'Cache-Control': 'no-cache',
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
              },
            });
            const data = (await resp.json()) as Record<string, any>;
            const results: Vehicle[] =
              (Array.isArray(data.results)
                ? data.results
                : data.results?.exact) ?? [];
            console.log(`    Found ${results.length}`);
            await results.reduce(async (p, result) => {
              await p;
              if (!result.VIN) {
                console.error('    Vehicle without VIN', result);
              } else {
                if (!history[result.VIN]) {
                  history[result.VIN] = result;
                  const content = `There's a **${modelName}** near ${locationName}. ${
                    result.Year
                  }, $${result.TotalPrice}, ${result.Odometer} ${
                    result.OdometerType
                  }, ${result.City} ${result.StateProvince}. <${config.get(
                    'tesla.linkBaseUrl',
                  )}/${params.condition}/${result.VIN}>`;
                  console.log(`    ${content}`);
                  try {
                    await sendMessage({
                      content,
                    });
                  } catch (err) {
                    console.error('Failed to send to discord', err);
                  }
                }
              }
            }, Promise.resolve());
          } catch (err) {
            console.error(err);
          }
        },
        Promise.resolve(),
      );
    },
    Promise.resolve(),
  );
  await fs.writeJson(config.get('data.history'), history);
};
