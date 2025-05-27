import { config } from "dotenv";

// Load environment variables from .env file
config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

export { DISCORD_TOKEN, CLIENT_ID };