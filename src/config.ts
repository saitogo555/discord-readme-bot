import { config } from "dotenv";

// .envファイルを読み込む
config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const CLIENT_ID = process.env.CLIENT_ID || "";
export const READ_REACTION_EMOJI = process.env.READ_REACTION_EMOJI || "👀";