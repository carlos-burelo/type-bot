import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { CurrencyI } from './core/types';
/**
 * Returns an alert if there is no
 * Environment variable and stop the deployment
 * from the bot.
 */
export const noEnv = (env: string): never => {
  const template =
    `==========================================` +
    `\n\t${env} is Missing\n` +
    `==========================================`;
  console.clear();
  console.log(template);
  throw new Error(`${env} variable is missing`);
};

export const data = 'Bonjour';
/**
 * Root directory of the project
 */
export const rootDir: string = __dirname;
/**
 * Download directory of the project
 */
export const downloadDir: string = resolve(__dirname, 'downloads');
/**
 * JSON database directory
 */
export const databasesDir: string = resolve(__dirname, 'databases');
/**
 * Directory of the files of
 * translation.
 */
export const localesDir: string = resolve(__dirname, 'core', 'locales');
/**
 * Verify the existence of the
 * Main directories and in case
 * No existence, creates them.
 */
export function makeDirs(): void {
  if (existsSync(resolve(downloadDir)) == false) {
    mkdirSync(resolve(downloadDir), { recursive: true });
  }
  if (existsSync(resolve(databasesDir)) == false) {
    mkdirSync(resolve(databasesDir), { recursive: true });
  }
}

/** Token only generated by @botfather*/
let BOT_TOKEN: string = process.env.BOT_TOKEN;
/** ID of the BOT account*/
let BOT_ID: number = parseInt(process.env.BOT_ID);
/** BOT name*/
let BOT_NAME: string = process.env.BOT_NAME;
/** BOT @username*/
let BOT_USERNAME: string = process.env.BOT_USERNAME;
/** BOT Repository*/
let BOT_REPO: string = process.env.BOT_REPO;
/** Owner ID*/
let OWNER_ID: number = parseInt(process.env.OWNER_ID);
/** Owner Alias*/
let OWNER_NAME: string = process.env.OWNER_NAME;
/** Owner username*/
let OWNER_USERNAME: string = process.env.OWNER_USERNAME;
/** Token or Key generated by [alphavantage.co](https://www.alphavantage.co/documentation/)*/
let CURRENCY_KEY: string = process.env.CURRENCY_KEY;
/** Public or private channel to receive bot logs*/
let LOG_CHANEL: string = process.env.LOG_CHANEL;
/** Anonymus/Public supabase url*/
let SUPABASE_URL: string = process.env.SUPABASE_URL;
/** Secret key for your bot project*/
let SUPABASE_KEY: string = process.env.SUPABASE_KEY;


/** Magisk Repository URL*/
export const MAGISK_API: string =
  'https://raw.githubusercontent.com/topjohnwu/magisk-files/master';
/** Github Public API*/
export const GITHUB_API: string = 'https://api.github.com';
/** Samsung Unofficial Published API*/
export const SAMSUNG_API: string =
  'http://fota-cloud-dn.ospserver.net/firmware';
/** Twrp Recovery Official API*/
export const TWRP_API: string = 'https://eu.dl.twrp.me';
/** Official API by Alphavantage.co*/
export const CURRENCY_API = ({ orig, dest }: CurrencyI): string =>
  `https://www.alphavantage.co/query` +
  `?function=CURRENCY_EXCHANGE_RATE` +
  `&from_currency=${orig}` +
  `&to_currency=${dest}` +
  `&apikey=${CURRENCY_KEY}`;

/** Regular expression for get simple or special params*/
export const argRegex = /--\w+:?\w+/gi;

/**
 * Function looking for variables
 * Environment in the .env file or
 * in the system.
 */
export function enviroment(): void {
  const env: NodeJS.ProcessEnv = process.env;
  const enVars: string[] = [
    'BOT_TOKEN',
    'BOT_ID',
    'BOT_NAME',
    'BOT_USERNAME',
    'BOT_REPO',
    'OWNER_ID',
    'OWNER_NAME',
    'OWNER_USERNAME',
    'CURRENCY_KEY',
    'LOG_CHANEL',
    'SUPABASE_URL',
    'SUPABASE_KEY',
  ];
  enVars.forEach((e) => {
    if (!env[e] || env[e].length === 0) {
      return noEnv(env[e]);
    }
  });
}

export {
  BOT_TOKEN,
  BOT_NAME,
  BOT_USERNAME,
  BOT_REPO,
  BOT_ID,
  OWNER_ID,
  OWNER_NAME,
  OWNER_USERNAME,
  CURRENCY_KEY,
  LOG_CHANEL,
  SUPABASE_URL,
  SUPABASE_KEY,
};
