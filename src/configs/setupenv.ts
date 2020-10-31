import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.BOT_IDENTITY || ![ `test`, `main` ].includes(process.env.BOT_IDENTITY)) throw new Error(`BOT_IDENTITY is not defined!`);

const DB_MODES = [ `test`, `development`, `production` ];
if (!process.env.MODE && !DB_MODES.includes(process.env.MODE as typeof DB_MODES[number])) throw new Error(`MODE env is not defined!`);

if (!process.env.DB_WEBHOOK_ENCRYPTION_TOKEN) throw new Error(`DB_WEBHOOK_ENCRYPTION_TOKEN is not defined!`);

if (!process.env.BOT_PREFIX) throw new Error(`BOT_PREFIX is not defined!`);

if (!process.env.BOT_TOKEN) throw new Error(`BOT_TOKEN env is not defined!`);